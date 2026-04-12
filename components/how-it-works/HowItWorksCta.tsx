"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import type { MouseEvent } from "react";

export function HowItWorksCta() {
  const { connected } = useWallet();
  const walletModal = useWalletModal();

  const onChargeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!connected) {
      e.preventDefault();
      walletModal.setVisible(true);
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
      <Link
        href="/charge"
        onClick={onChargeClick}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-headline text-sm font-bold text-on-primary-fixed shadow-[0_0_25px_rgba(52,254,160,0.35)] transition-all hover:brightness-110 sm:text-base"
      >
        <span className="material-symbols-outlined text-xl">search</span>
        Find a Charger
      </Link>
      <Link
        href="/whitepaper"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-8 py-4 font-headline text-sm font-bold text-secondary shadow-[0_0_20px_rgba(185,132,255,0.15)] transition-all hover:border-secondary hover:bg-secondary/15 sm:text-base"
      >
        <span className="material-symbols-outlined text-xl">menu_book</span>
        Read the Whitepaper
      </Link>
    </div>
  );
}
