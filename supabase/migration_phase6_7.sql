-- Run in Supabase SQL Editor if your project was created before Phase 6–7
-- and `chargers.status` does not yet allow `charging` / `available`.

alter table public.chargers drop constraint if exists chargers_status_check;

alter table public.chargers add constraint chargers_status_check
  check (status in ('active', 'inactive', 'offline', 'charging', 'available'));
