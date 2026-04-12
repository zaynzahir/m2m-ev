-- Auto-create public.users when a Supabase Auth user signs up.
-- Run in Supabase SQL Editor after schema.sql.
-- After this, run migration_phase14_user_auth_sync.sql for auth_provider / email_verified_at and sync triggers.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.users u where u.auth_user_id = new.id) then
    update public.users
      set email = coalesce(new.email, email)
    where auth_user_id = new.id;
    return new;
  end if;

  insert into public.users (auth_user_id, email, role)
  values (new.id, new.email, 'driver');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
