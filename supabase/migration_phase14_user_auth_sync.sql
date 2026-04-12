-- Sync auth identity into public.users (email, provider, verification time).
-- Passwords are NEVER stored here — only in auth.users (Supabase Auth, hashed).
-- Run in Supabase SQL Editor after earlier migrations.
--
-- Dashboard checklist (one-time, not SQL):
-- • Authentication → Providers: enable Email; enable Google/Apple if you use them.
-- • Authentication → URL configuration: Site URL = your app origin; add Redirect URLs
--   including https://YOUR_DOMAIN/auth/callback (and http://localhost:3000/auth/callback for dev).

alter table public.users
  add column if not exists auth_provider text;

alter table public.users
  add column if not exists email_verified_at timestamptz;

comment on column public.users.auth_provider is
  'How the user signs in: email, google, apple, etc. Wallet-only profiles use wallet.';

comment on column public.users.email_verified_at is
  'Mirrors auth.users.email_confirmed_at when available.';

-- Backfill from auth (run as postgres / SQL Editor — has access to auth schema).
update public.users u
set
  email = coalesce(u.email, au.email),
  email_verified_at = au.email_confirmed_at,
  auth_provider = coalesce(
    nullif(trim(au.raw_app_meta_data->>'provider'), ''),
    u.auth_provider,
    'email'
  )
from auth.users au
where u.auth_user_id = au.id;

-- Wallet-only rows (no Supabase Auth): optional label for analytics.
update public.users
set auth_provider = 'wallet'
where wallet_address is not null
  and auth_user_id is null
  and auth_provider is null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider text;
begin
  v_provider := coalesce(
    nullif(trim(new.raw_app_meta_data->>'provider'), ''),
    'email'
  );

  if exists (select 1 from public.users u where u.auth_user_id = new.id) then
    update public.users
    set
      email = coalesce(new.email, email),
      email_verified_at = new.email_confirmed_at,
      auth_provider = coalesce(
        nullif(trim(new.raw_app_meta_data->>'provider'), ''),
        auth_provider
      )
    where auth_user_id = new.id;
    return new;
  end if;

  insert into public.users (
    auth_user_id,
    email,
    role,
    auth_provider,
    email_verified_at
  )
  values (
    new.id,
    new.email,
    'driver',
    v_provider,
    new.email_confirmed_at
  );

  return new;
end;
$$;

create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set
    email = coalesce(new.email, email),
    email_verified_at = new.email_confirmed_at,
    auth_provider = coalesce(
      nullif(trim(new.raw_app_meta_data->>'provider'), ''),
      auth_provider
    )
  where auth_user_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, email_confirmed_at, raw_app_meta_data on auth.users
  for each row
  execute function public.handle_auth_user_updated();
