# M2M: product status and operations

This document records what is **implemented**, what is **manual / external**, and how to **connect Supabase to Cursor via MCP** so assistants can run SQL, migrations, and project tools when you approve each action.

---

## Map and geolocation (M2M)

- **Locate me**: No GPS prompt on load. Users tap **“Find chargers near me”**; denial shows a toast with manual search messaging.
- **Drivers** (`role` = `driver` or `both`): After profile loads, **`watchPosition`** drives a **blue pulsing dot**; coordinates sync to **`driver_locations`** when the user is signed in with Supabase Auth (throttled). Wallet only drivers still see the dot locally; DB sync requires auth per RLS.
- **Accuracy**: If GPS accuracy is **≥ ~75 m**, a **semi transparent ring** is drawn (desktop / IP based fixes).
- **Hosts** (signed in, `host` or `both`): Subscribe to **Realtime** on `driver_locations` and see **amber dots** for other drivers (excludes self).
- **Cleanup**: `clearWatch` on unmount; authenticated drivers trigger **`delete`** on their `driver_locations` row when leaving the map so hosts are not misled.

Apply **`migration_phase13_driver_locations.sql`** in the Supabase SQL Editor, then confirm **Realtime** is enabled for that table in the dashboard.

---

## 1. Summary

| Area | Status |
|------|--------|
| Email auth + `public.users` row | Trigger SQL (`migration_phase11`) + client `ensureAuthProfileRow()` backup |
| OAuth (Google / Apple) | Implemented in app; **enable providers + redirect URLs in Supabase Dashboard** |
| Password reset / email verification | Routes: `/auth/forgot-password`, `/auth/update-password`, `/auth/callback`; resend in sign up flow |
| Role (driver / host / both) | DB + profile UI; wallet paths set role on upsert; email users via profile edit |
| Profile editing (email and wallet) | `/profile`: display name, vehicle, contact; host charger controls |
| Host listings security | Demo friendly RLS in `schema.sql`; **production template** in `migration_phase12_rls_production_template.sql` |
| Host dashboard | No separate route: **wallet dashboard** at `/dashboard` + **profile** for listings |
| Charger edit / deactivate / delete | Profile, host listings (`HostChargerControls`) |
| `/charge` vs map | **Find a charger** + map + driver registration; home map has `id="map"` (`/#map`) |
| `WalletFirstProfileGate` | Wraps driver + host **registration** forms; redirects existing profiles to `/dashboard` |
| `/dashboard` | Full wallet dashboard (sessions, earnings), not a placeholder |
| Escrow | **Demo**: SOL transfer to `NEXT_PUBLIC_ESCROW_PUBLIC_KEY`, not an on chain escrow program; disclaimers in UI |
| Tests and CI | Vitest (`npm run test`), GitHub Actions (`.github/workflows/ci.yml`) |
| Duplicate files | App `page 2.tsx` copies removed; stray `lib/* 2.ts` conflict copies removed; `tsconfig` excludes `node_modules 2` |
| Error monitoring | Optional env placeholders in `.env.example` (e.g. `SENTRY_DSN`); **not wired in app** unless you add SDK |
| Accessibility | Focus traps on key modals; `aria-live` on session modal status; can be extended |

---

## 2. Account creation and identity

