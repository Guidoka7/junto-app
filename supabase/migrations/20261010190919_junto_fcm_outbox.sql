-- PR #39: prepared and tested locally. Do not apply to production before APK QA.
-- Prerequisites: existing setup.sql + push-devices.sql. No financial RPC is replaced.
begin;

alter table public.junto_push_devices add column if not exists session_id uuid
  references auth.sessions(id) on delete cascade;
create index if not exists junto_push_devices_session_idx on public.junto_push_devices(session_id);
grant select, update on public.junto_push_devices to service_role;

-- The JWT, never a client-supplied session ID, binds a device to a live login.
create or replace function junto_private.bind_push_session() returns trigger
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); sid uuid;
begin
  if current_setting('role',true)='service_role' then return new; end if;
  if uid is null or new.user_id<>uid or auth.jwt()->>'is_anonymous'='true' then raise exception 'LOGIN_REQUIRED' using errcode='42501'; end if;
  sid:=nullif(auth.jwt()->>'session_id','')::uuid;
  if sid is null or not exists(select 1 from auth.sessions s where s.id=sid and s.user_id=uid and (s.not_after is null or s.not_after>now())) then
    raise exception 'SESSION_REQUIRED' using errcode='42501';
  end if;
  if new.enabled and (select count(*) from public.junto_push_devices d where d.user_id=uid and d.enabled and d.device_id<>new.device_id)>=5 then
    raise exception 'DEVICE_LIMIT';
  end if;
  new.session_id:=sid;
  new.updated_at:=now();
  return new;
end $$;
revoke all on function junto_private.bind_push_session() from public,anon,authenticated;
drop trigger if exists junto_push_bind_session on public.junto_push_devices;
create trigger junto_push_bind_session before insert or update on public.junto_push_devices
for each row execute function junto_private.bind_push_session();

create table if not exists junto_private.push_events (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references junto_private.spaces(id) on delete cascade,
  notification_id text not null check(length(notification_id) between 1 and 250),
  actor_id uuid not null references auth.users(id) on delete cascade,
  actor_slot text not null check(actor_slot in ('a','b')),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  recipient_slot text not null check(recipient_slot in ('a','b')),
  kind text not null check(kind in ('info','request','approved','declined','purchased','cancelled')),
  created_at timestamptz not null default now(),
  unique(space_id,notification_id),
  check(actor_id<>recipient_id and actor_slot<>recipient_slot)
);
create index if not exists junto_push_events_actor_idx on junto_private.push_events(actor_id,space_id,created_at);
create table if not exists junto_private.push_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references junto_private.push_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  token_hash text not null,
  session_id uuid not null,
  state text not null default 'pending' check(state in ('pending','processing','accepted','failed','unknown','skipped')),
  claim_id uuid,
  claimed_at timestamptz,
  finished_at timestamptz,
  code text,
  unique(event_id,user_id,device_id)
);
create index if not exists junto_push_delivery_pending_idx on junto_private.push_deliveries(event_id) where state='pending';
alter table junto_private.push_events enable row level security;
alter table junto_private.push_deliveries enable row level security;
revoke all on junto_private.push_events,junto_private.push_deliveries from public,anon,authenticated;
grant usage on schema junto_private to service_role;
grant select,insert,update on junto_private.push_events,junto_private.push_deliveries to service_role;
grant select on public.junto_members,public.junto_snapshots,auth.sessions to service_role;

