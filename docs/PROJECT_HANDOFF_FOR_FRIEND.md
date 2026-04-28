# M2M Project Handoff (For Friend)

This is a full technical + product handoff: what is already built, what stack and logic are used, where the code lives, and exactly what still needs to be done for Solana grant-quality delivery.

---

## 1) Current Live Status

- **Frontend hosting:** Vercel
- **Live URL:** `https://m2m-ev.vercel.app/`
- **Target custom domain:** `m2m.energy` (root)
- **Repository:** `https://github.com/zaynzahir/m2m-ev`
- **Branch strategy right now:** direct pushes on `main` (consider PR flow later)

---

## 2) Tech Stack (Exact)

From `package.json`:

- **Framework:** Next.js `15.5.14` (App Router)
- **Runtime UI:** React `19.2.4`
- **Styling:** Tailwind CSS `3.4.17` + `@tailwindcss/typography`
- **Auth + DB client:** `@supabase/supabase-js` `2.49.1`
- **Wallet/Chain libs:** Solana wallet adapter + `@solana/web3.js`
- **Maps:** `mapbox-gl` + `react-map-gl`
- **Testing:** Vitest `3.x`
- **Language:** TypeScript

Key scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run test`

---

## 3) Architecture Summary

### Frontend

- Next.js App Router pages under `app/`
- Shared components under `components/`
- UI state hooks under `hooks/`

### Auth + Data

- Supabase Auth (email/password + OAuth where enabled)
- `public.users` is the central profile table linked to `auth.users`
- Browser-side Supabase client wrappers in `lib/supabase/client.ts`

### Mapping / Discovery

- Charger discovery via Mapbox
- Charger records from `public.chargers`
- Driver location support via `public.driver_locations`

### Solana

- Wallet connect in UI
- V1 demo settlement path currently reflects direct SOL transfer behavior
- V2 escrow program path (Anchor-based) still roadmap/pending hardening

---

## 4) What Has Already Been Completed

### Product & UX

- Roadmap updated:
  - Phase 1: New York beta wording
  - Phase 3: Coming Late 2026
- Mobile navigation fixed:
  - hamburger menu for small screens
  - profile/connect wallet moved inside mobile menu
- New legal pages:
  - `/privacy`
  - `/terms`
  - premium black + gradient border aesthetic
- Footer links fixed:
  - Privacy, Terms, GitHub routed correctly

### Auth & Onboarding

- Sign-up false-failure issue fixed (Supabase user actually created case)
- Added robust profile row sync behavior
- Added role onboarding modal:
  - Driver / Host / Both
  - persists role + onboarding completion marker

### Host Features

- Host charger manager UI built:
  - create charger
  - edit charger
  - delete charger
  - price per kWh controls

### Infrastructure / Repo

- Migration from GitHub Pages to Vercel:
  - removed basePath Pages logic
  - removed Pages deploy workflow
- Added MIT license
- Rewrote README in institutional style
- `.cursor/` ignored and MCP example moved to root (`mcp.json.example`)

---

## 5) Important Code Locations (Where logic lives)

### Core app/navigation

- `components/Navbar.tsx` → responsive nav + hamburger logic
- `components/Footer.tsx` → footer links
- `components/Roadmap.tsx` → roadmap content

### Auth/session

- `components/auth/AuthSessionProvider.tsx` → auth session context
- `components/auth/SignUpForm.tsx` → signup UI + email confirmation messaging
- `components/auth/EmailAuthTabs.tsx` → sign-in / sign-up tabbed auth
- `lib/supabase/client.ts` → auth, profile sync, charger CRUD, role updates

### Onboarding + profile

- `components/auth/GridRoleModal.tsx` → role modal
- `app/profile/page.tsx` → profile orchestration
- `components/profile/ProfileEditForm.tsx` → profile editing
- `components/profile/HostChargerManager.tsx` → host charger management UI

### Legal pages

- `components/legal/LegalPageShell.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`

### Supabase SQL

- `supabase/schema.sql`
- `supabase/migration_phase11_auth_user_profile.sql`
- `supabase/migration_phase13_driver_locations.sql`
- `supabase/migration_phase14_user_auth_sync.sql`
- `supabase/migration_phase15_onboarding_charger_delete.sql`

### Build config

- `next.config.mjs` → Vercel-oriented; optional static export via `STATIC_EXPORT=true`

---

## 6) Data Model Snapshot (Current)

Main tables:

- `public.users`
  - identity linkage: `auth_user_id`, `wallet_address`
  - profile fields: display/contact/vehicle
  - role: `driver | host | both`
  - auth sync fields: `auth_provider`, `email_verified_at`
  - onboarding marker: `onboarding_completed_at`

- `public.chargers`
  - owner relationship
  - geo fields: lat/lng
  - listing fields: title, plug type, status, price

- `public.driver_locations`
  - live map presence for drivers

- `public.charging_sessions`
  - settlement/session record metadata

---

## 7) Environment Variables

### Required in Vercel (Production + Preview)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_ESCROW_PUBLIC_KEY`

