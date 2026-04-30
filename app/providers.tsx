"use client";

import type { ReactNode } from "react";

import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import { GoogleProfileCompletionModal } from "@/components/auth/GoogleProfileCompletionModal";
import { WalletSupabaseSync } from "@/components/auth/WalletSupabaseSync";

import { WalletContextProvider } from "./WalletContextProvider";

/**
 * Single client boundary for the app shell. Keeps `app/layout.tsx` lean and
 * avoids multiple parallel chunk loads for nested providers.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletContextProvider>
      <AuthSessionProvider>
        <WalletSupabaseSync />
        <GoogleProfileCompletionModal />
        {children}
      </AuthSessionProvider>
    </WalletContextProvider>
  );
}
