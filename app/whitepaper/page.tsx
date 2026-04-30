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
    body: "Sessions are initiated via a physical QR-code handshake at the location, preventing GPS spoofing and ensuring the driver is physically at the node.",
  },
  {
    title: "Dual-Verification Oracle",
    body: "Once a session begins, the protocol does not rely on a single source of truth. Our oracle reconciles charger-cloud telemetry and event APIs with the driver's vehicle OEM telemetry APIs.",
  },
  {
    title: "Trustless Escrow",
    body: "USDC is locked in a Solana smart contract prior to charging. When reconciliation and session rules pass, proportionate payment is released to the host and any excess is returned to the driver.",
  },
] as const;

const roadmapPhases = [
  {
    title: "Phase 1: Foundation, Security, and Mainnet Beta",
    items: [
      {
        label: "Legal & Compliance",
        text: "Establish the formal legal wrapper/entity required to operate an API-integrated decentralized energy coordination network.",
      },
      {
        label: "Smart Contract Audits",
        text: "Comprehensive third-party security audits of the M2M Solana escrow programs to ensure total protection of user funds.",
      },
      {
        label: "Mainnet Migration",
        text: "Transitioning the core escrow and session-mapping infrastructure from devnet to Solana Mainnet-Beta for a closed beta pilot.",
      },
    ],
  },
  {
    title: "Phase 2: API Oracle & Protocol Middleware",
    items: [
      {
        label: "OEM & Telemetry Integrations",
        text: "Building out the secure API pipelines to pull real-time vehicle data directly from major EV manufacturers.",
      },
      {
        label: "Charger Middleware",
        text: "Expanding software bridges to charger-cloud APIs and network providers, enabling standard Level 2 / Level 3 infrastructure without custom hardware dependency.",
      },
      {
        label: "Oracle Deployment",
        text: "Launching staged Dual-Verification Oracle automation for reconciliation and payment release using API-fed telemetry.",
      },
    ],
  },
  {
    title: "Phase 3: Consumer Scale & Mobile Clients",
    items: [
      {
        label: "Native Mobile Applications",
        text: "Launching polished iOS and Android clients optimized for fast, in-car use, featuring native Solana wallet integrations.",
      },
      {
        label: "Host Onboarding Scaling",
        text: "Deploying targeted incentive programs to rapidly density the network of available home and commercial chargers in key metropolitan areas.",
      },
      {
        label: "Protocol Decentralization",
        text: "Beginning the process of decentralizing the oracle nodes to ensure the network remains censorship-resistant and robust.",
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
                  Grant proposal
                </p>
                <h1 className="mt-5 text-balance font-headline text-[1.65rem] font-extrabold leading-[1.12] tracking-tight text-on-surface sm:text-3xl md:text-[2.125rem] md:leading-[1.1] lg:text-[2.35rem]">
                  M2M Network: The Decentralized Power Grid for Machines
                </h1>
                <p className="mx-auto mt-6 max-w-xl font-headline text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant/95 md:text-[0.8125rem]">
                  Solana Foundation Grant Proposal
                </p>
                <p className="mx-auto mt-8 max-w-lg text-[13px] leading-relaxed text-on-surface-variant/80">
                  Confidential draft for ecosystem review. Technical and economic
                  specifications align with the M2M protocol roadmap.
                </p>
              </header>

              <div className="prose prose-m2m prose-lg max-w-none pt-12 md:prose-xl md:pt-14 [&_h2]:scroll-mt-28">
                <section>
                  <h2 className="!mt-0 !mb-6 border-b border-white/[0.06] pb-4 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl md:!mb-8 md:text-[1.375rem] md:leading-snug">
                    Executive Summary
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    M2M (Machine to Machine) is a Decentralized Physical Infrastructure
                    Network (DePIN) built natively on Solana, designed to bridge the
                    massive gap between accelerating EV adoption and lagging public
                    infrastructure. By transforming idle residential and commercial
                    charging stations into permissionless, monetizable nodes, M2M
                    unlocks a global, peer-to-peer energy grid. We facilitate
                    trust-minimized charging sessions routed through on-chain escrow
                    rails. We are seeking a{" "}
                    <Money>$100,000 USD</Money> ecosystem grant to transition our V1
                    architecture from devnet to mainnet, finalize our legal entity
                    structuring, execute rigorous smart contract audits, and scale our
                    engineering team for API integrations and protocol reliability.
                  </p>
                  <p className="!mt-5 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    <strong className="font-semibold text-on-surface">
                      Open source:
                    </strong>{" "}
                    M2M is developed in the open: the application and protocol
                    reference implementations are released (or will be released)
                    under an open-source license, with public repositories linked
                    from official channels as they are published. This grant proposal
                    and the developer documentation describe the same public-facing
                    architecture.
                  </p>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="!mt-0 !mb-6 border-b border-white/[0.06] pb-4 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl md:!mb-8 md:text-[1.375rem] md:leading-snug">
                    Why Solana? The Micro-Transaction Imperative
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    Machine-scale energy transfer requires an economic environment that
                    legacy payment rails cannot support. Traditional gateways charge
                    flat base fees that make micro-charging economically unviable for
                    hosts. Solana is one of the few networks capable of handling our
                    required throughput with sub-second finality and transaction fees
                    well below{" "}
                    <Money>$0.01</Money>. By utilizing Solana, M2M replaces opaque
                    payment processors with trustless escrow and instant, cross-border
                    USDC settlement—ensuring hosts keep exactly what they earn.
                  </p>
                </section>

                <SectionDivider />

                <section>
                  <h2 className="!mt-0 !mb-6 border-b border-white/[0.06] pb-4 font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl md:!mb-8 md:text-[1.375rem] md:leading-snug">
                    Architecture &amp; The Dual-Verification Oracle
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    The integrity of the M2M protocol relies on absolute data accuracy
                    without human intervention. Our architecture utilizes a unique
                    Dual-Verification Oracle paired with physical Proof of Presence:
                  </p>
                  <p className="!mt-5 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    Current V1 demonstrates staged QR-authenticated session flow and
                    escrow lifecycle foundations. Full live OEM + charger telemetry
                    reconciliation is being integrated as the next protocol phase.
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
                    Grant Deployment &amp; Engineering Roadmap
                  </h2>
                  <p className="!mt-0 text-[15px] leading-[1.85] sm:text-base md:leading-[1.82]">
                    To realize the DePIN vision, our roadmap is structured into three
                    distinct phases of execution:
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