- **Email sign up** creates an Auth user and, when migrations are applied, a **`public.users`** row linked by **`auth_user_id`** (trigger on `auth.users` insert).
- **Backup**: `ensureAuthProfileRow()` in the browser if the trigger has not run yet.
- **OAuth**: Client uses `signInWithOAuthProvider`, then **`/auth/callback`** exchanges the code. You must enable **Google / Apple** under **Authentication, Providers** and add redirect URLs such as:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback`
- **Password reset**: `/auth/forgot-password`, email link, `/auth/update-password`.
- **Email confirmation**: Sign up flow surfaces “check your email” and resend where implemented in forms.

---

## 3. Profile

- **`/profile`**: Edit display name, vehicle, contact, role; wallet vs email paths handled in shared components.
- **Two identities (wallet + email)**: Rules are documented in code comments and profile UI; users should prefer one primary identity per session where possible.

---

## 4. Host

- Listings use policies suitable for a **demo**; before production, tighten RLS or move writes to **server routes** with verification.
- **Charger lifecycle**: status (e.g. active / inactive) and delete from profile when you own the row.

---

## 5. Driver and `/charge`

- Page title/flow: browse map + **driver registration** below the fold.
- **`WalletFirstProfileGate`**: only the registration block requires a wallet and skips if a profile already exists.

---

## 6. Dashboard

- **`/dashboard`**: Solana wallet scoped stats and session history (host + driver views where data exists).

---

## 7. Payments and escrow (honest scope)

- **Not** a full on chain escrow program, **not** USDC streaming as in future marketing.
- **Is**: configurable devnet pubkey + `SystemProgram.transfer` for a small hold; copy in **`SessionEscrowModal`** explains this.
- **Env**: set **`NEXT_PUBLIC_ESCROW_PUBLIC_KEY`** (base58 devnet address) in `.env.local`. (If you still see `NEXT_PUBLIC_ESCROW_WALLET` in old notes, align on **`NEXT_PUBLIC_ESCROW_PUBLIC_KEY`**. That is what `lib/constants/escrow.ts` reads.)

---

## 8. Quality and repo hygiene

- **`npm run test`**: Vitest, e.g. `lib/constants/escrow.test.ts`.
- **`npm run build`**: Next.js production build + typecheck.
- **CI**: push/PR to `main` or `master` runs install, test, build.
- **iCloud / sync**: Keep the repo outside Desktop/iCloud sync if `node_modules` corrupts; delete conflict folders like `node_modules 2`.

---

## 9. Supabase SQL apply order

See **`supabase/README.md`**. Typical order:

1. **`schema.sql`** (and any earlier phase files your project already uses)
2. **`migration_phase10_auth_profile.sql`** / later phases as listed in repo history
3. **`migration_phase11_auth_user_profile.sql`**: auth to `public.users` sync
4. **`migration_phase12_rls_production_template.sql`**: reference only until you implement stricter policies

Use **SQL Editor** in the dashboard, or Supabase CLI if you use linked projects.

---

## 10. Connect Supabase through MCP (Cursor)

**Important:** In *this* chat session, the assistant only has the tools Cursor exposes (files, terminal, etc.). **Supabase MCP** is a **separate** integration: after you add it, **future** messages can use Supabase tools (list tables, run SQL, migrations, logs, etc.) when **you approve** each tool call.

### Recommended: Cursor UI (hosted Supabase MCP)

1. Open **Cursor Settings, Tools and MCP** (or **MCP and Integrations**, depending on Cursor version).
2. Add the **Supabase** MCP server using the [official guide](https://supabase.com/docs/guides/getting-started/mcp).
3. Complete the **browser login** to Supabase and pick the **organization** that contains your project.
4. Prefer:
   - **`project_ref=...`**: scope to this app’s project only  
   - **`read_only=true`**: if you only want safe reads unless you explicitly need writes  

Official docs also document query parameters:  
`https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true`

### Optional: project template file

A **non-secret** example is in **`mcp.json.example`** at the repo root. Copy it to **`.cursor/mcp.json`**, fill in your **`project_ref`**, and use a [personal access token](https://supabase.com/dashboard/account/tokens) only if your client does not support the default OAuth flow (e.g. CI). **Do not commit** real tokens.

### Security (from Supabase)

- Use **dev/test** projects, not production, when possible.  
- Keep **approval** of each MCP tool call enabled in Cursor.  
- Prefer **read-only** + **project-scoped** mode.  
- Read: [Supabase MCP security](https://supabase.com/docs/guides/getting-started/mcp#security-risks).

### After it is connected

Ask things like: *“List tables in my Supabase project”* or *“Apply migration_phase11 from the repo”*. The assistant will use MCP tools **if** Cursor shows them as available for that chat.

---

## 11. What is still not automatic

- **Sentry / full observability**: env stubs exist; SDK wiring is a separate task.
- **Production RLS**: must be designed for your threat model (signed requests, service role, etc.).
- **Real escrow / disputes**: product and smart-contract work, not done in this demo.

---

*Last updated to match the M2M repo implementation as of this document’s creation.*
