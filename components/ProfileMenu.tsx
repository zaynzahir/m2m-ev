"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useM2MProfile } from "@/hooks/useM2MProfile";

export function ProfileMenu() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { connected, disconnect, publicKey } = useWallet();
  const walletModal = useWalletModal();
  const { profile, loading: profileLoading } = useM2MProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const hasIdentity = Boolean(user) || connected;
  const display =
    profile?.display_name ??
    user?.email?.split("@")[0] ??
    (publicKey ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : "Guest");

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onSignOutAll = async () => {
    setOpen(false);
    await signOut();
    if (connected) await disconnect();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-surface-container-low/80 text-on-surface shadow-[0_0_20px_rgba(52,254,160,0.12)] transition hover:border-primary/40 hover:shadow-[0_0_24px_rgba(52,254,160,0.2)]"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Profile menu"
      >
        <span className="material-symbols-outlined text-xl text-primary">
          person
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-12 z-[150] max-h-[min(80vh,calc(100dvh-5rem))] w-[min(calc(100vw-1.5rem),20rem)] origin-top-right overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-surface-container-high/95 p-4 shadow-2xl backdrop-blur-xl m2m-rise"
          role="menu"
        >
          {authLoading || profileLoading ? (
            <div className="h-20 animate-pulse rounded-xl bg-white/5" />
          ) : hasIdentity ? (
            <div className="space-y-4">
              <div>
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Signed in
                </p>
                <p className="mt-1 font-headline font-bold text-on-surface line-clamp-2">
                  {display}
                </p>
                {user?.email ? (
                  <p className="mt-0.5 text-xs text-on-surface-variant line-clamp-1">
                    {user.email}
                  </p>
                ) : null}
                {connected && publicKey ? (
                  <p className="mt-2 break-all font-mono text-[10px] text-primary/90">
                    {publicKey.toBase58()}
                  </p>
                ) : user ? (
                  <p className="mt-2 text-xs text-secondary">
                    Link a wallet in Profile for payments.
                  </p>
                ) : null}
              </div>
              <Link
                href="/profile"
                role="menuitem"
                className="block w-full rounded-xl bg-primary/15 py-2.5 text-center font-headline text-sm font-bold text-primary transition hover:bg-primary/25"
                onClick={() => setOpen(false)}
              >
                View profile
              </Link>
              <button
                type="button"
                role="menuitem"
                className="w-full rounded-xl border border-white/10 py-2.5 font-headline text-sm font-bold text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
                onClick={() => void onSignOutAll()}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-white/20 bg-surface-container-low/40 p-4 text-center">
                <p className="font-headline text-sm font-bold text-on-surface">
                  Get started
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Sign in or connect a wallet to use M2M.
                </p>
              </div>
              <Link
                href="/auth/sign-in"
                className="block w-full rounded-xl bg-primary py-2.5 text-center font-headline text-sm font-bold text-on-primary-fixed transition hover:brightness-110"
                onClick={() => setOpen(false)}
              >
                Sign in / Create account
              </Link>
              <button
                type="button"
                className="w-full rounded-xl border border-secondary/50 bg-secondary/10 py-2.5 font-headline text-sm font-bold text-secondary transition hover:bg-secondary/20"
                onClick={() => {
                  setOpen(false);
                  walletModal.setVisible(true);
                }}
              >
                Connect wallet
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
