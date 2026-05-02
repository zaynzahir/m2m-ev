import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { JsonCodeBlock } from "@/components/docs/JsonCodeBlock";

const SESSION_INIT_JSON = `{
  "chargerId": "8841-live",
  "sessionToken": "sess9x8f2a1",
  "qrProofSignature": "5Kj8fEd25519",
  "escrowPubkey": "7xVpSolana",
  "workflowStatus": "authorizedPendingPlug",
  "timestamp": "2026-04-11T12:00:00Z"
}`;

const SETTLE_JSON = `{
  "sessionId": "sess9x8f2a1",
  "chargerReportedKwh": 42.5,
  "vehicleReportedKwh": 41.8,
  "deltaStatus": "withinTolerance",
  "settlementAmountUsdc": 14.5,
  "hostWallet": "HostAddress",
  "driverWallet": "DriverAddress"
}`;

const NAV_ITEMS = [
  { id: "introduction", label: "Introduction" },
  { id: "smart-contracts", label: "Smart Contracts" },
  { id: "hardware-oracle-api", label: "API Integration Oracle" },
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
                  Reference for Solana escrow programs, the phased dual verification
                  oracle, and API first client integration. Sections use URL anchors,
                  for example{" "}
                  <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-primary/95">
                    /docs#smart-contracts
                  </code>
                  . Questions:{" "}
                  <a
                    href="mailto:info@m2m.energy"
                    className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
                  >
                    info@m2m.energy
                  </a>
                  .
                </p>
              </header>

              <section id="introduction" className="scroll-mt-32 pt-12">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                  Introduction
                </h2>
                <div className="mt-6 space-y-5 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  <p>
                    Welcome to the M2M Developer Documentation. The M2M stack helps
                    developers, charger cloud partners, and node operators integrate with
                    a Solana native DePIN for machine to machine energy coordination.
                    This covers escrow programs on chain, the dual verification oracle
                    middleware roadmap, and the TypeScript oriented surface area for web
                    clients and OEM or charger APIs.
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
                  The roadmap relies on deterministic Solana programs for session
                  funding, verification cues, and settlement. Current V1 shows the
                  session life cycle and escrow rails together with staged QR flows,
                  while full oracle driven settlement completes through phased hardening
                  and audits.
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
                      {": "}
                      Locks the estimated USDC session stake from the driver wallet.
                    </span>
                  </li>
                  <li className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                    <code className="font-mono text-[13px] text-primary/95">
                      verify_presence
                    </code>
                    <span className="text-on-surface-variant">
                      {": "}
                      Records physical QR authorization and binds the signer to this
                      listing before payment continuation.
                    </span>
                  </li>
                  <li className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                    <code className="font-mono text-[13px] text-primary/95">
                      settle_session
                    </code>
                    <span className="text-on-surface-variant">
                      {": "}
                      Target path for oracle authorized release of host payout and any
                      driver refund once dual verification tolerances pass.
                    </span>
                  </li>
                  <li className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                    <code className="font-mono text-[13px] text-primary/95">
                      dispute_resolution
                    </code>
                    <span className="text-on-surface-variant">
                      {": "}
                      Fallback when charger cloud and vehicle reports disagree beyond
                      policy tolerance during reconciliation.
                    </span>
                  </li>
                </ul>
              </section>

              <SectionRule />

              <section id="hardware-oracle-api" className="scroll-mt-32">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                  API Integration Oracle (V2)
                </h2>
                <p className="mt-6 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  The oracle is the target trust boundary between measured energy and on
                  chain settlement. V1 ships staged QR and escrow primitives first, while
                  OEM and charger telemetry reconciliation lands in phased releases.
                  Example payloads below are illustrative, not a guarantee of deployed
                  routes or field names.
                </p>

                <h3 className="mt-10 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  1. Session initialization (scan to authenticate)
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  When a driver scans the host QR, the client records session intent and
                  workflow state in app. Charger cloud authorization and automated
                  energize flows arrive as partner APIs connect.
                </p>
                <JsonCodeBlock methodPath="POST /api/v2/oracle/session-init">
                  {SESSION_INIT_JSON}
                </JsonCodeBlock>

                <h3 className="mt-10 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  2. Dual verification settlement payload
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  Production target authorizes payout only when charger reported and
                  vehicle reported energy stay within accepted loss tolerance (often under
                  about{" "}
                  <span className="font-headline font-semibold text-on-surface/90">
                    two percent
                  </span>
                  ). V1 documents this shape while live OEM and charger adapters roll
                  out.
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
                  npm package targets a unified interface for the session life cycle and
                  is designed to work alongside{" "}
                  <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-primary/95">
                    @solana/wallet-adapter-react
                  </code>
                  . Availability timelines are announced on official channels.
                </p>
                <h3 className="mt-8 font-headline text-lg font-bold text-on-surface sm:text-xl">
                  Installation and configuration
                </h3>
                <p className="mt-4 text-[15px] leading-[1.85] text-on-surface-variant sm:text-base">
                  Expect wallet signing helpers, RPC configuration, and event updates for
                  session status once the SDK is published publicly. Until then reference
                  the open application code and docs for patterns. Reach out at{" "}
                  <a
                    href="mailto:info@m2m.energy"
                    className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
                  >
                    info@m2m.energy
                  </a>{" "}
                  for integration questions.
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
