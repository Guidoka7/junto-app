-- Juntô 1.1 · execute in a DEDICATED Supabase project.
-- Public functions are SECURITY INVOKER wrappers. Privileged code and invite
-- hashes live in an unexposed schema and always check auth.uid().
begin;
create schema if not exists junto_private;
revoke all on schema junto_private from public, anon;
grant usage on schema junto_private to authenticated;

create table if not exists junto_private.spaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.junto_members (
  space_id uuid not null references junto_private.spaces(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  slot text not null check (slot in ('a','b')),
  primary key(space_id,user_id), unique(space_id,slot)
);
create table if not exists public.junto_snapshots (
  space_id uuid primary key references junto_private.spaces(id) on delete cascade,
  revision bigint not null default 1 check(revision>0),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists junto_private.invites (
  token_hash text primary key,
  space_id uuid not null references junto_private.spaces(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);
create index if not exists junto_invites_space_idx on junto_private.invites(space_id);
create table if not exists junto_private.join_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  attempts integer not null default 0
);
alter table public.junto_members enable row level security;
alter table public.junto_snapshots enable row level security;
alter table junto_private.spaces enable row level security;
alter table junto_private.invites enable row level security;
alter table junto_private.join_attempts enable row level security;
revoke all on public.junto_members,public.junto_snapshots from public,anon,authenticated;
grant select on public.junto_members,public.junto_snapshots to authenticated;
revoke all on all tables in schema junto_private from public,anon,authenticated;
drop policy if exists junto_own_membership on public.junto_members;
create policy junto_own_membership on public.junto_members for select to authenticated
  using (user_id=(select auth.uid()));
drop policy if exists junto_member_snapshot on public.junto_snapshots;
create policy junto_member_snapshot on public.junto_snapshots for select to authenticated
  using (exists(select 1 from public.junto_members m where m.space_id=junto_snapshots.space_id and m.user_id=(select auth.uid())));

create or replace function junto_private.require_user() returns uuid language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'LOGIN_REQUIRED' using errcode='42501'; end if;
  return uid;
end $$;

create or replace function junto_private.validate_payload(p jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare k text; item jsonb;
begin
  if p is null or jsonb_typeof(p)!='object' or p->>'schema' is distinct from '1' or octet_length(p::text)>8388608 then raise exception 'INVALID_PAYLOAD'; end if;
  if p - array['schema','updatedAt','users','bills','goals','transactions','requests','activity','notifications','demo','incomes','received','saves','plan','budgets','learned','commitments','settings','challenges','bankImports'] != '{}'::jsonb then raise exception 'INVALID_PAYLOAD_FIELDS'; end if;
  if p->'users' is null or jsonb_typeof(p->'users')!='array' or jsonb_array_length(p->'users') not between 1 and 2 then raise exception 'INVALID_USERS'; end if;
  if exists(select 1 from jsonb_array_elements(p->'users') u where u->>'id' not in ('a','b') or u->>'id' is null or length(u->>'name') not between 1 and 24 or u->>'name' is null or jsonb_typeof(u->'balance')!='number' or u->'balance' is null or abs((u->>'balance')::numeric)>9007199254740991 or (u->>'balance')::numeric!=trunc((u->>'balance')::numeric)) then raise exception 'INVALID_USERS'; end if;
  if (select count(distinct u->>'id') from jsonb_array_elements(p->'users') u)!=jsonb_array_length(p->'users') then raise exception 'DUPLICATE_USERS'; end if;
  foreach k in array array['bills','goals','transactions','requests','activity','notifications','incomes','received','saves','commitments','challenges','bankImports'] loop
    if p ? k then
      if jsonb_typeof(p->k)!='array' or jsonb_array_length(p->k)>50000 then raise exception 'INVALID_LIST'; end if;
      if exists(select 1 from jsonb_array_elements(p->k) row where jsonb_typeof(row)!='object' or row->>'id' is null or length(row->>'id') not between 1 and 250) then raise exception 'INVALID_RECORD'; end if;
      if (select count(distinct row->>'id') from jsonb_array_elements(p->k) row)!=jsonb_array_length(p->k) then raise exception 'DUPLICATE_RECORD'; end if;
      if exists(select 1 from jsonb_array_elements(p->k) row where row ? 'amount' and (jsonb_typeof(row->'amount')!='number' or (row->>'amount')::numeric<0 or (row->>'amount')::numeric>9007199254740991 or (row->>'amount')::numeric!=trunc((row->>'amount')::numeric))) then raise exception 'INVALID_AMOUNT'; end if;
    elsif k=any(array['bills','goals','transactions','requests','activity','notifications']) then raise exception 'MISSING_LIST'; end if;
  end loop;
end $$;

create or replace function junto_private.read_space() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); result jsonb;
begin
  select jsonb_build_object('space_id',s.space_id,'revision',s.revision,'payload',s.payload,'slot',m.slot,'members',(select count(*) from public.junto_members x where x.space_id=s.space_id),'updated_at',s.updated_at)
  into result from public.junto_members m join public.junto_snapshots s on s.space_id=m.space_id where m.user_id=uid;
  return result;
end $$;

create or replace function junto_private.create_space(p_name text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); sid uuid; data jsonb:=p_payload;
begin
  perform 1 from auth.users where id=uid for update;
  if exists(select 1 from public.junto_members where user_id=uid) then raise exception 'ALREADY_MEMBER'; end if;
  if length(trim(p_name)) not between 1 and 24 or p_name is null then raise exception 'INVALID_NAME'; end if;
  perform junto_private.validate_payload(data);
  if data->'users'->0->>'id'!='a' then raise exception 'INVALID_OWNER_PROFILE'; end if;
  data:=jsonb_set(data,'{users,0,name}',to_jsonb(trim(p_name)));
  data:=jsonb_set(data,'{demo}','false'::jsonb);
  insert into junto_private.spaces(owner_id) values(uid) returning id into sid;
  insert into public.junto_members(space_id,user_id,slot) values(sid,uid,'a');
  insert into public.junto_snapshots(space_id,payload) values(sid,data);
  return junto_private.read_space();
end $$;

create or replace function junto_private.make_invite(p_space_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); token text; until_time timestamptz:=now()+interval '48 hours';
begin
  perform 1 from junto_private.spaces where id=p_space_id and owner_id=uid for update;
  if not found then raise exception 'NOT_OWNER' using errcode='42501'; end if;
  if (select count(*) from public.junto_members where space_id=p_space_id)>=2 then raise exception 'COUPLE_FULL'; end if;
  update junto_private.invites set used_at=now() where space_id=p_space_id and used_at is null;
  token:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,16));
  insert into junto_private.invites(token_hash,space_id,expires_at) values(encode(sha256(convert_to(token,'UTF8')),'hex'),p_space_id,until_time);
  return jsonb_build_object('code',token,'expires_at',until_time);
