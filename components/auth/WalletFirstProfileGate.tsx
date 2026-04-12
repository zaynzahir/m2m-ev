"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { fetchUserProfileByWallet } from "@/lib/supabase/client";

export function WalletFirstProfileGate({
  children,
  redirectTo = "/",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const walletModal = useWalletModal();

  const requestedModalRef = useRef(false);
  const [checked, setChecked] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!connected) {
      if (!requestedModalRef.current) {
        requestedModalRef.current = true;
        walletModal.setVisible(true);
      }
      setChecked(false);
      return;
    }

    (async () => {
      try {
        if (!publicKey) return;
        const profile = await fetchUserProfileByWallet(publicKey.toBase58());
        setProfileExists(Boolean(profile));
      } catch {
        setProfileExists(false);
      } finally {
        setChecked(true);
      }
    })();
  }, [connected, publicKey, walletModal]);

  useEffect(() => {
    if (checked && profileExists) {
      router.replace(redirectTo);
    }
  }, [checked, profileExists, router, redirectTo]);

  if (!connected || !checked) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-8">
        <div className="h-[min(420px,55vh)] min-h-[240px] w-full animate-pulse rounded-2xl border border-white/5 bg-surface-container-low sm:h-[420px] sm:rounded-3xl" />
      </div>
    );
  }

  return !profileExists ? <>{children}</> : null;
}

