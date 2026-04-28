-- Phase 16: strict production RLS for users/chargers/charging_sessions.
-- Goal:
-- 1) Disable anon writes entirely.
-- 2) Enforce authenticated + ownership-based access.

begin;

-- Ensure RLS is enabled.
alter table public.users enable row level security;
alter table public.chargers enable row level security;
alter table public.charging_sessions enable row level security;

-- =========================
-- USERS
-- =========================
-- Drop previous demo/open policies if present.
drop policy if exists "users_select_anon" on public.users;
drop policy if exists "users_insert_anon" on public.users;
drop policy if exists "users_update_anon" on public.users;
drop policy if exists "users_insert_own_auth" on public.users;
drop policy if exists "users_select_own_auth" on public.users;
drop policy if exists "users_update_own_auth" on public.users;
drop policy if exists "users_delete_own_auth" on public.users;

-- Authenticated user can read only their own profile row.
create policy "users_select_own_auth"
  on public.users
  for select
  to authenticated
  using (auth.uid() = auth_user_id);

-- Authenticated user can insert only their own profile row.
create policy "users_insert_own_auth"
  on public.users
  for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

-- Authenticated user can update only their own profile row.
create policy "users_update_own_auth"
  on public.users
  for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Authenticated user can delete only their own profile row.
create policy "users_delete_own_auth"
  on public.users
  for delete
  to authenticated
  using (auth.uid() = auth_user_id);

-- =========================
-- CHARGERS
-- =========================
-- Drop previous demo/open policies if present.
drop policy if exists "chargers_select_anon" on public.chargers;
drop policy if exists "chargers_insert_anon" on public.chargers;
drop policy if exists "chargers_update_anon" on public.chargers;
drop policy if exists "chargers_delete_anon" on public.chargers;
drop policy if exists "chargers_insert_own" on public.chargers;
drop policy if exists "chargers_update_own" on public.chargers;
drop policy if exists "chargers_delete_own" on public.chargers;
drop policy if exists "chargers_select_public" on public.chargers;

-- Keep charger discovery public read (both anon + authenticated).
create policy "chargers_select_public"
  on public.chargers
  for select
  to anon, authenticated
  using (true);

-- Authenticated insert only when owner_id points to their own users row.
create policy "chargers_insert_own"
  on public.chargers
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users u
      where u.id = owner_id
        and u.auth_user_id = auth.uid()
    )
  );

-- Authenticated update only on chargers they own.
create policy "chargers_update_own"
  on public.chargers
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = owner_id
        and u.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.id = owner_id
        and u.auth_user_id = auth.uid()
    )
  );

-- Authenticated delete only on chargers they own.
create policy "chargers_delete_own"
  on public.chargers
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = owner_id
        and u.auth_user_id = auth.uid()
    )
  );

-- =========================
-- CHARGING SESSIONS
-- =========================
-- Drop previous demo/open policies if present.
drop policy if exists "charging_sessions_select_anon" on public.charging_sessions;
drop policy if exists "charging_sessions_insert_anon" on public.charging_sessions;
drop policy if exists "charging_sessions_select_own" on public.charging_sessions;
drop policy if exists "charging_sessions_insert_own" on public.charging_sessions;

-- Read only sessions where current user wallet matches host or driver wallet.
create policy "charging_sessions_select_own"
  on public.charging_sessions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.wallet_address is not null
        and (
          u.wallet_address = charging_sessions.driver_wallet
          or u.wallet_address = charging_sessions.host_wallet
        )
    )
  );

-- Insert only sessions where current user wallet is either driver or host.
create policy "charging_sessions_insert_own"
  on public.charging_sessions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.wallet_address is not null
        and (
          u.wallet_address = driver_wallet
          or u.wallet_address = host_wallet
        )
    )
  );

-- No update/delete policies for charging_sessions: immutable ledger rows by default.

commit;
