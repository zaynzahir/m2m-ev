"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export type AccountChoiceIntent = "driver" | "host";

type AccountChoiceModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AccountChoiceModal({ open, onClose }: AccountChoiceModalProps) {
  const walletModal = useWalletModal();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef);

  const onConnectWallet = useCallback(() => {
    onClose();
    walletModal.setVisible(true);
  }, [onClose, walletModal]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    const t = window.setTimeout(() => el.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-choice-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 glass-card p-8 shadow-2xl outline-none m2m-rise"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Get started
            </p>
            <h2
              id="account-choice-title"
              className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface"
            >
              Continue with M2M
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Sign in with email or connect a Solana wallet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <OAuthButtons />

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-surface-container-high/90 px-3 text-on-surface-variant">
                or
              </span>
            </div>
          </div>

          <Link
            href="/auth/sign-in"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 font-headline font-bold text-primary transition hover:border-primary/50 hover:bg-primary/15"
          >
            <span className="material-symbols-outlined">mail</span>
            Sign in with email
          </Link>

          <button
            type="button"
            onClick={onConnectWallet}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 px-4 py-3 font-headline font-bold text-secondary transition hover:border-secondary/60 hover:bg-secondary/15"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Connect wallet
          </button>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-on-surface-variant">
          Email accounts can link a wallet from Profile for on chain payments.
        </p>
      </div>
    </div>
  );
}
