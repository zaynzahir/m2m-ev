import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

function SectionDivider() {
  return (
    <div className="relative my-14 md:my-18" aria-hidden>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
    </div>
  );
}

function Money({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <span
      className={`max-sm:whitespace-normal sm:whitespace-nowrap font-headline font-bold tabular-nums ${
        variant === "primary"
          ? "text-primary [text-shadow:0_0_24px_rgba(52,254,160,0.35)]"
          : "text-secondary [text-shadow:0_0_24px_rgba(185,132,255,0.35)]"
      }`}
    >
      {children}
    </span>
  );
}

const architecturePillars = [
  {
    title: "Proof of Presence",
    body: "Sessions are initiated via a QR code handshake at the location to deter spoofing and confirm the driver is at the node before payment flow proceeds—complementing cloud API reconciliation.",
  },
  {
    title: "Dual-verification oracle",
    body: "Our oracle pulls real-time energy output data from the charger's cloud API and matches it against the vehicle's real-time battery intake API. Once the data matches, the Solana Anchor escrow instantly releases USDC. No custom hardware required—if it has an API, it can join the network.",
  },
  {
    title: "Solana escrow",
    body: "Funds route through Solana Anchor escrow with shared session rules so hosts and drivers have clear milestones for lock, charge, release, or refund—settlement with sub-second finality and transparent on-chain attribution.",
  },
] as const;

const roadmapPhases = [
  {
    title: "Phase 1 (Current): V1 Web Application & Devnet Escrow Live",
    items: [
      {
        label: "Production Web Application",
        text: "Map discovery, session intent flow, QR proof of presence, and host onboarding—establishing the software middleware layer between listed infrastructure and on-chain settlement.",
      },
      {
        label: "Devnet Escrow",
        text: "Solana Anchor escrow programs live on devnet with session lifecycle rules for lock, charge, release, and refund stages.",
      },
      {
        label: "Protocol Foundations",
        text: "Open reference architecture for API-driven DePIN coordination, documented for ecosystem review and Superteam grant alignment.",
      },
    ],
  },
  {
    title: "Phase 2 (Summer 2026): Enterprise API Integrations & Oracle Sandbox",
    items: [
      {
        label: "Tesla Fleet API Integration",
        text: "Secure pipelines to pull real-time vehicle battery intake data from Tesla and compatible enterprise OEM APIs.",
      },
      {
        label: "OCPP Charger Cloud Integration",
        text: "Middleware bridges to OCPP and charger cloud backends—connecting existing smart chargers without custom hardware deployment.",
      },
      {
        label: "Oracle Middleware Sandbox",
        text: "Dual-verification oracle sandbox testing: reconciling charger energy output against vehicle intake before Anchor escrow releases USDC.",
      },
    ],
  },
  {
    title: "Phase 3 (Fall 2026): Colosseum, Mainnet-Beta & Mobile",
    items: [
      {
        label: "Colosseum Hackathon",
        text: "Participation in the Colosseum ecosystem hackathon to accelerate middleware adoption and Solana-native DePIN integrations.",
      },
      {
        label: "Mainnet-Beta Launch",
        text: "Transition core escrow and oracle middleware from devnet to Solana mainnet-beta for institutional pilot deployments.",
      },
      {
        label: "Mobile App Rollout",
        text: "Native iOS and Android clients optimized for in-vehicle use, featuring Solana wallet integrations and session management.",
      },
    ],
  },
] as const;

