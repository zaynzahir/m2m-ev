-- Phase 8: receipt ledger + driver binding for oracle completion.
-- Run in Supabase SQL Editor after prior M2M migrations.

alter table public.chargers
  add column if not exists active_driver_wallet text;

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
