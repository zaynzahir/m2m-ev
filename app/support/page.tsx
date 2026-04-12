"use client";

import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const FAQS = [
  {
    q: "How do I get paid as a host?",
    a: "Earnings are settled instantly and trustlessly on the Solana blockchain. When a driver initiates a session, their estimated USDC cost is locked in an on-chain escrow smart contract. Once the session is complete, our Dual-Verification Oracle confirms the exact energy delivered and releases the funds directly to your connected wallet. There are no centralized payment processors, meaning you receive your funds with sub-second finality and zero intermediary fees.",
  },
  {
    q: "Is it safe to list my home charger on the network?",
    a: "Absolutely. Hardware and property security is our baseline. M2M utilizes a physical 'Proof of Presence' system. A driver cannot remotely activate your charger. They must be physically present to scan a session-specific, cryptographically secure QR code generated on your Host Dashboard. This handshake authorizes the hardware, ensuring only verified users can access your charging node.",
  },
  {
    q: "How does the QR code authentication work?",
    a: "When a driver arrives at a reserved location, the host's dashboard will display a secure, time-sensitive QR code. The driver uses the M2M app to scan this code, creating a cryptographic signature that links their wallet, the vehicle, and the physical charger. Once the oracle validates this handshake, the hardware is unlocked and energy begins to flow.",
  },
  {
    q: "What happens if a session disconnects or the hardware fails?",
    a: "You only pay for the exact energy you receive. Because M2M uses a Dual-Verification Oracle, we continuously reconcile the energy output reported by the charger with the energy intake reported by your vehicle's telemetry. If a session drops or hardware fails, the oracle calculates the precise fractional energy delivered up to that millisecond, settles that exact amount with the host, and instantly refunds the remaining locked USDC back to the driver's wallet.",
  },
  {
    q: "Which wallets are supported by the M2M protocol?",
    a: "M2M supports all major standard Solana wallet adapters. For desktop users, we highly recommend Phantom, Solflare, or Backpack browser extensions. For drivers on the go, our mobile web application supports seamless deep-linking into the native mobile apps of these respective wallets for secure, one-tap escrow signing.",
  },
] as const;

export default function SupportPage() {
  /** Single-open accordion: opening a question closes the others. */
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-4 pb-28 pt-28 sm:px-8">
        <header className="mb-12 border-b border-white/[0.08] pb-10">
          <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
            Help center
          </p>
          <h1 className="mb-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            Support
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-on-surface-variant sm:text-base">
            Clear answers for hosts and drivers on payments, safety, QR
            authentication, sessions, and wallets. Open one question at a time for
            an easy read.
          </p>
        </header>

        <div className="space-y-3 md:space-y-4">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.q}
                className="glass-card overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.2)] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.14]"
              >
                <button
                  type="button"
                  id={`faq-${i}-button`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}-panel`}
                  onClick={() =>
                    setOpenIndex(isOpen ? null : i)
                  }
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors md:px-6 md:py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="pr-2 font-headline text-base font-bold leading-snug text-on-surface md:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={`material-symbols-outlined shrink-0 text-primary transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      id={`faq-${i}-panel`}
                      role="region"
                      aria-labelledby={`faq-${i}-button`}
                      aria-hidden={!isOpen}
                      className={`border-t border-white/[0.06] px-5 md:px-6 ${
                        isOpen ? "pb-5 pt-4 md:pb-6 md:pt-5" : "pb-0 pt-0"
                      }`}
                    >
                      <p className="text-[15px] leading-[1.82] text-on-surface-variant sm:text-base sm:leading-[1.8]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
