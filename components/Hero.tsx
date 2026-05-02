"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import type { MouseEvent } from "react";

export function Hero() {
  const { connected } = useWallet();
  const walletModal = useWalletModal();

  const onProtectedNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!connected) {
      e.preventDefault();
      walletModal.setVisible(true);
    }
  };

  return (
    <section className="relative mx-auto flex max-w-7xl flex-col items-center space-y-8 px-4 py-14 text-center sm:px-8 sm:py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(52,254,160,0.08),transparent_50%)]" />
      <h1 className="max-w-5xl font-headline text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl">
        The Decentralized Power{" "}
        <span className="text-primary text-glow-primary">Grid for Machines</span>
      </h1>
      <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant sm:text-lg md:text-xl">
        M2M connects EV drivers with local homeowners. Find a charge anywhere, pay
        with transparent escrow, and earn USDC by sharing your home charger.
        Built on Solana with an API first roadmap.
      </p>
      <div className="flex w-full max-w-md flex-col gap-4 pt-4 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/charge"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-on-primary-fixed shadow-[0_0_25px_rgba(52,254,160,0.3)] transition-all hover:brightness-110 sm:px-8 sm:py-4"
          onClick={onProtectedNavigate}
        >
          <span className="material-symbols-outlined">search</span>
          Find a Charger
        </Link>
        <Link
          href="/host"
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-6 py-3.5 font-bold glass-card transition-all hover:bg-white/5 sm:px-8 sm:py-4"
          onClick={onProtectedNavigate}
        >
          <span className="material-symbols-outlined">ev_station</span>
          Host &amp; Earn
        </Link>
      </div>
    </section>
  );
}