export default function WhitepaperPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 pb-28 pt-28 sm:px-8">
        <div className="mx-auto max-w-3xl min-w-0 lg:max-w-[52rem]">
          <article className="relative min-w-0 overflow-x-hidden rounded-[1.75rem] border border-white/[0.09] bg-surface-container-low/40 shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[2rem]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />
            <div className="px-6 py-12 sm:px-10 sm:py-14 md:px-14 md:py-18 lg:px-16 lg:py-20">
              <header className="border-b border-white/[0.08] pb-10 text-center md:pb-12">
                <p className="font-headline text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90 sm:text-xs">
                  Superteam grant application
                </p>
                <h1 className="mt-5 text-balance font-headline text-[1.65rem] font-extrabold leading-[1.12] tracking-tight text-on-surface sm:text-3xl md:text-[2.125rem] md:leading-[1.1] lg:text-[2.35rem]">
                  M2M Network: API-Driven DePIN Middleware for Machines
                </h1>
                <p className="mx-auto mt-6 max-w-xl font-headline text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant/95 md:text-[0.8125rem]">
                  Software-Only Infrastructure Coordination on Solana
                </p>
                <p className="mx-auto mt-8 max-w-lg text-[13px] leading-relaxed text-on-surface-variant/80">
                  Confidential draft for ecosystem review. Technical and economic
                  specifications align with the M2M protocol roadmap. Ecosystem contact:{" "}
                  <a
                    href="mailto:info@m2m.energy"
                    className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
                  >
                    info@m2m.energy
                  </a>
                  .
                </p>
              </header>

              <div className="prose prose-m2m prose-lg max-w-none pt-12 md:prose-xl md:pt-14 [&_h2]:scroll-mt-28">
                <section>
                  <h2 className="!mt-0 !mb-6 border-b border-white/[0.06] pb-4 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl md:!mb-8 md:text-[1.375rem] md:leading-snug">
                    Executive Summary
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    M2M (Machine to Machine) is software-only, API-driven DePIN
                    middleware built natively on Solana. We connect existing smart
                    chargers via OCPP cloud APIs with connected vehicles through
                    enterprise APIs such as Tesla Fleet API—building the data bridge
                    between physical energy infrastructure and on-chain smart contracts.
                    We transform API-connected charging stations into permissionless,
                    monetizable nodes settled in USDC with sub-second finality. Our V1
                    web application and devnet escrow are live today; Phase 2 delivers
                    enterprise API integrations and oracle middleware sandbox testing.
                  </p>
                  <p className="!mt-5 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    <strong className="font-semibold text-on-surface">
                      No custom hardware required.
                    </strong>{" "}
                    If it has an API, it can join the network. M2M is developed in the
                    open: the application and protocol reference implementations are
                    released (or will be released) under an open source license, with
                    public repositories linked from official channels as they are
                    published. This proposal and the developer documentation describe
                    the same public-facing architecture.
                  </p>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="!mt-0 !mb-6 border-b border-white/[0.06] pb-4 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl md:!mb-8 md:text-[1.375rem] md:leading-snug">
                    Why Solana? The micro transaction imperative
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    Machine scale energy transfer benefits from an economic environment that
                    legacy payment rails rarely support well. Traditional gateways charge
                    flat base fees that make micro charging economically unviable for
                    hosts. Solana is one of the few networks capable of handling our
                    required throughput with fast finality and fees
                    well below{" "}
                    <Money>$0.01</Money>. By utilizing Solana, M2M replaces opaque
                    payment processors with programmable escrow and near instant cross border
                    USDC settlement, helping hosts retain more of each session.
                  </p>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="!mt-0 !mb-6 border-b border-white/[0.06] pb-4 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl md:!mb-8 md:text-[1.375rem] md:leading-snug">
                    Architecture and the dual verification oracle
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    The integrity of M2M depends on cloud data reconciliation and
                    deterministic settlement rules rather than discretionary manual
                    calls. Our dual-verification oracle pairs Proof of Presence with
                    real-time telemetry from charger and vehicle enterprise APIs.
                  </p>
                  <p className="!mt-5 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    V1 demonstrates QR-authenticated session flow and devnet escrow
                    lifecycle. Phase 2 integrates Tesla Fleet API and OCPP charger
                    cloud pipelines—the oracle middleware sandbox reconciles energy
                    output against battery intake before Anchor escrow releases USDC.
                  </p>
                  <div className="not-prose my-10 space-y-5">
                    {architecturePillars.map((pillar) => (
                      <div
                        key={pillar.title}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-5 shadow-sm sm:px-6 sm:py-6"
                      >
                        <h3 className="font-headline text-base font-bold text-primary sm:text-lg">
                          {pillar.title}
                        </h3>
                        <p className="mt-3 text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                          {pillar.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="!mt-0 !mb-6 border-b border-white/[0.06] pb-4 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl md:!mb-8 md:text-[1.375rem] md:leading-snug">
                    Engineering roadmap
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    Our roadmap is structured into three phases of middleware
                    execution—from live devnet escrow through enterprise API
                    integrations to mainnet-beta and mobile rollout:
                  </p>
                  <div className="not-prose mt-10 space-y-12 md:space-y-14">
                    {roadmapPhases.map((phase, phaseIdx) => (
                      <div key={phase.title} className="relative">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                          <span className="inline-flex items-center justify-center rounded-full border border-secondary/25 bg-secondary/[0.08] px-2.5 py-0.5 font-headline text-[11px] font-bold tabular-nums uppercase tracking-wider text-secondary/95">
                            {String(phaseIdx + 1).padStart(2, "0")}
                          </span>
                          <h3 className="font-headline text-lg font-bold leading-snug text-on-surface sm:text-xl">
                            {phase.title}
                          </h3>
                        </div>
                        <ul className="mt-6 space-y-5 border-l border-white/[0.12] pl-5 md:mt-7 md:pl-6">
                          {phase.items.map((item) => (
                            <li key={item.label} className="list-none">
                              <p className="font-headline text-sm font-semibold text-on-surface sm:text-[0.9375rem]">
                                {item.label}
                              </p>
                              <p className="mt-2 text-[15px] leading-[1.82] text-on-surface-variant sm:text-base">
                                {item.text}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
