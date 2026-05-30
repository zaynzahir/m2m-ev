import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { HowItWorksCta } from "@/components/how-it-works/HowItWorksCta";

const DEFAULT_LOCAL_VIDEO_URL = "/videos/how-it-works..mov";
const HOW_IT_WORKS_VIDEO_URL =
  process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL?.trim() ||
  DEFAULT_LOCAL_VIDEO_URL;

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    if (host.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.includes("youtube.com")) {
      const id = url.searchParams.get("v")?.trim();
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

const PROTOCOL_STEPS = [
  {
    title: "On chain handshake and escrow lock",
    paragraphs: [
      "The session begins before a single kilowatt is transferred. When a driver selects a listed charger on the M2M map, they start the handshake. Estimated session funds route into Solana Anchor escrow as part of the live V1 flow. The middleware layer establishes predictable terms for hosts and protected funds for drivers—no rent-taking middle operator.",
    ],
  },
  {
    title: "Scan to authenticate (Proof of Presence)",
    paragraphs: [
      "To deter spoofing, M2M requires Proof of Presence before payment flow continues. Through the dashboard, the charger owner generates a session QR. The driver scans on site and the flow advances after the scan matches this listing. This complements cloud API reconciliation: software intent tied to a real-world location while enterprise telemetry hardens settlement.",
    ],
  },
  {
    title: "Dual-verification oracle and energy delivery",
    paragraphs: [
      "While energy is delivered, our oracle pulls real-time energy output data from the charger's cloud API (OCPP and compatible backends) and matches it against the vehicle's real-time battery intake API (e.g. Tesla Fleet API). Once the data reconciles, the Solana Anchor escrow instantly releases USDC. No custom hardware required—if it has an API, it can join the network.",
    ],
  },
  {
    title: "Fast settlement and the DePIN loop",
    paragraphs: [
      "When cloud telemetry matches and session rules pass, escrow completes with sub-second Solana finality at low fees. Transparent attribution flows to hosts while drivers retain custody. This is the economic loop that scales API-connected infrastructure into verifiable DePIN participation.",
    ],
  },
] as const;

const LOOP_NODES = [
  {
    icon: "ev_station",
    label: "Host lists charger",
    detail: "OCPP cloud API node",
  },
  {
    icon: "lock",
    label: "Escrow handshake",
    detail: "Solana smart contract",
  },
  {
    icon: "qr_code_scanner",
    label: "QR authentication",
    detail: "Proof of presence",
  },
  {
    icon: "sync_alt",
    label: "Oracle reconciliation",
    detail: "Charger cloud + vehicle API",
  },
  {
    icon: "payments",
    label: "Settlement",
    detail: "After session rules pass",
  },
] as const;

export default function HowItWorksPage() {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(HOW_IT_WORKS_VIDEO_URL);
  const hasVideo = Boolean(HOW_IT_WORKS_VIDEO_URL);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-24 pt-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <header className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
            <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
              Protocol mechanics
            </p>
            <h1 className="text-balance font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl md:leading-[1.08]">
              How M2M powers the decentralized grid
            </h1>
          </header>

          {hasVideo ? (
            <section aria-labelledby="how-it-works-video" className="mx-auto mb-20 max-w-4xl md:mb-24">
              <div className="overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-black to-secondary/15 p-[1px] shadow-[0_0_70px_rgba(52,254,160,0.12)]">
                <div className="rounded-[calc(1.5rem-1px)] bg-[#040405]/95 p-5 sm:p-7">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-headline text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Product walkthrough
                      </p>
                      <h2
                        id="how-it-works-video"
                        className="mt-1 font-headline text-xl font-bold text-on-surface sm:text-2xl"
                      >
                        Watch how M2M works in practice
                      </h2>
                    </div>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                      Live demo
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <div className="aspect-video w-full">
                      {youtubeEmbedUrl ? (
                        <iframe
                          src={youtubeEmbedUrl}
                          title="How M2M works video walkthrough"
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video className="h-full w-full" controls playsInline preload="metadata">
                          <source src={HOW_IT_WORKS_VIDEO_URL} type="video/quicktime" />
                          <source src={HOW_IT_WORKS_VIDEO_URL} />
                          Sorry, your browser does not support embedded videos.
                        </video>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="mx-auto mb-20 max-w-3xl md:mb-24">
            <p className="text-left text-[15px] leading-[1.85] text-on-surface-variant sm:text-lg">
              M2M (Machine to Machine) is software-only, API-driven DePIN middleware
              on Solana. We connect existing smart chargers via OCPP cloud APIs with
              connected vehicles through enterprise APIs such as Tesla Fleet API—building
              the data bridge between physical infrastructure and on-chain settlement.
              The experience centers on a closed loop: discovery on the map, commitment
              before energy flows,{" "}
              <strong className="font-semibold text-on-surface">
                QR code authentication
              </strong>{" "}
              to prove the driver is at the node, dual-verification oracle reconciliation
              from cloud telemetry, and USDC settlement with sub-second finality.
              Together, these stages form the{" "}
              <strong className="font-semibold text-on-surface">
                M2M decentralized power loop
              </strong>
              : API-connected charging infrastructure becomes verifiable, monetizable
              middleware, while drivers gain trusted access without surrendering custody
              to a traditional platform.
            </p>
            <p className="mt-5 text-left text-[15px] leading-[1.85] text-on-surface-variant sm:text-lg">
              The{" "}
              <strong className="font-semibold text-on-surface">
                dual-verification oracle
              </strong>{" "}
              is central to our settlement model. Real-time energy output from the
              charger&apos;s cloud API is matched against the vehicle&apos;s battery
              intake API. When the data reconciles, Anchor escrow releases USDC
              instantly. Combined with session-bound QR proof of presence, the protocol
              minimizes fraud risk and aligns settlement with delivered energy. No custom
              hardware required—if it has an API, it can join the network.
            </p>
          </section>

          <section
            aria-labelledby="power-loop-overview"
            className="mx-auto mb-20 max-w-4xl md:mb-24"
          >
            <h2
              id="power-loop-overview"
              className="mb-8 text-center font-headline text-xl font-bold text-on-surface md:text-2xl"
            >
              The decentralized power loop
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-center text-[15px] leading-[1.8] text-on-surface-variant sm:text-base">
              From listing to payout, each stage reinforces the next: commitment before
              consumption, cloud telemetry reconciliation before settlement, and
              sub-second Solana finality so the middleware layer compounds with every
              successful session.
            </p>
            <div className="relative rounded-3xl border border-white/10 bg-surface-container-low/60 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
                {LOOP_NODES.map((node, i) => (
                  <div
                    key={node.label}
                    className="relative flex flex-col items-center rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-5 text-center transition hover:border-primary/25 hover:bg-white/[0.06]"
                  >
                    <span className="material-symbols-outlined mb-3 text-3xl text-primary">
                      {node.icon}
                    </span>
                    <p className="font-headline text-sm font-bold leading-snug text-on-surface">
                      {node.label}
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-on-surface-variant">
                      {node.detail}
                    </p>
                    {i < LOOP_NODES.length - 1 ? (
                      <span
                        aria-hidden
                        className="absolute -right-1 top-1/2 hidden -translate-y-1/2 text-primary/40 lg:block"
                      >
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="protocol-breakdown" className="mx-auto max-w-4xl">
            <h2
              id="protocol-breakdown"
              className="mb-4 text-center font-headline text-2xl font-bold text-on-surface md:text-3xl"
            >
              Protocol mechanics
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-on-surface-variant sm:text-base">
              Four integrated stages take a session from map selection to settled USDC.
              Together they define trust, cloud reconciliation, and economic closure for
              API-connected charging.
            </p>
            <div className="relative">
              <div
                aria-hidden
                className="absolute left-[1.15rem] top-8 bottom-8 hidden w-px bg-gradient-to-b from-primary/50 via-primary/20 to-secondary/40 md:left-[1.35rem] md:block"
              />
              <ul className="list-none space-y-0 p-0">
                {PROTOCOL_STEPS.map((step, index) => (
                  <li key={step.title} className="relative pb-12 last:pb-0 md:pb-16">
                    <div className="flex min-w-0 flex-col gap-5 md:flex-row md:gap-8">
                      <div className="flex shrink-0 items-start gap-3 md:pt-1">
                        <span className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-background font-headline text-sm font-extrabold tracking-wide text-primary shadow-[0_0_24px_rgba(52,254,160,0.25)] md:h-12 md:w-12 md:text-base">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="glass-card min-w-0 flex-1 rounded-[1.35rem] border border-white/10 p-7 shadow-xl sm:p-9">
                        <h3 className="text-balance font-headline text-xl font-bold leading-snug text-on-surface sm:text-2xl">
                          {step.title}
                        </h3>
                        <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
                          {step.paragraphs.map((para, pIdx) => (
                            <p
                              key={pIdx}
                              className="text-[15px] leading-[1.85] text-on-surface-variant sm:text-base"
                            >
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mx-auto mt-20 max-w-3xl text-center md:mt-28">
            <div className="glass-card rounded-3xl border border-white/10 px-6 py-12 shadow-[0_0_50px_rgba(0,0,0,0.35)] sm:px-10 sm:py-14">
              <p className="font-headline text-xl font-bold text-on-surface sm:text-2xl md:text-3xl">
                Join the M2M network
              </p>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant sm:text-base">
                Explore listings, onboard as a host, or read the technical and economic
                framing in our whitepaper. Questions:{" "}
                <a
                  href="mailto:info@m2m.energy"
                  className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
                >
                  info@m2m.energy
                </a>
                .
              </p>
              <div className="mt-8">
                <HowItWorksCta />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
