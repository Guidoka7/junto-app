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
create table if not exists junto_private.solo_transfers (
  source_space_id uuid not null references junto_private.spaces(id) on delete cascade,
  target_space_id uuid not null references junto_private.spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  transferred_at timestamptz not null default now(),
  primary key(source_space_id,target_space_id)
);
create table if not exists junto_private.personal_archives (
  space_id uuid not null references junto_private.spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key(space_id,user_id)
);
alter table public.junto_members enable row level security;
alter table public.junto_snapshots enable row level security;
alter table junto_private.spaces enable row level security;
alter table junto_private.invites enable row level security;
alter table junto_private.join_attempts enable row level security;
alter table junto_private.solo_transfers enable row level security;
alter table junto_private.personal_archives enable row level security;
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

-- Imported IDs remain stable on retries and cannot collide with the other
-- person's records. Relationships use the very same mapping as record IDs.
create or replace function junto_private.transfer_id(p_id text,p_source uuid) returns text language sql immutable security invoker set search_path='' as $$
  select 'solo:'||p_source::text||':'||encode(sha256(convert_to(p_id,'UTF8')),'hex')
$$;

create or replace function junto_private.remap_solo(p_value jsonb,p_source uuid,p_field text default '',p_parent text default '') returns jsonb language plpgsql immutable security invoker set search_path='' as $$
declare result jsonb; entry record;
begin
  if jsonb_typeof(p_value)='object' then
    result:='{}'::jsonb;
    for entry in select * from jsonb_each(p_value) loop
      result:=result||jsonb_build_object(entry.key,junto_private.remap_solo(entry.value,p_source,entry.key,p_field));
    end loop;
    return result;
  elsif jsonb_typeof(p_value)='array' then
    select coalesce(jsonb_agg(junto_private.remap_solo(value,p_source,p_field,p_parent) order by ord),'[]'::jsonb) into result
      from jsonb_array_elements(p_value) with ordinality as items(value,ord);
    return result;
  elsif jsonb_typeof(p_value)='string' then
    if p_field=any(array['payer','person','actor','by','to','from','author','recipient','owner','userId','personId','cheers']) or (p_field='id' and p_parent='split') then
      if p_value='"a"'::jsonb then return '"b"'::jsonb; elsif p_value='"b"'::jsonb then return '"a"'::jsonb; end if;
    elsif p_field=any(array['billId','goalId','incomeId','requestId','recurringKey','recordId']) and length(p_value#>>'{}')>0 then
      return to_jsonb(junto_private.transfer_id(p_value#>>'{}',p_source));
    end if;
  end if;
  return p_value;
end $$;

create or replace function junto_private.merge_solo(p_target jsonb,p_solo jsonb,p_source uuid,p_name text,p_restore_balance boolean) returns jsonb language plpgsql security invoker set search_path='' as $$
declare data jsonb:=p_target; k text; imported jsonb; old_profile jsonb; new_profile jsonb; prefs jsonb; source_prefs jsonb; caps jsonb; cap record;
begin
  perform junto_private.validate_payload(p_target);perform junto_private.validate_payload(p_solo);
  if jsonb_array_length(p_solo->'users')!=1 or p_solo->'users'->0->>'id'!='a' then raise exception 'INVALID_SOLO_PROFILE'; end if;
  select u into old_profile from jsonb_array_elements(p_target->'users') u where u->>'id'='b';
  if old_profile is null then raise exception 'MISSING_MEMBER_PROFILE'; end if;
  new_profile:=(p_solo->'users'->0)||old_profile||jsonb_build_object('id','b','name',p_name);
  if p_restore_balance then new_profile:=jsonb_set(new_profile,'{balance}',p_solo->'users'->0->'balance'); end if;
  data:=jsonb_set(data,'{users}',(select jsonb_agg(case when u->>'id'='b' then new_profile else u end order by ord) from jsonb_array_elements(data->'users') with ordinality as profiles(u,ord)));
  foreach k in array array['bills','goals','transactions','requests','notifications','activity','incomes','received','saves','challenges','commitments','bankImports'] loop
    select coalesce(jsonb_agg(case when k='bankImports' then junto_private.remap_solo(row,p_source) else jsonb_set(junto_private.remap_solo(row,p_source),'{id}',to_jsonb(junto_private.transfer_id(row->>'id',p_source))) end order by ord),'[]'::jsonb)
      into imported from jsonb_array_elements(coalesce(p_solo->k,'[]'::jsonb)) with ordinality as records(row,ord);
    -- Bank notification fingerprints must stay intact so the device cannot
    -- import the same notification again after moving to the shared space.
    select coalesce(jsonb_agg(row order by ord),'[]'::jsonb) into imported
      from jsonb_array_elements(imported) with ordinality as records(row,ord)
      where not exists(select 1 from jsonb_array_elements(coalesce(data->k,'[]'::jsonb)) existing where existing->>'id'=row->>'id');
    data:=jsonb_set(data,array[k],coalesce(data->k,'[]'::jsonb)||imported);
  end loop;
  data:=jsonb_set(data,'{learned}',coalesce(p_solo->'learned','{}'::jsonb)||coalesce(data->'learned','{}'::jsonb));
  caps:=coalesce(data->'budgets','{}'::jsonb);
  for cap in select * from jsonb_each(coalesce(p_solo->'budgets','{}'::jsonb)) loop
    if jsonb_typeof(cap.value)='number' and jsonb_typeof(caps->cap.key)='number' then
      caps:=jsonb_set(caps,array[cap.key],to_jsonb((cap.value#>>'{}')::numeric+(caps->>cap.key)::numeric));
    elsif not caps ? cap.key then caps:=caps||jsonb_build_object(cap.key,cap.value); end if;
  end loop;
  data:=jsonb_set(data,'{budgets}',caps);
  source_prefs:=coalesce(p_solo->'settings','{}'::jsonb);prefs:=source_prefs||coalesce(data->'settings','{}'::jsonb);
  prefs:=prefs||jsonb_build_object('personalEstimates',coalesce(data->'settings'->'personalEstimates',jsonb_build_object('a',coalesce(data->'settings'->'variableEstimate','0'::jsonb)))||jsonb_build_object('b',coalesce(source_prefs->'personalEstimates'->'a',source_prefs->'variableEstimate','0'::jsonb)),
    'personalBudgets',coalesce(data->'settings'->'personalBudgets',jsonb_build_object('a',coalesce(p_target->'budgets','{}'::jsonb)))||jsonb_build_object('b',coalesce(source_prefs->'personalBudgets'->'a',p_solo->'budgets','{}'::jsonb)));
  if source_prefs->'personalBudget'->'a' is not null then
    prefs:=jsonb_set(prefs,'{personalBudget}',coalesce(data->'settings'->'personalBudget','{}'::jsonb)||jsonb_build_object('b',source_prefs->'personalBudget'->'a'));
  end if;
  if length(coalesce(data->'settings'->>'couplePhoto',''))=0 and length(coalesce(source_prefs->>'couplePhoto',''))>0 then
    prefs:=prefs||jsonb_build_object('couplePhoto',source_prefs->'couplePhoto','profileZoom',coalesce(source_prefs->'profileZoom','1.08'::jsonb),'profileY',coalesce(source_prefs->'profileY','50'::jsonb));
  end if;
  if p_solo->'plan' is not null and p_solo->'plan'!='null'::jsonb then
    imported:=junto_private.remap_solo(p_solo->'plan',p_source);
    if data->'plan' is null or data->'plan'='null'::jsonb then data:=jsonb_set(data,'{plan}',imported);
    else prefs:=jsonb_set(prefs,'{personalPlans}',coalesce(prefs->'personalPlans','{}'::jsonb)||jsonb_build_object('b',imported)); end if;
  end if;
  data:=jsonb_set(data,'{settings}',prefs);
  data:=jsonb_set(data,'{updatedAt}',to_jsonb((extract(epoch from now())*1000)::bigint));
  perform junto_private.validate_payload(data);return data;
end $$;

-- Financial perspectives are copies: never recalculate or debit cash on a split.
create or replace function junto_private.personal_share(p_row jsonb,p_data jsonb,p_slot text) returns numeric language plpgsql immutable security invoker set search_path='' as $$
declare amount numeric:=coalesce((p_row->>'amount')::numeric,0); ratio numeric:=.5; a numeric; total_income numeric; a_income numeric;
begin
  if jsonb_typeof(p_row->'split')='array' then return coalesce((select (x->>'amount')::numeric from jsonb_array_elements(p_row->'split') x where x->>'id'=p_slot limit 1),0); end if;
  if p_row->>'payer'=p_slot then return amount; end if;
  if p_row->>'payer' not in ('half','prop') or p_row->>'payer' is null then return 0; end if;
  if p_row->>'payer'='prop' then
    select coalesce(sum((i->>'amount')::numeric*case when i->>'rule'='weekly' then 4.333333333 else 1 end),0),coalesce(sum((i->>'amount')::numeric*case when i->>'rule'='weekly' then 4.333333333 else 1 end) filter(where i->>'person'='a'),0)
      into total_income,a_income from jsonb_array_elements(coalesce(p_data->'incomes','[]'::jsonb)) i;
    if total_income>0 then ratio:=a_income/total_income; end if;
  end if;
  a:=round(amount*ratio);return case when p_slot='a' then a else amount-a end;
end $$;

create or replace function junto_private.solo_roles(p_value jsonb,p_slot text,p_field text default '',p_parent text default '') returns jsonb language plpgsql immutable security invoker set search_path='' as $$
declare result jsonb; item record;
begin
  if jsonb_typeof(p_value)='object' then
    result:='{}'::jsonb;for item in select * from jsonb_each(p_value) loop result:=result||jsonb_build_object(item.key,junto_private.solo_roles(item.value,p_slot,item.key,p_field));end loop;return result;
  elsif jsonb_typeof(p_value)='array' then
    select coalesce(jsonb_agg(junto_private.solo_roles(value,p_slot,p_field,p_parent) order by ord),'[]'::jsonb) into result from jsonb_array_elements(p_value) with ordinality as entries(value,ord);return result;
  elsif jsonb_typeof(p_value)='string' and (p_field=any(array['payer','person','actor','by','to','from','author','recipient','owner','userId','personId','cheers']) or (p_field='id' and p_parent='split')) then
    if p_value=to_jsonb(p_slot) or p_value='"both"'::jsonb then return '"a"'::jsonb;
    elsif p_value in ('"a"'::jsonb,'"b"'::jsonb) then return '"b"'::jsonb;end if;
  end if;
  return p_value;
end $$;

create or replace function junto_private.personal_payload(p_data jsonb,p_slot text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb:=p_data; k text; entry jsonb; row jsonb; rows jsonb; amount numeric; own_income boolean; saved_total numeric; saved_a numeric; saved_part numeric; prefs jsonb; ids jsonb;
begin
  perform junto_private.validate_payload(p_data);
  if p_slot not in ('a','b') or not exists(select 1 from jsonb_array_elements(p_data->'users') u where u->>'id'=p_slot) then raise exception 'MISSING_MEMBER_PROFILE';end if;
  result:=jsonb_set(result,'{users}',jsonb_build_array((select u||jsonb_build_object('id','a') from jsonb_array_elements(p_data->'users') u where u->>'id'=p_slot)));
  foreach k in array array['transactions','bills','incomes','received','saves','goals','requests','notifications','activity','commitments','challenges'] loop
    rows:='[]'::jsonb;
    for entry in select value from jsonb_array_elements(coalesce(p_data->k,'[]'::jsonb)) loop
      row:=entry;
      own_income:=exists(select 1 from jsonb_array_elements(coalesce(p_data->'incomes','[]'::jsonb)) i where i->>'id'=entry->>'incomeId' and i->>'person'=p_slot);
      if k in ('transactions','bills') then
        amount:=junto_private.personal_share(entry,p_data,p_slot);if amount<=0 then continue;end if;
        row:=row||jsonb_build_object('amount',amount,'payer',p_slot,'split',jsonb_build_array(jsonb_build_object('id',p_slot,'amount',amount)));
        if entry ? 'balanceDelta' then row:=jsonb_set(row,'{balanceDelta}',to_jsonb(case when (entry->>'amount')::numeric<=0 then 0 when p_slot='a' then round((entry->>'balanceDelta')::numeric*amount/(entry->>'amount')::numeric) else (entry->>'balanceDelta')::numeric-round((entry->>'balanceDelta')::numeric*junto_private.personal_share(entry,p_data,'a')/(entry->>'amount')::numeric) end));end if;
      elsif k='incomes' and entry->>'person' is distinct from p_slot then continue;
      elsif k in ('received','saves') and coalesce(entry->>'person',entry->>'actor','')<>p_slot and not own_income then continue;
      elsif k='goals' then
        select coalesce(sum((s->>'amount')::numeric),0),coalesce(sum((s->>'amount')::numeric) filter(where s->>'actor'='a' or (s->>'actor' is null and exists(select 1 from jsonb_array_elements(coalesce(p_data->'incomes','[]'::jsonb)) i where i->>'id'=s->>'incomeId' and i->>'person'='a'))),0)
          into saved_total,saved_a from jsonb_array_elements(coalesce(p_data->'saves','[]'::jsonb)) s where s->>'goalId'=entry->>'id';
        saved_part:=round((entry->>'saved')::numeric*case when saved_total>0 then saved_a/saved_total else .5 end);
        if p_slot='b' then saved_part:=(entry->>'saved')::numeric-saved_part;end if;
        row:=jsonb_set(row,'{saved}',to_jsonb(saved_part));
      elsif k='requests' then
        if entry->>'author'<>p_slot and entry->>'recipient'<>p_slot then continue;end if;
        if entry->>'status' in ('pending','approved') then row:=row||jsonb_build_object('status','cancelled','cancelReason','Dupla desconectada');end if;
      elsif k='notifications' then if entry->>'to' is distinct from p_slot then continue;end if;row:=row||'{"read":true}'::jsonb;
      elsif k='activity' and entry->>'actor' is distinct from p_slot and entry->>'scope' is distinct from 'shared' then continue;
      elsif k in ('commitments','challenges') and entry->>'person' not in (p_slot,'both') then continue;
      end if;
      rows:=rows||jsonb_build_array(junto_private.solo_roles(row,p_slot));
    end loop;
    result:=jsonb_set(result,array[k],rows);
  end loop;
  select coalesce(jsonb_agg(r->>'id'),'[]'::jsonb) into ids from (select value as r from jsonb_array_elements(result->'transactions') union all select value from jsonb_array_elements(result->'received') union all select value from jsonb_array_elements(result->'bills')) records;
  result:=jsonb_set(result,'{bankImports}',(select coalesce(jsonb_agg(item),'[]'::jsonb) from jsonb_array_elements(coalesce(p_data->'bankImports','[]'::jsonb)) item where item->>'recordId' is null or ids ? (item->>'recordId')));
  prefs:=coalesce(p_data->'settings','{}'::jsonb)-array['personalBudget','personalBudgets','personalEstimates','personalPlans'];
  prefs:=prefs||jsonb_build_object('variableEstimate',coalesce(p_data->'settings'->'personalEstimates'->p_slot,p_data->'settings'->'variableEstimate','0'::jsonb),'personalBudget',jsonb_build_object('a',coalesce(p_data->'settings'->'personalBudget'->p_slot,'{}'::jsonb)));
  result:=jsonb_set(result,'{settings}',prefs);result:=jsonb_set(result,'{budgets}',coalesce(p_data->'settings'->'personalBudgets'->p_slot,p_data->'budgets','{}'::jsonb));
  if p_data->'plan' is not null and p_data->'plan'<>'null'::jsonb then
    result:=jsonb_set(result,'{plan}',junto_private.solo_roles(p_data->'plan',p_slot)||jsonb_build_object('monthly',case when p_slot='a' then round((p_data->'plan'->>'monthly')::numeric/2) else (p_data->'plan'->>'monthly')::numeric-round((p_data->'plan'->>'monthly')::numeric/2) end));
  end if;
  result:=jsonb_set(result,'{updatedAt}',to_jsonb((extract(epoch from now())*1000)::bigint));perform junto_private.validate_payload(result);return result;
end $$;

create or replace function junto_private.disconnect_space(p_space_id uuid,p_revision bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); member public.junto_members%rowtype; original public.junto_snapshots%rowtype; solo_id uuid; personal jsonb;
begin
  -- Follow the same lock order as join; both members move atomically.
  perform 1 from auth.users where id in (select user_id from public.junto_members where space_id=p_space_id) order by id for update;
  if not exists(select 1 from public.junto_members where space_id=p_space_id and user_id=uid) then
    if exists(select 1 from junto_private.personal_archives where space_id=p_space_id and user_id=uid) then return junto_private.read_space();end if;
    raise exception 'ACCESS_DENIED' using errcode='42501';
  end if;
  perform 1 from junto_private.spaces where id=p_space_id for update;
  select * into original from public.junto_snapshots where space_id=p_space_id for update;
  if original.revision is distinct from p_revision then raise exception 'DISCONNECT_CHANGED';end if;
  if (select count(*) from public.junto_members where space_id=p_space_id)<>2 then raise exception 'NOT_PAIRED';end if;
  for member in select * from public.junto_members where space_id=p_space_id order by slot loop
    personal:=junto_private.personal_payload(original.payload,member.slot);
    insert into junto_private.personal_archives(space_id,user_id,payload) values(p_space_id,member.user_id,personal);
    insert into junto_private.spaces(owner_id) values(member.user_id) returning id into solo_id;
    insert into public.junto_snapshots(space_id,payload) values(solo_id,personal);
    update public.junto_members set space_id=solo_id,slot='a' where user_id=member.user_id;
  end loop;
  update junto_private.invites set used_at=coalesce(used_at,now()) where space_id=p_space_id;
  -- Retain the old ledger as an immutable private backup. Notify old subscriptions.
  update public.junto_snapshots set revision=revision+1,updated_at=now() where space_id=p_space_id;
  return junto_private.read_space();
end $$;

create or replace function junto_private.read_space() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); result jsonb;
begin
  select jsonb_build_object('space_id',s.space_id,'revision',s.revision,'payload',s.payload,'slot',m.slot,'members',(select count(*) from public.junto_members x where x.space_id=s.space_id),'updated_at',s.updated_at,
    'personal_archive_pending',m.slot='b' and exists(select 1 from junto_private.spaces old join public.junto_snapshots previous on previous.space_id=old.id where old.owner_id=uid and jsonb_array_length(previous.payload->'users')=1 and not exists(select 1 from public.junto_members member where member.space_id=old.id) and not exists(select 1 from junto_private.solo_transfers done where done.source_space_id=old.id)))
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
declare uid uuid:=junto_private.require_user(); token text:=upper(regexp_replace(trim(p_code),'[[:space:]-]','','g')); inv junto_private.invites%rowtype; previous public.junto_members%rowtype; data jsonb; personal jsonb; partner jsonb; tries integer;
begin
  perform 1 from auth.users where id=uid for update;
  select * into previous from public.junto_members where user_id=uid;
  if previous.slot='b' then return jsonb_build_object('error','ALREADY_MEMBER'); end if;
  if p_name is null or length(trim(p_name)) not between 1 and 24 then return jsonb_build_object('error','INVALID_NAME'); end if;
  insert into junto_private.join_attempts(user_id,window_start,attempts) values(uid,now(),1)
  on conflict(user_id) do update set attempts=case when junto_private.join_attempts.window_start<now()-interval '1 hour' then 1 else junto_private.join_attempts.attempts+1 end,
  window_start=case when junto_private.join_attempts.window_start<now()-interval '1 hour' then now() else junto_private.join_attempts.window_start end returning attempts into tries;
  if tries>10 then return jsonb_build_object('error','TOO_MANY_ATTEMPTS'); end if;
  if token is null or token !~ '^[A-F0-9]{16}$' then return jsonb_build_object('error','INVITE_INVALID'); end if;
  select * into inv from junto_private.invites where token_hash=encode(sha256(convert_to(token,'UTF8')),'hex');
  if not found or inv.used_at is not null or inv.expires_at<now() then return jsonb_build_object('error','INVITE_INVALID'); end if;
  if previous.space_id=inv.space_id then return jsonb_build_object('error','INVITE_OWN'); end if;
  -- Always lock spaces before invitations, in the same order, including when
  -- two solo owners try to accept one another's invitations simultaneously.
  perform 1 from junto_private.spaces where id in (inv.space_id,previous.space_id) order by id for update;
  select * into inv from junto_private.invites where token_hash=encode(sha256(convert_to(token,'UTF8')),'hex') for update;
  if not found or inv.used_at is not null or inv.expires_at<now() then return jsonb_build_object('error','INVITE_INVALID'); end if;
  if previous.space_id is not null and (
    (select count(*) from public.junto_members where space_id=previous.space_id)!=1
    or not exists(select 1 from junto_private.spaces where id=previous.space_id and owner_id=uid)
  ) then return jsonb_build_object('error','ALREADY_MEMBER'); end if;
  if not exists(select 1 from public.junto_members where space_id=inv.space_id and slot='a') then return jsonb_build_object('error','INVITE_INVALID'); end if;
  if (select count(*) from public.junto_members where space_id=inv.space_id)>=2 then return jsonb_build_object('error','COUPLE_FULL'); end if;
  perform 1 from public.junto_snapshots where space_id in (inv.space_id,previous.space_id) order by space_id for update;
  select payload into data from public.junto_snapshots where space_id=inv.space_id for update;
  select u into partner from jsonb_array_elements(data->'users') u where u->>'id'='b';
  partner:=coalesce(partner,jsonb_build_object('id','b','balance',0,'tone','pink'))||jsonb_build_object('name',trim(p_name));
  data:=jsonb_set(data,'{users}',(select jsonb_agg(u) from jsonb_array_elements(data->'users') u where u->>'id'='a')||jsonb_build_array(partner));
  data:=jsonb_set(data,'{updatedAt}',to_jsonb((extract(epoch from now())*1000)::bigint));
  if previous.space_id is not null then
    select payload into personal from public.junto_snapshots where space_id=previous.space_id;
    data:=junto_private.merge_solo(data,personal,previous.space_id,trim(p_name),true);
    insert into junto_private.solo_transfers(source_space_id,target_space_id,user_id) values(previous.space_id,inv.space_id,uid);
    -- Keep the solo snapshot as an owner-only archive; never erase finances.
    update junto_private.invites set used_at=now() where space_id=previous.space_id and used_at is null;
    delete from public.junto_members where user_id=uid and space_id=previous.space_id;
  end if;
  insert into public.junto_members(space_id,user_id,slot) values(inv.space_id,uid,'b');
  update public.junto_snapshots set payload=data,revision=revision+1,updated_at=now() where space_id=inv.space_id;
  update junto_private.invites set used_at=now() where token_hash=inv.token_hash;
  return junto_private.read_space();
end $$;

create or replace function junto_private.read_personal_archive() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); data jsonb;
begin
  select archive.payload into data from (
    select snapshot.payload,snapshot.updated_at as archived_at from junto_private.spaces space join public.junto_snapshots snapshot on snapshot.space_id=space.id
      where space.owner_id=uid and jsonb_array_length(snapshot.payload->'users')=1 and not exists(select 1 from public.junto_members member where member.space_id=space.id)
    union all select personal.payload,personal.created_at from junto_private.personal_archives personal where personal.user_id=uid
  ) archive order by archive.archived_at desc limit 1;
  return data;
end $$;

create or replace function junto_private.restore_personal_archive(p_revision bigint,p_restore_balance boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); member public.junto_members%rowtype; source_id uuid; current public.junto_snapshots%rowtype; personal jsonb; data jsonb; name text;
begin
  perform 1 from auth.users where id=uid for update;
  select * into member from public.junto_members where user_id=uid;
  if member.slot is distinct from 'b' then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  select old.id into source_id from junto_private.spaces old join public.junto_snapshots s on s.space_id=old.id
    where old.owner_id=uid and jsonb_array_length(s.payload->'users')=1 and not exists(select 1 from public.junto_members m where m.space_id=old.id)
      and not exists(select 1 from junto_private.solo_transfers done where done.source_space_id=old.id)
    order by s.updated_at desc,old.created_at desc limit 1;
  if source_id is null then return junto_private.read_space(); end if;
  perform 1 from junto_private.spaces where id in (member.space_id,source_id) order by id for update;
  perform 1 from public.junto_snapshots where space_id in (member.space_id,source_id) order by space_id for update;
  if not exists(select 1 from public.junto_members where user_id=uid and space_id=member.space_id and slot='b') then raise exception 'ACCESS_DENIED'; end if;
  select * into current from public.junto_snapshots where space_id=member.space_id;
  if current.revision is distinct from p_revision then raise exception 'RESTORE_CHANGED'; end if;
  select payload into personal from public.junto_snapshots where space_id=source_id;
  select u->>'name' into name from jsonb_array_elements(current.payload->'users') u where u->>'id'='b';
  data:=junto_private.merge_solo(current.payload,personal,source_id,name,false);
  -- A legacy join started this profile at zero. Keep movements made since
  -- joining when bringing back the opening balance from the solo archive.
  if coalesce(p_restore_balance,false) then
    data:=jsonb_set(data,'{users}',(select jsonb_agg(case when u->>'id'='b' then jsonb_set(u,'{balance}',to_jsonb((u->>'balance')::numeric+(personal->'users'->0->>'balance')::numeric)) else u end order by ord) from jsonb_array_elements(data->'users') with ordinality as profiles(u,ord)));
    perform junto_private.validate_payload(data);
  end if;
  update public.junto_snapshots set payload=data,revision=revision+1,updated_at=now() where space_id=member.space_id;
  insert into junto_private.solo_transfers(source_space_id,target_space_id,user_id) values(source_id,member.space_id,uid);
  return junto_private.read_space();
end $$;

create or replace function junto_private.sync_space(p_space_id uuid,p_revision bigint,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=junto_private.require_user(); current public.junto_snapshots%rowtype;
begin
  if not exists(select 1 from public.junto_members where space_id=p_space_id and user_id=uid) then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  perform junto_private.validate_payload(p_payload);
  select * into current from public.junto_snapshots where space_id=p_space_id for update;
  if not exists(select 1 from public.junto_members where space_id=p_space_id and user_id=uid) then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  if exists(select 1 from public.junto_members m where m.space_id=p_space_id and not exists(select 1 from jsonb_array_elements(p_payload->'users') u where u->>'id'=m.slot)) then raise exception 'MISSING_MEMBER_PROFILE'; end if;
  if current.revision!=p_revision then return jsonb_build_object('conflict',true,'revision',current.revision,'payload',current.payload); end if;
  update public.junto_snapshots set payload=p_payload,revision=revision+1,updated_at=now() where space_id=p_space_id returning * into current;
  return jsonb_build_object('conflict',false,'revision',current.revision,'payload',current.payload,'updated_at',current.updated_at);
end $$;

create or replace function public.junto_read_space() returns jsonb language sql security invoker set search_path='' as $$ select junto_private.read_space() $$;
create or replace function public.junto_create_space(p_name text,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.create_space(p_name,p_payload) $$;
create or replace function public.junto_make_invite(p_space_id uuid) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.make_invite(p_space_id) $$;
create or replace function public.junto_join_space(p_code text,p_name text) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.join_space(p_code,p_name) $$;
create or replace function public.junto_read_personal_archive() returns jsonb language sql security invoker set search_path='' as $$ select junto_private.read_personal_archive() $$;
create or replace function public.junto_restore_personal_archive(p_revision bigint,p_restore_balance boolean) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.restore_personal_archive(p_revision,p_restore_balance) $$;
create or replace function public.junto_sync_space(p_space_id uuid,p_revision bigint,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.sync_space(p_space_id,p_revision,p_payload) $$;
create or replace function public.junto_disconnect_space(p_space_id uuid,p_revision bigint) returns jsonb language sql security invoker set search_path='' as $$ select junto_private.disconnect_space(p_space_id,p_revision) $$;
create or replace function public.junto_personal_payload(p_payload jsonb,p_slot text) returns jsonb language plpgsql security invoker set search_path='' as $$ begin perform junto_private.require_user();return junto_private.personal_payload(p_payload,p_slot);end $$;
revoke all on all functions in schema junto_private from public,anon;
grant execute on all functions in schema junto_private to authenticated;
revoke all on function public.junto_read_space(),public.junto_create_space(text,jsonb),public.junto_make_invite(uuid),public.junto_join_space(text,text),public.junto_read_personal_archive(),public.junto_restore_personal_archive(bigint,boolean),public.junto_sync_space(uuid,bigint,jsonb) from public,anon;
grant execute on function public.junto_read_space(),public.junto_create_space(text,jsonb),public.junto_make_invite(uuid),public.junto_join_space(text,text),public.junto_read_personal_archive(),public.junto_restore_personal_archive(bigint,boolean),public.junto_sync_space(uuid,bigint,jsonb) to authenticated;
revoke all on function public.junto_disconnect_space(uuid,bigint),public.junto_personal_payload(jsonb,text) from public,anon;
grant execute on function public.junto_disconnect_space(uuid,bigint),public.junto_personal_payload(jsonb,text) to authenticated;
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='junto_snapshots') then
    alter publication supabase_realtime add table public.junto_snapshots;
  end if;
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='junto_members') then alter publication supabase_realtime add table public.junto_members;end if;
end $$;
commit;
