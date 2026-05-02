"use client";

import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const FAQS = [
  {
    q: "How do I get paid as a host?",
    a: "Payout timing follows the escrow program and session outcome you approve in wallet. Drivers commit estimated USDC on chain during the handshake, and reconciliation continues to tighten as charger cloud and OEM APIs connect. Near term you should treat earnings as routed through escrow rules visible at signing time rather than instantaneous automatic metering from legacy payment rails.",
  },
  {
    q: "Is it safe to list my home charger on the network?",
    a: "We design sessions around proof of presence. A driver must be at your location and scan the session QR you show from your dashboard before payment continuation. That lowers remote spoofing risk and binds intent to real world presence alongside our API roadmap for telemetry.",
  },
  {
    q: "How does the QR code authentication work?",
    a: "When a driver arrives, your dashboard exposes a scoped QR for this listing. The driver scans inside M2M and the app verifies a listing match before the payment step. Place and charger identity therefore stay aligned instead of trusting GPS alone.",
  },
  {
    q: "What happens if a session disconnects or the charger stops?",
    a: "Charges follow the escrow and session ledger state you acknowledged when signing. As OEM and charger cloud integrations widen, reconciliation will lean on APIs for delivered energy readings and clearer settlement outcomes.",
  },
  {
    q: "Which wallets are supported by the M2M protocol?",
    a: "M2M uses the Solana wallet adapter ecosystem. Common desktop choices include Phantom, Solflare, and Binance Web3 Wallet. On mobile browsers we open deep links into the respective wallet apps so you can approve escrow steps with fewer manual copy paste flows.",
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
            Clear answers on payments, safety, QR authorization, sessions, and wallets.
            Open one question at a time. Need more help email{" "}
            <a
              href="mailto:info@m2m.energy"
              className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
            >
              info@m2m.energy
            </a>
            .
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
