# Supabase migrations (M2M)

Apply in order in the **Supabase SQL Editor** (or `supabase db push` if you use the CLI).

| File | Purpose |
|------|---------|
| `schema.sql` | Core tables, MVP RLS (open anon reads/writes for hackathon demo). |
| `migration_phase11_auth_user_profile.sql` | Trigger: new `auth.users` row → create matching `public.users` with `auth_user_id`. |
| `migration_phase12_rls_production_template.sql` | Comments only: template for stricter RLS when you add server side wallet verification. |
| `migration_phase13_driver_locations.sql` | Live driver positions for the map (`driver_locations`), RLS, Realtime publication. |
| `migration_phase14_user_auth_sync.sql` | `public.users`: `auth_provider`, `email_verified_at`; trigger sync from `auth.users`; backfill. Passwords are never stored in `public.users`. |
| `migration_phase15_onboarding_charger_delete.sql` | `onboarding_completed_at` on `public.users` (grid role modal); backfill existing users; `chargers` delete policy for demo. |

After email sign up, the app also calls `ensureAuthProfileRow()` in the browser as a backup if the trigger has not run yet, and to keep email / provider / verification fields in sync.

**Production:** Replace anon write policies with authenticated policies and/or service-role API routes that verify Solana message signatures.

## Edge Function: delete-account

Account deletion now prefers Supabase Edge Function `delete-account` and falls back to the Next.js API route if the function is not deployed yet.

Deploy:

```bash
supabase functions deploy delete-account
```

Required Supabase secret (Project -> Edge Functions -> Secrets):

- `SUPABASE_SERVICE_ROLE_KEY`
