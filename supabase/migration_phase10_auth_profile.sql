-- Link Supabase Auth (email/social) to public.users alongside wallet-only rows.

-- Allow wallet-only OR auth-linked profiles (at least one must be set).
alter table public.users drop constraint if exists users_wallet_address_key;

alter table public.users
  alter column wallet_address drop not null;

create unique index if not exists users_wallet_address_unique
  on public.users (wallet_address)
  where wallet_address is not null;

alter table public.users
  add column if not exists auth_user_id uuid references auth.users (id) on delete cascade;

create unique index if not exists users_auth_user_id_unique
  on public.users (auth_user_id)
  where auth_user_id is not null;

alter table public.users drop constraint if exists users_auth_or_wallet;
alter table public.users
  add constraint users_auth_or_wallet check (
    auth_user_id is not null or wallet_address is not null
  );