end $$;

create or replace function junto_private.join_space(p_code text,p_name text) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); token text:=upper(regexp_replace(trim(p_code),'[ -]','','g')); inv junto_private.invites%rowtype; data jsonb; partner jsonb; tries integer;
begin
  perform 1 from auth.users where id=uid for update;
  if exists(select 1 from public.junto_members where user_id=uid) then return jsonb_build_object('error','ALREADY_MEMBER'); end if;
  if p_name is null or length(trim(p_name)) not between 1 and 24 then return jsonb_build_object('error','INVALID_NAME'); end if;
  insert into junto_private.join_attempts(user_id,window_start,attempts) values(uid,now(),1)
  on conflict(user_id) do update set attempts=case when junto_private.join_attempts.window_start<now()-interval '1 hour' then 1 else junto_private.join_attempts.attempts+1 end,
  window_start=case when junto_private.join_attempts.window_start<now()-interval '1 hour' then now() else junto_private.join_attempts.window_start end returning attempts into tries;
  if tries>10 then return jsonb_build_object('error','TOO_MANY_ATTEMPTS'); end if;
  if token is null or token !~ '^[A-F0-9]{16}$' then return jsonb_build_object('error','INVITE_INVALID'); end if;
  select * into inv from junto_private.invites where token_hash=encode(sha256(convert_to(token,'UTF8')),'hex') for update;
  if not found or inv.used_at is not null or inv.expires_at<now() then return jsonb_build_object('error','INVITE_INVALID'); end if;
  perform 1 from junto_private.spaces where id=inv.space_id for update;
  if (select count(*) from public.junto_members where space_id=inv.space_id)>=2 then return jsonb_build_object('error','COUPLE_FULL'); end if;
  select payload into data from public.junto_snapshots where space_id=inv.space_id for update;
  select u into partner from jsonb_array_elements(data->'users') u where u->>'id'='b';
  partner:=coalesce(partner,jsonb_build_object('id','b','balance',0,'tone','pink'))||jsonb_build_object('name',trim(p_name));
  data:=jsonb_set(data,'{users}',(select jsonb_agg(u) from jsonb_array_elements(data->'users') u where u->>'id'='a')||jsonb_build_array(partner));
  data:=jsonb_set(data,'{updatedAt}',to_jsonb((extract(epoch from now())*1000)::bigint));
  insert into public.junto_members(space_id,user_id,slot) values(inv.space_id,uid,'b');
  update public.junto_snapshots set payload=data,revision=revision+1,updated_at=now() where space_id=inv.space_id;
  update junto_private.invites set used_at=now() where token_hash=inv.token_hash;
  return junto_private.read_space();