-- Capture only new, recent, unread notices written by their authenticated author.
-- Joining, restoring old history, marking read and disconnecting never replay old IDs.
create or replace function junto_private.capture_push_events() returns trigger
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); actor_slot text; recipient uuid; n jsonb; r jsonb; kind text; count_new integer:=0;
begin
  if uid is null or jsonb_array_length(old.payload->'users')<>2 or jsonb_array_length(new.payload->'users')<>2 then return new; end if;
  select m.slot into actor_slot from public.junto_members m where m.space_id=new.space_id and m.user_id=uid;
  if actor_slot is null or (select count(*) from public.junto_members m where m.space_id=new.space_id)<>2 then return new; end if;
  for n in select value from jsonb_array_elements(new.payload->'notifications') loop
    if count_new>=20 then exit; end if;
    kind:=coalesce(n->>'kind','info');
    if n->>'from' is distinct from actor_slot or n->>'to' not in ('a','b') or n->>'to'=actor_slot or
       n->>'read' is distinct from 'false' or kind not in ('info','request','approved','declined','purchased','cancelled') or
       coalesce(n->>'createdAt','') !~ '^[0-9]{12,14}$' then continue; end if;
    if (n->>'createdAt')::bigint < extract(epoch from now()-interval '24 hours')*1000 or
       (n->>'createdAt')::bigint > extract(epoch from now()+interval '5 minutes')*1000 then continue; end if;
    if exists(select 1 from jsonb_array_elements(old.payload->'notifications') previous where previous->>'id'=n->>'id') then continue; end if;
    select m.user_id into recipient from public.junto_members m where m.space_id=new.space_id and m.slot=n->>'to';
    if recipient is null then continue; end if;
    if kind<>'info' then
      select value into r from jsonb_array_elements(new.payload->'requests') where value->>'id'=n->>'requestId';
      if r is null then continue; end if;
      if kind in ('approved','declined') then
        if r->>'author' is distinct from n->>'to' or r->>'recipient' is distinct from actor_slot or r->>'status' is distinct from kind then continue; end if;
      else
        if r->>'author' is distinct from actor_slot or r->>'recipient' is distinct from n->>'to' or
           r->>'status' is distinct from (case when kind='request' then 'pending' else kind end) then continue; end if;
      end if;
    end if;
    -- Bound abusive fan-out without causing a financial sync to fail.
    if (select count(*) from junto_private.push_events e where e.actor_id=uid and e.created_at>now()-interval '1 hour')>=120 then exit; end if;
    insert into junto_private.push_events(space_id,notification_id,actor_id,actor_slot,recipient_id,recipient_slot,kind)
      values(new.space_id,n->>'id',uid,actor_slot,recipient,n->>'to',kind) on conflict(space_id,notification_id) do nothing;
    count_new:=count_new+1;
  end loop;
  return new;
end $$;
revoke all on function junto_private.capture_push_events() from public,anon,authenticated;
drop trigger if exists junto_capture_push_events on public.junto_snapshots;
create trigger junto_capture_push_events after update of payload on public.junto_snapshots
for each row when (old.payload is distinct from new.payload) execute function junto_private.capture_push_events();

