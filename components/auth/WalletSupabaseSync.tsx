"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { linkWalletToAuthProfile } from "@/lib/supabase/client";

/**
 * Keeps Supabase `public.users.wallet_address` synced to the currently connected
 * Solana wallet for authenticated users.
 */
export function WalletSupabaseSync() {
  const { user } = useAuth();
  const { connected, publicKey } = useWallet();
  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!connected) {
      lastSyncedRef.current = null;
    }
  }, [connected]);

  useEffect(() => {
    if (!user || !connected || !publicKey) return;
    const walletAddress = publicKey.toBase58();
    const key = `${user.id}:${walletAddress}`;
    if (lastSyncedRef.current === key) return;

    let cancelled = false;
    void (async () => {
      try {
        await linkWalletToAuthProfile(walletAddress);
        if (!cancelled) lastSyncedRef.current = key;
      } catch (e) {
        if (!cancelled) {
          lastSyncedRef.current = null;
          console.warn(
            "[M2M] Wallet profile sync failed:",
            e instanceof Error ? e.message : e,
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, connected, publicKey]);

  return null;
}
