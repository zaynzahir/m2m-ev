import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { HowItWorksCta } from "@/components/how-it-works/HowItWorksCta";

const PROTOCOL_STEPS = [
  {
    title: "On-Chain Handshake & Escrow Lock",
    paragraphs: [
      "The session begins before a single kilowatt is transferred. When a driver selects a host's charger on the M2M map, they initiate an on-chain handshake. The estimated session cost is secured in a decentralized Solana escrow smart contract. This trustless lock ensures hosts know they will be paid, and drivers know their funds are safe until the energy is actually delivered. No centralized middlemen, no counterparty guesswork.",
    ],
  },
  {
    title: "Scan-to-Authenticate (Proof of Presence)",
    paragraphs: [
      "To ensure absolute security and prevent spoofing, M2M requires physical Proof of Presence to unlock the hardware. Through the M2M host dashboard, the charger owner generates a unique, session-specific QR code. The driver uses their M2M app to scan this QR code directly at the physical location. Once the scan is validated by the network, the hardware is triggered, and the session officially begins.",
    ],
  },
  {
    title: "Dual Verification Oracle & Energy Delivery",
    paragraphs: [
      "As electrons flow, the M2M protocol monitors the session in real-time. We utilize a dual-verification oracle model that continuously reconciles the energy output reported by the host's charging hardware with the energy intake reported by the driver's vehicle telematics. This guarantees that both sides remain honest, preventing hardware tampering and ensuring the driver only pays for exactly what their car receives.",
    ],
  },
  {
    title: "Sub-Second Settlement & The DePIN Loop",
    paragraphs: [
      "Once the vehicle is fully charged or the driver ends the session, the oracle finalizes the exact energy usage. Built on Solana, the escrow smart contract instantly settles the payment with sub-second finality and near-zero fees. The host receives their earnings immediately directly to their wallet. Home chargers become revenue-generating assets, drivers get reliable access to a decentralized grid, and the M2M network grows stronger with every plug-in.",
    ],
  },
] as const;

const LOOP_NODES = [
  {
    icon: "ev_station",
    label: "Host lists charger",
    detail: "DePIN node on the map",
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
    detail: "Hardware + vehicle data",
  },
  {
    icon: "payments",
    label: "Instant settlement",
    detail: "Wallet to wallet",
  },
] as const;

export default function HowItWorksPage() {
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
            <p className="mx-auto mt-6 max-w-3xl text-left text-[15px] leading-[1.85] text-on-surface-variant sm:text-lg">
              M2M (Machine to Machine) is a DePIN protocol on Solana that connects EV
              drivers with residential charging capacity. The full experience is built
              around a closed loop: discovery on the map, cryptographic commitment
              before energy flows,{" "}
              <strong className="font-semibold text-on-surface">
                QR code authentication
              </strong>{" "}
              to prove the driver is physically present, dual verification of energy
              delivery, and programmable settlement back to participants&apos; wallets.
              Together, these stages form the{" "}
              <strong className="font-semibold text-on-surface">
                M2M decentralized power loop
              </strong>
              : idle home infrastructure becomes verifiable, monetizable infrastructure,
              while drivers gain trusted access without surrendering custody to a
              traditional platform.
            </p>
            <p className="mx-auto mt-5 max-w-3xl text-left text-[15px] leading-[1.85] text-on-surface-variant sm:text-lg">
              The{" "}
              <strong className="font-semibold text-on-surface">
                scan-to-authenticate
              </strong>{" "}
              layer is central to our security model. Session-bound QR codes tie a
              charging session to a real-world location, closing the gap between
              software intent and physical plug-in. Combined with oracle-backed
              metering, the protocol minimizes fraud, supports future hardware
              integrations, and keeps settlement aligned with actual energy
              transferred.
            </p>
          </header>

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
              consumption, presence before power, verification before settlement, and
              instant finality on-chain so the network compounds with every successful
              session.
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
              Four integrated stages take a session from map selection to settled payment.
              Together they define trust, presence, measurement, and economic closure
              for peer-to-peer charging.
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
                Explore live listings, onboard as a host, or read the full technical and
                economic framing in our whitepaper.
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