-- Service-only RPCs. The Edge Function supplies actor_id after auth.getUser validation.
-- These use the service role's existing privileges; no new public SECURITY DEFINER API.
create or replace function junto_private.push_claim(p_space_id uuid,p_actor_id uuid,p_session_id uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
  if current_setting('role',true) is distinct from 'service_role' then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  if not exists(select 1 from auth.sessions where id=p_session_id and user_id=p_actor_id and (not_after is null or not_after>now())) then raise exception 'SESSION_REQUIRED' using errcode='42501'; end if;
  if not exists(select 1 from public.junto_members where space_id=p_space_id and user_id=p_actor_id) then return '[]'::jsonb; end if;
  -- A crashed worker might already have sent. Never reclaim its delivery.
  update junto_private.push_deliveries d set state='unknown',code='WORKER_INTERRUPTED',finished_at=now()
    from junto_private.push_events e where e.id=d.event_id and e.space_id=p_space_id and e.actor_id=p_actor_id
    and d.state='processing' and d.claimed_at<now()-interval '5 minutes';
  insert into junto_private.push_deliveries(event_id,user_id,device_id,token_hash,session_id)
    select e.id,d.user_id,d.device_id,encode(sha256(convert_to(d.token,'UTF8')),'hex'),d.session_id
    from junto_private.push_events e
    join public.junto_members a on a.space_id=e.space_id and a.user_id=e.actor_id and a.slot=e.actor_slot
    join public.junto_members m on m.space_id=e.space_id and m.user_id=e.recipient_id and m.slot=e.recipient_slot
    join public.junto_push_devices d on d.user_id=e.recipient_id and d.enabled and d.platform='android' and d.created_at<=e.created_at
    join auth.sessions s on s.id=d.session_id and s.user_id=d.user_id and (s.not_after is null or s.not_after>now())
    join public.junto_snapshots snapshot on snapshot.space_id=e.space_id
    where e.actor_id=p_actor_id and e.space_id=p_space_id and e.created_at>now()-interval '24 hours'
      and exists(select 1 from jsonb_array_elements(snapshot.payload->'notifications') n where n->>'id'=e.notification_id and n->>'to'=e.recipient_slot and n->>'read'='false')
    on conflict(event_id,user_id,device_id) do nothing;
  with picked as (
    select d.id from junto_private.push_deliveries d join junto_private.push_events e on e.id=d.event_id
    where d.state='pending' and e.space_id=p_space_id and e.actor_id=p_actor_id and e.created_at>now()-interval '24 hours'
    order by e.created_at,d.id limit 10 for update of d skip locked
  ), claimed as (
    update junto_private.push_deliveries d set state='processing',claim_id=gen_random_uuid(),claimed_at=now()
    from picked where d.id=picked.id returning d.*
  )
  select coalesce(jsonb_agg(jsonb_build_object('delivery_id',d.id,'claim_id',d.claim_id,'event_id',e.id,
    'notification_id',e.notification_id,'kind',e.kind,'token',device.token)),'[]'::jsonb)
    into result from claimed d join junto_private.push_events e on e.id=d.event_id
    join public.junto_push_devices device on device.user_id=d.user_id and device.device_id=d.device_id;
  return result;
end $$;

create or replace function junto_private.push_active(p_delivery_id uuid,p_claim_id uuid) returns boolean
language sql security invoker set search_path='' as $$
  select current_setting('role',true)='service_role' and exists(
    select 1 from junto_private.push_deliveries d join junto_private.push_events e on e.id=d.event_id
    join public.junto_members a on a.space_id=e.space_id and a.user_id=e.actor_id and a.slot=e.actor_slot
    join public.junto_members m on m.space_id=e.space_id and m.user_id=e.recipient_id and m.slot=e.recipient_slot
    join public.junto_push_devices device on device.user_id=d.user_id and device.device_id=d.device_id
      and device.enabled and device.session_id=d.session_id and encode(sha256(convert_to(device.token,'UTF8')),'hex')=d.token_hash
    join auth.sessions s on s.id=device.session_id and s.user_id=device.user_id and (s.not_after is null or s.not_after>now())
    join public.junto_snapshots snapshot on snapshot.space_id=e.space_id
    where d.id=p_delivery_id and d.claim_id=p_claim_id and d.state='processing' and e.created_at>now()-interval '24 hours'
      and exists(select 1 from jsonb_array_elements(snapshot.payload->'notifications') n where n->>'id'=e.notification_id and n->>'to'=e.recipient_slot and n->>'read'='false')
  )
$$;

create or replace function junto_private.push_finish(p_delivery_id uuid,p_claim_id uuid,p_outcome text,p_code text,p_revoke boolean) returns boolean
language plpgsql security invoker set search_path='' as $$
declare d junto_private.push_deliveries%rowtype;
begin
  if current_setting('role',true) is distinct from 'service_role' then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  if p_outcome not in ('accepted','failed','unknown','skipped') or p_outcome is null then raise exception 'INVALID_OUTCOME'; end if;
  if p_code is not null and p_code not in ('UNREGISTERED','FCM_REJECTED','FCM_DELIVERY_UNCERTAIN','FCM_RESPONSE_INVALID','RECIPIENT_INACTIVE') then raise exception 'INVALID_CODE'; end if;
  update junto_private.push_deliveries set state=p_outcome,code=p_code,finished_at=now()
    where id=p_delivery_id and claim_id=p_claim_id and state='processing' returning * into d;
  if d.id is null then return false; end if;
  if p_revoke and p_outcome='failed' and p_code='UNREGISTERED' then
    update public.junto_push_devices device set enabled=false where device.user_id=d.user_id and device.device_id=d.device_id
      and encode(sha256(convert_to(device.token,'UTF8')),'hex')=d.token_hash and device.session_id=d.session_id;
  end if;
  return true;
end $$;

create or replace function public.junto_push_claim(p_space_id uuid,p_actor_id uuid,p_session_id uuid) returns jsonb
language sql security invoker set search_path='' as $$ select junto_private.push_claim(p_space_id,p_actor_id,p_session_id) $$;
create or replace function public.junto_push_active(p_delivery_id uuid,p_claim_id uuid) returns boolean
language sql security invoker set search_path='' as $$ select junto_private.push_active(p_delivery_id,p_claim_id) $$;
create or replace function public.junto_push_finish(p_delivery_id uuid,p_claim_id uuid,p_outcome text,p_code text,p_revoke boolean default false) returns boolean
language sql security invoker set search_path='' as $$ select junto_private.push_finish(p_delivery_id,p_claim_id,p_outcome,p_code,p_revoke) $$;
revoke all on function junto_private.push_claim(uuid,uuid,uuid),junto_private.push_active(uuid,uuid),junto_private.push_finish(uuid,uuid,text,text,boolean),
  public.junto_push_claim(uuid,uuid,uuid),public.junto_push_active(uuid,uuid),public.junto_push_finish(uuid,uuid,text,text,boolean) from public,anon,authenticated;
grant execute on function junto_private.push_claim(uuid,uuid,uuid),junto_private.push_active(uuid,uuid),junto_private.push_finish(uuid,uuid,text,text,boolean),
  public.junto_push_claim(uuid,uuid,uuid),public.junto_push_active(uuid,uuid),public.junto_push_finish(uuid,uuid,text,text,boolean) to service_role;
commit;
