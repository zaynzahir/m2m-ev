alter table public.users
  add column if not exists auth_provider text;

alter table public.users
  add column if not exists email_verified_at timestamptz;

comment on column public.users.auth_provider is
  'Auth provider (email/google/apple/wallet).';

comment on column public.users.email_verified_at is
  'Timestamp when email was verified in Supabase Auth.';
