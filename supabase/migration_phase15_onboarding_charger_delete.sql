-- Grid participation onboarding + permissive charger delete for demo (matches anon insert/update pattern).

alter table public.users
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.users.onboarding_completed_at is
  'When the user completed the Driver / Host / Both participation prompt.';

-- Existing rows: skip the modal for accounts created before this migration.
update public.users
set onboarding_completed_at = coalesce(created_at, now())
where onboarding_completed_at is null;

drop policy if exists "chargers_delete_anon" on public.chargers;
create policy "chargers_delete_anon"
  on public.chargers
  for delete
  to anon, authenticated
  using (true);
