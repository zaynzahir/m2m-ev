"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AccountChoiceModal } from "@/components/auth/AccountChoiceModal";
import { useAuth } from "@/components/auth/AuthProvider";

export function RoleCards() {
  const router = useRouter();
  const { connected } = useWallet();
  const { session } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const go = (target: "driver" | "host") => {
    const path = target === "driver" ? "/charge" : "/host";
    if (session || connected) {
      router.push(path);
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 glass-card transition-all duration-500 hover:border-primary/20 sm:p-10">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">
                  directions_car
                </span>
              </div>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
                I need to charge.
              </h2>
              <p className="text-base leading-relaxed text-on-surface-variant sm:text-lg">
                Connect your Solana wallet, locate a nearby M2M host, lock your
                payment in our Escrow Smart Contract, and plug in. No
                subscriptions, no hidden fees.
              </p>
              <button
                type="button"
                onClick={() => go("driver")}
                className="text-primary font-bold flex items-center gap-2 group/btn bg-transparent border-0 p-0 cursor-pointer"
              >
                Get started{" "}
                <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 glass-card transition-all duration-500 hover:border-secondary/20 sm:p-10">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-4xl">
                  home
                </span>
              </div>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
                I have a charger.
              </h2>
              <p className="text-base leading-relaxed text-on-surface-variant sm:text-lg">
                List your home EV charger on the M2M network. Our Oracle
                verifies the energy dispensed, and our Solana Smart Contract
                streams USDC directly to your wallet.
              </p>
              <button
                type="button"
                onClick={() => go("host")}
                className="text-secondary font-bold flex items-center gap-2 group/btn bg-transparent border-0 p-0 cursor-pointer"
              >
                Register host{" "}
                <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <AccountChoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
