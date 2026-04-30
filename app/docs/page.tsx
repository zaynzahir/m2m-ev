import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { JsonCodeBlock } from "@/components/docs/JsonCodeBlock";

const SESSION_INIT_JSON = `{
  "charger_id": "m2m_node_8841",
  "session_token": "sess_9x8f2a1...",
  "qr_proof_signature": "5Kj8f...Ed25519_sig",
  "escrow_pubkey": "7xVp...SolanaAddress",
  "hardware_status": "authorized_pending_plug",
  "timestamp": "2026-04-11T12:00:00Z"
}`;

const SETTLE_JSON = `{
  "session_id": "sess_9x8f2a1...",
  "charger_reported_kwh": 42.5,
  "vehicle_reported_kwh": 41.8,
  "delta_status": "within_tolerance",
  "settlement_amount_usdc": 14.50,
  "host_wallet": "Host...Address",
  "driver_wallet": "Driver...Address"
}`;

const NAV_ITEMS = [
  { id: "introduction", label: "Introduction" },
  { id: "smart-contracts", label: "Smart Contracts" },
  { id: "hardware-oracle-api", label: "Hardware Oracle API" },
  { id: "sdk-setup", label: "SDK Setup" },
] as const;

function SectionRule() {
  return (
    <div
      className="my-12 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:my-14"
      aria-hidden
    />
  );
}

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-24 pt-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-8 lg:flex-row lg:gap-10">
          <aside className="shrink-0 lg:w-64 lg:pt-2 xl:w-72">
            <DocsSidebar items={NAV_ITEMS} />
          </aside>

          <div className="min-w-0 flex-1">
            <article className="glass-card rounded-[1.5rem] border border-white/10 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8 md:p-10 lg:rounded-3xl lg:p-12">
              <header className="border-b border-white/10 pb-10">
                <p className="font-headline text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Developer documentation
                </p>
                <h1 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-[2.35rem] md:leading-[1.12]">
                  M2M Developer Documentation
                </h1>
                <p className="mt-4 max-w-3xl text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  Reference for Anchor programs, the Dual-Verification Oracle, and
                  client integration. Sections use URL anchors for deep linking (for
                  example{" "}
                  <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-primary/95">
                    /docs#smart-contracts
                  </code>
                  ).
                </p>
              </header>

              <section id="introduction" className="scroll-mt-32 pt-12">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                  Introduction
                </h2>
                <div className="mt-6 space-y-5 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  <p>
                    Welcome to the M2M Developer Documentation. The M2M stack empowers
                    developers, hardware manufacturers, and node operators to interface
                    with the world&apos;s first Solana-native DePIN for
                    machine-to-machine energy transfer. This documentation covers our
                    on-chain Anchor programs, the Dual-Verification Oracle middleware,
                    and the TypeScript SDK required to build client applications and
                    integrate charging hardware.
                  </p>
                  <p>
                    The M2M project is{" "}
                    <strong className="font-semibold text-on-surface">
                      open source
                    </strong>
                    : you can inspect, fork, and contribute to the public repositories
                    as they are published; protocol details here match what we ship in
                    those repos.
                  </p>
                </div>
              </section>

              <SectionRule />

              <section id="smart-contracts" className="scroll-mt-32">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                  Smart Contracts (Solana Escrow)
                </h2>
                <p className="mt-6 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  The M2M protocol roadmap uses trustless smart contracts for session
                  funding, verification, and settlement. Current V1 demonstrates the
                  session lifecycle and escrow rails, while full production settlement
                  logic continues through phased hardening and audits.
                </p>

                <h3 className="mt-10 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  V1 Devnet program details
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  V1 programs are currently live on Solana Devnet. Mainnet program IDs
                  will be published following our Phase 1 security audits.
                </p>

                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#08080a] shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/35 px-4 py-3">
                    <span className="font-headline text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                      Program ID
                    </span>
                    <span className="font-headline text-[10px] font-semibold uppercase tracking-wider text-primary/90">
                      Devnet
                    </span>
                  </div>
                  <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed sm:p-5 sm:text-sm">
                    <code className="font-mono text-primary/95">
                      M2MEscrow1111111111111111111111111111111
                    </code>
                  </pre>
                  <p className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-on-surface-variant sm:px-5">
                    Note: Devnet placeholder. Replace with audited mainnet ID after
                    deployment.
                  </p>
                </div>

                <h3 className="mt-10 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  Core instructions
                </h3>
                <ul className="mt-5 space-y-4 border-l-2 border-primary/25 pl-5">
                  <li className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                    <code className="font-mono text-[13px] text-primary/95">
                      initialize_escrow
                    </code>
                    <span className="text-on-surface-variant">
                      {" "}
                      — Locks the estimated USDC session cost from the driver&apos;s
                      wallet.
                    </span>
                  </li>
                  <li className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                    <code className="font-mono text-[13px] text-primary/95">
                      verify_presence
                    </code>
                    <span className="text-on-surface-variant">
                      {" "}
                      — Authenticates the physical QR code scan, securely linking the
                      driver&apos;s cryptographic signature to the physical node.
                    </span>
                  </li>
                  <li className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                    <code className="font-mono text-[13px] text-primary/95">
                      settle_session
                    </code>
                    <span className="text-on-surface-variant">
                      {" "}
                      — Triggered by the Dual-Verification Oracle to release funds to
                      the host and refund any unspent USDC to the driver.
                    </span>
                  </li>
                  <li className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                    <code className="font-mono text-[13px] text-primary/95">
                      dispute_resolution
                    </code>
                    <span className="text-on-surface-variant">
                      {" "}
                      — Fallback mechanism for unmatched hardware and telematics reports.
                    </span>
                  </li>
                </ul>
              </section>

              <SectionRule />

              <section id="hardware-oracle-api" className="scroll-mt-32">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                  Hardware Oracle API (V2)
                </h2>
                <p className="mt-6 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  The M2M Oracle is the target trust boundary between the physical
                  world and the Solana blockchain. V1 currently ships staged QR +
                  escrow workflow primitives, while OEM telemetry reconciliation is
                  being integrated as a phased rollout.
                </p>

                <h3 className="mt-10 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  1. Session initialization (Scan-to-Authenticate)
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  When a driver scans the host&apos;s QR code, the client SDK requests
                  session initialization and records workflow state. Hardware
                  energization and direct charger-cloud authorization are part of the
                  next integration phase.
                </p>
                <JsonCodeBlock methodPath="POST /api/v2/oracle/session-init">
                  {SESSION_INIT_JSON}
                </JsonCodeBlock>

                <h3 className="mt-10 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  2. Dual-verification settlement payload
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  In the target production architecture, settlement is authorized only
                  when hardware output and vehicle intake remain within accepted
                  physical loss tolerance (typically{" "}
                  <span className="font-headline font-semibold text-on-surface/90">
                    &lt; 2%
                  </span>
                  ). V1 documents this schema and staged flow while live OEM/charger
                  telemetry adapters continue rollout.
                </p>
                <JsonCodeBlock methodPath="POST /api/v2/oracle/session-settle">
                  {SETTLE_JSON}
                </JsonCodeBlock>
              </section>

              <SectionRule />

              <section id="sdk-setup" className="scroll-mt-32">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                  SDK setup
                </h2>
                <p className="mt-6 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  The official{" "}
                  <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-primary/95">
                    @m2m/sdk
                  </code>{" "}
                  (npm) provides a unified interface for the entire session lifecycle,
                  integrating seamlessly with{" "}
                  <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-primary/95">
                    @solana/wallet-adapter-react
                  </code>
                  .
                </p>
                <h3 className="mt-8 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  Installation &amp; configuration
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  The package handles wallet signing, RPC connections, and WebSocket
                  subscriptions to the Oracle for real-time charging status. Configure
                  your Solana RPC (Devnet for V1), wallet adapter, and Oracle base URL
                  via your environment variables. Full installation steps, React hooks (
                  <code className="font-mono text-[13px] text-primary/90">
                    useM2MSession
                  </code>
                  ), and boilerplate examples will ship with the public beta release.
                </p>
              </section>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
