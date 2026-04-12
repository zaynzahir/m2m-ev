-- M2M Phase 13: live driver locations for map (hosts see approaching drivers).
-- Run in Supabase SQL Editor after prior migrations.

create table if not exists public.driver_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  accuracy_m double precision,
  updated_at timestamptz not null default now(),
  constraint driver_locations_user_id_unique unique (user_id)
);

create index if not exists driver_locations_updated_at_idx
  on public.driver_locations (updated_at desc);

alter table public.driver_locations enable row level security;

-- Drivers update only their row; hosts (and both) can read all rows for map display.
drop policy if exists "driver_locations_select_own_or_host" on public.driver_locations;
create policy "driver_locations_select_own_or_host"
  on public.driver_locations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = driver_locations.user_id
        and u.auth_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role in ('host', 'both')
    )
  );

drop policy if exists "driver_locations_insert_own" on public.driver_locations;
create policy "driver_locations_insert_own"
  on public.driver_locations
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users u
      where u.id = driver_locations.user_id
        and u.auth_user_id = auth.uid()
    )
  );

drop policy if exists "driver_locations_update_own" on public.driver_locations;
create policy "driver_locations_update_own"
  on public.driver_locations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = driver_locations.user_id
        and u.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.id = driver_locations.user_id
        and u.auth_user_id = auth.uid()
    )
  );

drop policy if exists "driver_locations_delete_own" on public.driver_locations;
create policy "driver_locations_delete_own"
  on public.driver_locations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = driver_locations.user_id
        and u.auth_user_id = auth.uid()
    )
  );

-- Realtime: hosts subscribe to live driver positions (project Dashboard → Realtime).
alter table public.driver_locations replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'driver_locations'
  ) then
    alter publication supabase_realtime add table public.driver_locations;
  end if;
end $$;
