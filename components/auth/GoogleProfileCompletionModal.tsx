"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useM2MProfile } from "@/hooks/useM2MProfile";
import {
  linkWalletToAuthProfile,
  updateAuthUserProfile,
} from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "driver", label: "Driver" },
  { value: "host", label: "Host" },
  { value: "both", label: "Both" },
];

function shortWallet(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function GoogleProfileCompletionModal() {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const { profile, loading, refetch } = useM2MProfile();
  const { connected, connecting, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<UserRole>("driver");
  const [displayName, setDisplayName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [walletSyncError, setWalletSyncError] = useState<string | null>(null);
  const [walletSyncing, setWalletSyncing] = useState(false);
  const syncedKeyRef = useRef<string | null>(null);

  const isGoogleUser = useMemo(() => {
    const provider = (profile?.auth_provider ?? user?.app_metadata?.provider ?? "")
      .toString()
      .toLowerCase();
    return provider === "google";
  }, [profile?.auth_provider, user?.app_metadata?.provider]);

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (pathname.startsWith("/auth")) {
      setOpen(false);
      return;
    }
    if (!isGoogleUser) {
      setOpen(false);
      return;
    }

    const needsProfile =
      !profile.display_name?.trim() ||
      !profile.contact_method?.trim() ||
      !profile.onboarding_completed_at;
    const needsWallet = !profile.wallet_address?.trim();
    setOpen(needsProfile || needsWallet);

    if (!displayName && profile.display_name) setDisplayName(profile.display_name);
    if (!contactMethod && profile.contact_method) setContactMethod(profile.contact_method);
    if (!vehicleModel && profile.vehicle_model) setVehicleModel(profile.vehicle_model);
    if (role === "driver" && profile.role && profile.role !== "driver") {
      setRole(profile.role);
    }
  }, [
    loading,
    user,
    profile,
    pathname,
    isGoogleUser,
    displayName,
    contactMethod,
    vehicleModel,
    role,
  ]);

  useEffect(() => {
    if (!open || !user || !profile || !connected || !publicKey) return;
    if (profile.wallet_address?.trim()) return;

    const walletAddress = publicKey.toBase58();
    const key = `${user.id}:${walletAddress}`;
    if (syncedKeyRef.current === key) return;
    syncedKeyRef.current = key;
    setWalletSyncError(null);
    setWalletSyncing(true);

    let cancelled = false;
    void (async () => {
      try {
        await linkWalletToAuthProfile(walletAddress);
        if (!cancelled) {
          await refetch();
          setWalletSyncing(false);
        }
      } catch (e) {
        syncedKeyRef.current = null;
        if (!cancelled) {
          setWalletSyncing(false);
          setWalletSyncError(
            e instanceof Error ? e.message : "Could not link wallet.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, user, profile, connected, publicKey, refetch]);

  if (!open || !user || !profile) return null;

  const hasWallet = Boolean(profile.wallet_address?.trim() || publicKey?.toBase58());
  const walletDisplay = profile.wallet_address?.trim() || publicKey?.toBase58() || null;

  const onSave = async () => {
    setError(null);
    if (!displayName.trim()) {
      setError("Username / display name is required.");
      return;
    }
    if (!contactMethod.trim()) {
      setError("Phone or Telegram contact is required.");
      return;
    }
    if ((role === "driver" || role === "both") && !vehicleModel.trim()) {
      setError("Vehicle model is required for driver access.");
      return;
    }
    if (!hasWallet) {
      setError("Please connect your wallet before continuing.");
      return;
    }

    setSaving(true);
    try {
      await updateAuthUserProfile({
        role,
        display_name: displayName.trim(),
        contact_method: contactMethod.trim(),
        vehicle_model:
          role === "driver" || role === "both" ? vehicleModel.trim() : null,
        onboarding_completed_at: new Date().toISOString(),
      });
      if (publicKey) {
        await linkWalletToAuthProfile(publicKey.toBase58());
      }
      await refetch();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const launchWalletConnect = () => {
    // Keep the current onboarding values in the URL so if a wallet app opens an in-app browser,
    // the fallback wallet-first form can prefill instead of appearing empty.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("m2m_prefill", "google");
      url.searchParams.set("m2m_role", role);
      if (displayName.trim()) url.searchParams.set("m2m_name", displayName.trim());
      if (contactMethod.trim()) url.searchParams.set("m2m_contact", contactMethod.trim());
      if (vehicleModel.trim()) url.searchParams.set("m2m_vehicle", vehicleModel.trim());
      if (user.email) url.searchParams.set("m2m_email", user.email);
      window.history.replaceState({}, "", url.toString());
    }
    setVisible(true);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-white/10 bg-[#000000] shadow-[0_0_80px_rgba(52,254,160,0.08)]">
        <div className="max-h-[min(90vh,760px)] overflow-y-auto p-6 sm:p-8">
          <p className="text-center text-xs font-headline font-bold uppercase tracking-[0.2em] text-[#34fea0]">
            Continue with Google
          </p>
          <h2 className="mt-2 text-center font-headline text-2xl font-extrabold text-on-surface">
            Complete your profile
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            One-time setup: role, contact, and wallet connection for payments.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">
                Role on M2M
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">
                Username / display name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. @faisal"
              />
            </div>

            {(role === "driver" || role === "both") && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant">
                  Vehicle model
                </label>
                <input
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Tesla Model 3"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">
                Contact (phone / Telegram)
              </label>
              <input
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="+1... or @username"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
                Wallet connection
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={launchWalletConnect}
                  disabled={connecting}
                  className="wallet-m2m-primary"
                >
                  {hasWallet
                    ? `Connected: ${shortWallet(walletDisplay ?? "")}`
                    : connecting
                      ? "Waiting for wallet approval..."
                      : "Connect wallet"}
                </button>
                {walletSyncing ? (
                  <span className="text-xs text-on-surface-variant">Syncing...</span>
                ) : null}
              </div>
              {walletSyncError ? (
                <p className="mt-2 text-xs text-error">{walletSyncError}</p>
              ) : null}
              {hasWallet ? null : (
                <p className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-on-surface-variant">
                  Mobile tip: tap <strong>Connect wallet</strong>, approve in Solflare/Phantom, then return to this tab.
                </p>
              )}
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || !hasWallet}
            className="mt-6 w-full rounded-xl bg-[#34fea0] py-3.5 font-headline text-sm font-bold text-black shadow-[0_0_24px_rgba(52,254,160,0.25)] transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

