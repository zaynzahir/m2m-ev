# M2M

Next.js app for the M2M charging network (Solana wallet + Supabase).

**Open source:** the M2M application and related protocol tooling are developed in the open. In the running app, see **Docs** (`/docs`) and **Whitepaper** (`/whitepaper`); in this repo, `app/docs/page.tsx` and `app/whitepaper/page.tsx` carry the same messaging.

## Development

```bash
npm install
cp .env.example .env.local         # optional template; configure env vars below
npm run dev
```

### Environment

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Mapbox**: `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Solana / demo escrow**: `NEXT_PUBLIC_ESCROW_PUBLIC_KEY` (devnet base58 pubkey)
- **OAuth (optional)**: enable Google/Apple in the Supabase dashboard and set redirect URLs to `{origin}/auth/callback`. For server-side OAuth edge cases you can set `NEXT_PUBLIC_SITE_URL` to the site origin.

### Database

Apply SQL in `supabase/` in order (see `supabase/README.md`). The `migration_phase11_auth_user_profile.sql` trigger keeps `public.users` in sync when email/OAuth users sign up.

### Tests & CI

```bash
npm run test
```

GitHub Actions runs `npm ci`, `npm run test`, and `npm run build` on push/PR to `main` or `master`.

### GitHub Pages (static deploy)

The live app is **not** the repo README. Use **Settings → Pages → Build and deployment → Source: GitHub Actions** (not “Deploy from a branch”). The workflow [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) sets **`STATIC_EXPORT=true`** so `next build` emits an **`out/`** folder (plain `next build` alone does **not**).

If you added GitHub’s suggested **“Next.js”** workflow and see **Upload artifact / `tar: out: No such file`**, remove that workflow from **`.github/workflows/`** — it builds without static export. Keep only `deploy-github-pages.yml`.

After a successful run, the site is at `https://<user>.github.io/<repo>/`. For OAuth, add that origin and `…/auth/callback` in Supabase.

### Local tooling

If `npm install` fails with `errno -70` or odd file errors on macOS, move the project out of iCloud/Desktop-synced folders and use a normal local directory so `node_modules` is not synced. iCloud conflict copies (e.g. `node_modules 2`, `some-file 2.ts`) should be deleted; `tsconfig.json` excludes `node_modules 2` so TypeScript does not type-check those folders.

## Product notes

- **Escrow**: the demo uses a direct SOL transfer to a configured pubkey, not an on chain escrow program or USDC streaming. UI copy reflects that where relevant.
- **Host listings**: demo RLS may be permissive; see `migration_phase12_rls_production_template.sql` for a stricter pattern before production.

## Full product status & Supabase MCP

See **[docs/PRODUCT_COMPLETE.md](docs/PRODUCT_COMPLETE.md)** for everything implemented, manual dashboard steps, and how to connect **Supabase MCP** in Cursor. Copy **`.cursor/mcp.json.example`** to **`.cursor/mcp.json`** if you configure MCP via file (do not commit secrets).
