# M2M Network: The Decentralized Power Grid for Machines

M2M (Machine to Machine) is a Decentralized Physical Infrastructure Network (DePIN) built natively on Solana. We connect EV drivers with idle residential and commercial charging capacity, transforming home chargers into permissionless, monetizable nodes settled instantly on-chain.

## 🌐 The Protocol

The M2M architecture solves the core issues of peer-to-peer physical infrastructure using three protocol layers:

- **Scan-to-Authenticate (Proof of Presence):** Prevents location spoofing by requiring physical QR-code verification at the node before energy is authorized.
- **Dual-Verification Oracle:** Reconciles hardware telemetry (OCPP) with vehicle API data to ensure trustless energy measurement.
- **Trustless Escrow:** Utilizes Solana smart contracts to lock session funds and execute sub-second settlements with near-zero fees.

## 🛠 Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend & Auth:** Supabase (PostgreSQL)
- **Blockchain:** Solana Web3.js, Anchor (Rust smart contracts)
- **Mapping:** Mapbox GL

## 🚀 Local Development Setup

To run the M2M interface and interact with the Devnet escrow programs locally:

### 1. Clone and install

```bash
git clone https://github.com/zaynzahir/m2m-ev.git
cd m2m-ev
npm install
```

### 2. Environment configuration

Copy the example environment file and configure your keys.

```bash
cp .env.example .env.local
```

**Required keys in `.env.local`:**

- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_ESCROW_PUBLIC_KEY` (Solana Devnet Base58 address)

### 3. Database setup

Apply the SQL migrations located in the `supabase/` directory in sequential order via the Supabase SQL Editor. Ensure the `migration_phase11_auth_user_profile.sql` trigger is active.

### 4. Run the client

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📜 Open Source & Contributions

The M2M application and related protocol tooling are developed in the open. We welcome contributions from the Solana and DePIN communities. Please see the [Whitepaper](app/whitepaper/page.tsx) and [Docs](app/docs/page.tsx) within the repository for deeper protocol specifications.

**Note on V1 demo:** The current repository reflects the V1 Devnet architecture. Escrow currently utilizes direct SOL transfers to a configured Devnet pubkey while the V2 Anchor programs undergo security audits.

## License

This project is licensed under the [MIT License](LICENSE).
