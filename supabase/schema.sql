-- M2M core schema — run in Supabase SQL Editor (Database → SQL).

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text,
  auth_user_id uuid references auth.users (id) on delete cascade,
  role text not null default 'driver'
    check (role in ('driver', 'host', 'both')),
  created_at timestamptz not null default now(),
  constraint users_auth_or_wallet check (
    auth_user_id is not null or wallet_address is not null
  )
);

create unique index if not exists users_wallet_address_unique
  on public.users (wallet_address)
  where wallet_address is not null;

create unique index if not exists users_auth_user_id_unique
  on public.users (auth_user_id)
  where auth_user_id is not null;

create table if not exists public.chargers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users (id) on delete set null,
  lat double precision not null,
  lng double precision not null,
  price_per_kwh numeric(10, 4) not null,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'offline', 'charging', 'available')),
  label text,
  description text,
  created_at timestamptz not null default now()
);

-- ===== Phase 1 (wallet-first profiles) columns =====
alter table public.users
  add column if not exists display_name text;

alter table public.users
  add column if not exists vehicle_model text;

alter table public.users
  add column if not exists contact_method text;

alter table public.users
  add column if not exists email text;

-- Auth sync (see migration_phase14_user_auth_sync.sql). Passwords stay in auth.users only.
alter table public.users
  add column if not exists auth_provider text;

alter table public.users
  add column if not exists email_verified_at timestamptz;

alter table public.chargers
  add column if not exists title text;

alter table public.chargers
  add column if not exists plug_type text;

alter table public.chargers
  add column if not exists parking_instructions text;

alter table public.chargers
  add column if not exists active_driver_wallet text;

alter table public.chargers
  add column if not exists charger_brand_slug text;

-- Optional backfill so older seed data still renders nicely.
update public.chargers
set
  title = coalesce(title, label),
  plug_type = coalesce(plug_type, label),
  parking_instructions = coalesce(parking_instructions, description);

create index if not exists chargers_status_idx on public.chargers (status);

create table if not exists public.charging_sessions (
  id uuid primary key default gen_random_uuid(),
  charger_id uuid references public.chargers (id) on delete set null,
  driver_wallet text not null,
  host_wallet text not null,
  amount_sol numeric(20, 9) not null,
  status text not null default 'completed'
    check (status in ('completed')),
  created_at timestamptz not null default now()
);

create index if not exists charging_sessions_host_wallet_idx
  on public.charging_sessions (host_wallet);

create index if not exists charging_sessions_driver_wallet_idx
  on public.charging_sessions (driver_wallet);

create index if not exists charging_sessions_charger_id_idx
  on public.charging_sessions (charger_id);

alter table public.charging_sessions enable row level security;

drop policy if exists "charging_sessions_select_anon" on public.charging_sessions;
create policy "charging_sessions_select_anon"
  on public.charging_sessions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "charging_sessions_insert_anon" on public.charging_sessions;
create policy "charging_sessions_insert_anon"
  on public.charging_sessions
  for insert
  to anon, authenticated
  with check (true);

alter table public.users enable row level security;
alter table public.chargers enable row level security;

-- Public map: anyone with anon key can read active chargers.
drop policy if exists "chargers_select_anon" on public.chargers;
create policy "chargers_select_anon"
  on public.chargers
  for select
  to anon, authenticated
  using (true);

-- MVP demo policies:
-- For this hackathon UI, we allow anon inserts/selects so the /host form can write.
-- NOTE: In production, replace with real auth + signed-message verification.
drop policy if exists "users_select_anon" on public.users;
create policy "users_select_anon"
  on public.users
  for select
  to anon, authenticated
  using (true);

drop policy if exists "users_insert_anon" on public.users;
create policy "users_insert_anon"
  on public.users
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "chargers_insert_anon" on public.chargers;
create policy "chargers_insert_anon"
  on public.chargers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "users_update_anon" on public.users;
create policy "users_update_anon"
  on public.users
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "chargers_update_anon" on public.chargers;
create policy "chargers_update_anon"
  on public.chargers
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Phase 6–7: allow session lifecycle statuses on existing databases (idempotent).
alter table public.chargers drop constraint if exists chargers_status_check;
alter table public.chargers add constraint chargers_status_check
  check (status in ('active', 'inactive', 'offline', 'charging', 'available'));
