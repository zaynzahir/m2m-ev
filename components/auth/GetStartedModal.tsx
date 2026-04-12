"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export type GetStartedIntent = "driver" | "host";

type GetStartedModalProps = {
  open: boolean;
  onClose: () => void;
  intent: GetStartedIntent;
};

function nextPath(intent: GetStartedIntent) {
  return intent === "driver" ? "/charge" : "/host";
}

export function GetStartedModal({
  open,
  onClose,
  intent,
}: GetStartedModalProps) {
  const { session } = useAuth();
  const walletModal = useWalletModal();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef);

  const target = nextPath(intent);

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
      aria-labelledby="get-started-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-surface-container-high/95 p-8 shadow-2xl outline-none m2m-rise"
        style={{ animationDelay: "0ms" }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Get started
            </p>
            <h2
              id="get-started-title"
              className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface"
            >
              {intent === "driver" ? "I need a charge" : "I have a charger"}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Create an account or connect a wallet to continue.
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

          <Link
            href={
              session
                ? `${target}?from=auth`
                : `/auth/sign-in?next=${encodeURIComponent(target)}`
            }
            onClick={onClose}
            className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 font-headline font-bold text-primary transition hover:border-primary/50 hover:bg-primary/15"
          >
            <span className="material-symbols-outlined">mail</span>
            Sign in with email
          </Link>

          <button
            type="button"
            onClick={onConnectWallet}
            className="flex w-full items-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 px-4 py-3 font-headline font-bold text-secondary transition hover:border-secondary/60 hover:bg-secondary/15"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Connect Solana wallet
          </button>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-on-surface-variant">
          Email accounts can complete onboarding first, then{" "}
          <strong className="text-on-surface">link a wallet in Profile</strong>{" "}
          for on chain payments.
        </p>
      </div>
    </div>
  );
}
