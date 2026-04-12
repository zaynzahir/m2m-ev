"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchProfileForViewer } from "@/lib/supabase/auth-profile";
import type { UserProfileRow } from "@/lib/types/database";

export function useM2MProfile() {
  const { user, loading: authLoading } = useAuth();
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchProfileForViewer({
        authUserId: user?.id,
        walletAddress: publicKey?.toBase58(),
      });
      setProfile(p);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, publicKey]);

  useEffect(() => {
    if (authLoading) return;
    void refetch();
  }, [authLoading, refetch]);

  return {
    profile,
    loading: loading || authLoading,
    refetch,
  };
}