end $$;

create or replace function junto_private.sync_space(p_space_id uuid,p_revision bigint,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); current public.junto_snapshots%rowtype;
begin
  if not exists(select 1 from public.junto_members where space_id=p_space_id and user_id=uid) then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  perform junto_private.validate_payload(p_payload);
  if exists(select 1 from public.junto_members m where m.space_id=p_space_id and not exists(select 1 from jsonb_array_elements(p_payload->'users') u where u->>'id'=m.slot)) then raise exception 'MISSING_MEMBER_PROFILE'; end if;
  select * into current from public.junto_snapshots where space_id=p_space_id for update;
  if current.revision!=p_revision then return jsonb_build_object('conflict',true,'revision',current.revision,'payload',current.payload); end if;
  update public.junto_snapshots set payload=p_payload,revision=revision+1,updated_at=now() where space_id=p_space_id returning * into current;
  return jsonb_build_object('conflict',false,'revision',current.revision,'payload',current.payload,'updated_at',current.updated_at);
end $$;

create or replace function public.junto_read_space() returns jsonb language sql security invoker set search_path='' as $$ select junto_private.read_space() $$;
create or replace function public.junto_create_space(p_name text,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.create_space(p_name,p_payload) $$;
create or replace function public.junto_make_invite(p_space_id uuid) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.make_invite(p_space_id) $$;
create or replace function public.junto_join_space(p_code text,p_name text) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.join_space(p_code,p_name) $$;
create or replace function public.junto_sync_space(p_space_id uuid,p_revision bigint,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.sync_space(p_space_id,p_revision,p_payload) $$;
revoke all on all functions in schema junto_private from public,anon;
grant execute on all functions in schema junto_private to authenticated;
revoke all on function public.junto_read_space(),public.junto_create_space(text,jsonb),public.junto_make_invite(uuid),public.junto_join_space(text,text),public.junto_sync_space(uuid,bigint,jsonb) from public,anon;
grant execute on function public.junto_read_space(),public.junto_create_space(text,jsonb),public.junto_make_invite(uuid),public.junto_join_space(text,text),public.junto_sync_space(uuid,bigint,jsonb) to authenticated;
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='junto_snapshots') then
    alter publication supabase_realtime add table public.junto_snapshots;
  end if;
end $$;
commit;
