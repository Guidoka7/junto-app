-- Juntô · dispositivos Firebase Cloud Messaging (APK Android)
-- Executar no SQL Editor do Supabase do Juntô, depois do setup.sql existente.
-- Não altera saldos, transações, convites, permissões da dupla ou tabelas existentes.

create table if not exists public.junto_push_devices (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  token text not null unique,
  platform text not null default 'android' check (platform in ('android', 'ios')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint junto_push_devices_pkey primary key (user_id, device_id),
  constraint junto_push_token_length check (char_length(token) between 32 and 4096)
);

alter table public.junto_push_devices enable row level security;
revoke all on public.junto_push_devices from public, anon, authenticated;
grant select, insert, update, delete on public.junto_push_devices to authenticated;

drop policy if exists junto_push_devices_owner_select on public.junto_push_devices;
create policy junto_push_devices_owner_select
  on public.junto_push_devices for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists junto_push_devices_owner_insert on public.junto_push_devices;
create policy junto_push_devices_owner_insert
  on public.junto_push_devices for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists junto_push_devices_owner_update on public.junto_push_devices;
create policy junto_push_devices_owner_update
  on public.junto_push_devices for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists junto_push_devices_owner_delete on public.junto_push_devices;
create policy junto_push_devices_owner_delete
  on public.junto_push_devices for delete to authenticated
  using (user_id = (select auth.uid()));

-- O remetente FCM deve rodar SOMENTE em backend autenticado com credenciais de serviço.
-- Nunca conceda leitura transversal de tokens para clientes ou inclua Firebase Admin no APK.