### Strongly recommended

- `NEXT_PUBLIC_SITE_URL=https://m2m.energy`
  - Needed for clean auth callback / OAuth consistency

---

## 8) Build/Deploy Behavior

- Current deployment target is Vercel root domain (no GitHub Pages base path)
- `npm run build` works for standard Vercel build
- Optional static export still possible if `STATIC_EXPORT=true`
- CI file currently present for tests/build checks: `.github/workflows/ci.yml`

---

## 9) Known Risks / Gaps (Critical)

### Security (Top priority)

- RLS posture is still demo-friendly in places.
- Need strict authenticated + ownership-based policies before production-level trust.

### Smart contract trust model

- V1 flow is not yet full audited Anchor escrow production path.
- Need explicit grant-facing distinction between V1 demo and V2 audited contracts.

### Operational readiness

- No robust monitoring/alerts yet (recommended: Sentry + uptime checks).
- Placeholder social links and some product polish items remain.

---

## 10) What Friend Should Do Next (Priority Plan)

## P0 — Must finish first

- Harden Supabase RLS:
  - remove broad anon write allowances
  - enforce ownership predicates for updates/deletes
- Validate migrations in production Supabase:
  - ensure phase 11/14 triggers are active
  - ensure phase 15 onboarding column exists and works
- Validate Vercel environments:
  - all required env vars set in Production and Preview
  - no dependency on local `.env.local`

## P1 — Grant-quality improvements

- Add monitoring:
  - Sentry frontend
  - build/deploy alerting
- Security/dependency review:
  - audit packages
  - clean duplicate lockfile artifacts if still present
- Formalize smart-contract roadmap section:
  - V1 vs V2 behavior and audit status in docs

## P2 — polish

- Replace placeholder Twitter URL
- Counsel review of legal text
- Custom domain final checks:
  - DNS/SSL/redirect behavior

---

## 11) QA Checklist

- [ ] Mobile navbar: only hamburger on small screens, account actions inside menu
- [ ] `/privacy` and `/terms` accessible and linked in footer
- [ ] Sign-up flow does not show false failure when account exists
- [ ] Role onboarding modal appears for non-onboarded users
- [ ] Host charger manager create/edit/delete all work
- [ ] Supabase migrations through phase 15 applied
- [ ] Vercel env vars complete and correct
- [ ] `npm run build` passes on `main`

---

## 12) Fast Message You Can Send to Friend

\"Please use `docs/PROJECT_HANDOFF_FOR_FRIEND.md` as the single source of truth. Start with P0 (Supabase RLS hardening + production env validation), then P1 (monitoring + security + V1/V2 contract clarity). Main UX, legal pages, auth fixes, host manager, and Vercel migration are already done.\"

