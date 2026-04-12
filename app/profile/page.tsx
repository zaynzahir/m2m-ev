"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { HostChargerControls } from "@/components/profile/HostChargerControls";
import {
  fetchChargersByOwnerId,
  linkWalletToAuthProfile,
} from "@/lib/supabase/client";
import { SUPPORTED_CHARGER_BRANDS } from "@/lib/supported-brands";
import { useM2MProfile } from "@/hooks/useM2MProfile";
import type { ChargerRow } from "@/lib/types/database";

function chargerBrandLabel(slug: string | null | undefined) {
  if (!slug) return null;
  return SUPPORTED_CHARGER_BRANDS.find((b) => b.slug === slug)?.name ?? slug;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { connected, publicKey, disconnect } = useWallet();
  const walletModal = useWalletModal();
  const { profile, loading, refetch } = useM2MProfile();
  const [chargers, setChargers] = useState<ChargerRow[]>([]);
  const [chargersLoading, setChargersLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const walletLinkAttemptKey = useRef<string | null>(null);

  const loadChargers = useCallback(async () => {
    if (!profile?.id) return;
    if (profile.role !== "host" && profile.role !== "both") {
      setChargers([]);
      return;
    }
    setChargersLoading(true);
    try {
      const rows = await fetchChargersByOwnerId(profile.id);
      setChargers(rows);
    } catch {
      setChargers([]);
    } finally {
      setChargersLoading(false);
    }
  }, [profile?.id, profile?.role]);

  useEffect(() => {
    void loadChargers();
  }, [loadChargers]);

  useEffect(() => {
    if (!user || !profile || profile.wallet_address || loading) return;
    if (!connected || !publicKey) return;

    const key = `${user.id}:${publicKey.toBase58()}`;
    if (walletLinkAttemptKey.current === key) return;
    walletLinkAttemptKey.current = key;

    let cancelled = false;
    void (async () => {
      setLinking(true);
      setLinkError(null);
      try {
        await linkWalletToAuthProfile(publicKey.toBase58());
        if (!cancelled) await refetch();
      } catch (e) {
        walletLinkAttemptKey.current = null;
        if (!cancelled) {
          setLinkError(
            e instanceof Error ? e.message : "Could not link wallet.",
          );
        }
      } finally {
        if (!cancelled) setLinking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, user, profile, loading, refetch]);

  const onLinkWallet = async () => {
    if (!user) return;
    setLinkError(null);
    if (!connected || !publicKey) {
      walletModal.setVisible(true);
      return;
    }
    setLinking(true);
    try {
      await linkWalletToAuthProfile(publicKey.toBase58());
      await refetch();
    } catch (e) {
      setLinkError(
        e instanceof Error ? e.message : "Could not link wallet.",
      );
    } finally {
      setLinking(false);
    }
  };

  const onLogoutAll = async () => {
    await signOut();
    if (connected) await disconnect();
  };

  const walletShort = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-6)}`
    : null;

  const showHost = profile?.role === "host" || profile?.role === "both";
  const emailDisplay = profile?.email ?? user?.email ?? null;
  const needsWalletLink =
    Boolean(user) && Boolean(profile) && !profile?.wallet_address;

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[80vh] w-full max-w-4xl px-4 pb-24 pt-28 sm:px-8">
        {loading ? (
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-[2rem] bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
          </div>
        ) : (
          <div className="space-y-8">
            <header
              className="m2m-rise relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-primary/10 via-surface-container-high to-secondary/10 p-5 transition-all duration-500 ease-out sm:rounded-[2rem] sm:p-10"
              style={{ animationDelay: "0ms" }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
              <div className="relative">
                <p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Your profile
                </p>
                <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
                  {profile?.display_name ??
                    emailDisplay?.split("@")[0] ??
                    "M2M member"}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 font-headline text-xs font-bold uppercase tracking-wide text-on-surface">
                    Role: {profile?.role ?? "None"}
                  </span>
                  {user?.email ? (
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-on-surface-variant">
                      Email account
                    </span>
                  ) : (
                    <span className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">
                      Wallet identity
                    </span>
                  )}
                </div>
              </div>
            </header>

            <section
              className="m2m-rise glass-card rounded-[2rem] border border-white/10 p-6 transition-all duration-500 ease-out hover:border-white/15 sm:p-8"
              style={{ animationDelay: "80ms" }}
            >
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Account
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {emailDisplay ? (
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-on-surface-variant">Email</dt>
                    <dd className="break-all font-medium text-on-surface">
                      {emailDisplay}
                    </dd>
                  </div>
                ) : (
                  <p className="text-on-surface-variant">
                    You are using a{" "}
                    <strong className="text-on-surface">wallet only</strong>{" "}
                    session. Add an email account anytime from{" "}
                    <Link href="/auth/sign-in" className="font-bold text-primary">
                      Sign in
                    </Link>
                    .
                  </p>
                )}
              </dl>
            </section>

            {profile ? (
              <section
                className="m2m-rise glass-card rounded-[2rem] border border-white/10 p-6 transition-all duration-500 ease-out hover:border-white/15 sm:p-8"
                style={{ animationDelay: "90ms" }}
              >
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  Profile details
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  One row per person: email accounts can link a wallet; wallet only
                  users edit here when connected.
                </p>
                <ProfileEditForm
                  profile={profile}
                  onSaved={() => void refetch()}
                />
              </section>
            ) : null}

            {needsWalletLink ? (
              <div
                className="m2m-rise rounded-[2rem] border border-secondary/30 bg-secondary/10 p-6 shadow-[0_0_40px_rgba(185,132,255,0.12)] transition-all duration-500 ease-out sm:p-8"
                style={{ animationDelay: "100ms" }}
              >
                <p className="font-headline text-sm font-bold text-on-surface">
                  Connect your wallet
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Link a Solana wallet to this account for payments and host
                  payouts. We will attach it automatically when you connect.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <WalletConnectButton variant="primary" />
                </div>
              </div>
            ) : null}

            <section
              className="m2m-rise glass-card rounded-[2rem] border border-white/10 p-6 transition-all duration-500 ease-out hover:border-white/15 sm:p-8"
              style={{ animationDelay: "140ms" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline text-lg font-bold text-on-surface">
                    Solana wallet
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Required for escrow, sessions, and host payouts.
                  </p>
                </div>
                <WalletConnectButton variant="primary" />
              </div>

              {connected && publicKey ? (
                <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
                  <p className="font-mono text-xs leading-relaxed break-all text-primary">
                    {publicKey.toBase58()}
                  </p>
                  {walletShort ? (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Short: {walletShort}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-on-surface-variant">
                  Connect a wallet to pay for charging sessions and receive
                  earnings.
                </p>
              )}

              {user ? (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-sm text-on-surface-variant">
                    Link this browser wallet to your email profile so sessions
                    and listings use one identity.
                  </p>
                  {linkError ? (
                    <p className="mt-2 text-sm text-error">{linkError}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void onLinkWallet()}
                    disabled={
                      linking ||
                      !connected ||
                      Boolean(profile?.wallet_address)
                    }
                    className="mt-4 rounded-xl bg-secondary/20 px-4 py-3 font-headline text-sm font-bold text-secondary transition-all duration-300 hover:bg-secondary/30 disabled:opacity-40"
                  >
                    {linking
                      ? "Linking…"
                      : profile?.wallet_address
                        ? "Wallet linked"
                        : "Link connected wallet to profile"}
                  </button>
                  {profile?.wallet_address ? (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Stored wallet matches your profile for on chain actions.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>

            {profile &&
            (profile.role === "driver" || profile.role === "both") ? (
              <section
                className="m2m-rise glass-card rounded-[2rem] border border-white/10 p-6 transition-all duration-500 ease-out hover:border-white/15 sm:p-8"
                style={{ animationDelay: "200ms" }}
              >
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  Driver
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-on-surface-variant">Display name</dt>
                    <dd className="text-on-surface">
                      {profile.display_name ?? "None"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-on-surface-variant">Vehicle</dt>
                    <dd className="text-right text-on-surface">
                      {profile.vehicle_model ?? "None"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-on-surface-variant">Contact</dt>
                    <dd className="text-right break-all text-on-surface">
                      {profile.contact_method ?? "None"}
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/charge"
                  className="mt-6 inline-flex items-center gap-2 font-headline text-sm font-bold text-primary hover:underline"
                >
                  Update driver profile
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </Link>
              </section>
            ) : null}

            {profile && showHost ? (
              <section
                className="m2m-rise glass-card rounded-[2rem] border border-white/10 p-6 transition-all duration-500 ease-out hover:border-white/15 sm:p-8"
                style={{ animationDelay: "260ms" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="font-headline text-lg font-bold text-on-surface">
                    Host listings
                  </h2>
                  <Link
                    href="/host"
                    className="text-sm font-bold text-secondary hover:underline"
                  >
                    Add / manage
                  </Link>
                </div>
                {chargersLoading ? (
                  <p className="mt-4 text-sm text-on-surface-variant">
                    Loading chargers…
                  </p>
                ) : chargers.length === 0 ? (
                  <p className="mt-4 text-sm text-on-surface-variant">
                    No chargers listed yet.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {chargers.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-xl border border-white/10 bg-surface-container-low/40 px-4 py-3 transition-colors duration-300 hover:border-primary/20"
                      >
                        <p className="font-headline font-bold text-on-surface">
                          {c.title ?? c.label ?? "Charger"}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {[
                            chargerBrandLabel(c.charger_brand_slug),
                            c.plug_type,
                            `$${Number(c.price_per_kwh).toFixed(2)}/kWh`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {profile?.id ? (
                          <HostChargerControls
                            charger={c}
                            ownerId={profile.id}
                            onChanged={() => void loadChargers()}
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {!profile ? (
              <div
                className="m2m-rise rounded-[2rem] border border-dashed border-white/20 p-8 text-center"
                style={{ animationDelay: "120ms" }}
              >
                <p className="text-on-surface-variant">
                  No profile yet.{" "}
                  <Link href="/auth/sign-in" className="font-bold text-primary">
                    Create an account
                  </Link>{" "}
                  or connect a wallet and complete onboarding.
                </p>
              </div>
            ) : null}

            <div
              className="flex flex-wrap justify-end gap-3 pt-4"
              style={{ animationDelay: "320ms" }}
            >
              <button
                type="button"
                onClick={() => void onLogoutAll()}
                className="rounded-xl border border-white/15 px-5 py-2.5 font-headline text-sm font-bold text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
              >
                Sign out everywhere
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
