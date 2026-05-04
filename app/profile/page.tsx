"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { HostChargerManager } from "@/components/profile/HostChargerManager";
import { toSafeToastError } from "@/lib/client-facing-error";
import {
  deleteCurrentAccount,
  linkWalletToAuthProfile,
  resendSignupConfirmation,
  syncAuthEmailVerification,
} from "@/lib/supabase/client";
import { useM2MProfile } from "@/hooks/useM2MProfile";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { connected, publicKey, disconnect } = useWallet();
  const { profile, loading, refetch } = useM2MProfile();
  const [resendingVerify, setResendingVerify] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [walletSyncing, setWalletSyncing] = useState(false);
  const [walletSyncError, setWalletSyncError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const walletLinkAttemptKey = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#charger-management") return;
    requestAnimationFrame(() => {
      document
        .getElementById("charger-management")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [loading]);

  useEffect(() => {
    if (!user || !profile || profile.wallet_address || loading) return;
    if (!connected || !publicKey) return;

    const key = `${user.id}:${publicKey.toBase58()}`;
    if (walletLinkAttemptKey.current === key) return;
    walletLinkAttemptKey.current = key;
    setWalletSyncError(null);
    setWalletSyncing(true);

    let cancelled = false;
    void (async () => {
      try {
        await linkWalletToAuthProfile(publicKey.toBase58());
        if (!cancelled) {
          await refetch();
          setWalletSyncing(false);
        }
      } catch (e) {
        walletLinkAttemptKey.current = null;
        if (!cancelled) {
          setWalletSyncing(false);
          setWalletSyncError(
            toSafeToastError(
              e,
              "Could not link wallet to your profile. Refresh once or email info@m2m.energy.",
            ),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, user, profile, loading, refetch]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void syncAuthEmailVerification()
      .then(async () => {
        if (!cancelled) await refetch();
      })
      .catch(() => {
        // Non-fatal: profile still renders from last known state.
      });
    return () => {
      cancelled = true;
    };
  }, [user, refetch]);

  const onLogoutAll = async () => {
    await signOut();
    if (connected) await disconnect();
  };

  const onDeleteAccount = async () => {
    setDeleteAccountError(null);
    if (!user) {
      setDeleteAccountError("Sign in with email to delete this account.");
      return;
    }
    const confirmed = window.confirm(
      "Delete your account permanently? This removes your profile and charger listings.",
    );
    if (!confirmed) return;
    setDeletingAccount(true);
    try {
      await deleteCurrentAccount();
      await onLogoutAll();
      window.location.assign("/");
    } catch (e) {
      setDeleteAccountError(
        toSafeToastError(
          e,
          "Could not complete account deletion. Email info@m2m.energy if you need help.",
        ),
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const showHost = profile?.role === "host" || profile?.role === "both";
  const emailDisplay = profile?.email ?? user?.email ?? null;
  const walletAddressDisplay = profile?.wallet_address ?? publicKey?.toBase58() ?? null;
  const emailVerified = Boolean(profile?.email_verified_at);

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
                </div>
                {emailDisplay ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-on-surface-variant">
                      Email account:{" "}
                      <span className="break-all text-on-surface">{emailDisplay}</span>
                    </p>
                    <button
                      type="button"
                      disabled={emailVerified || resendingVerify}
                      onClick={() => {
                        if (!emailDisplay || emailVerified) return;
                        setVerifyNotice(null);
                        setResendingVerify(true);
                        void resendSignupConfirmation(emailDisplay)
                          .then(() => {
                            setVerifyNotice(
                              "Confirmation email sent. Check inbox and spam.",
                            );
                          })
                          .catch((e) => {
                            setVerifyNotice(
                              toSafeToastError(
                                e,
                                "Could not resend confirmation. Try again soon or email info@m2m.energy.",
                              ),
                            );
                          })
                          .finally(() => setResendingVerify(false));
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        emailVerified
                          ? "bg-primary/20 text-primary"
                          : "bg-white/10 text-on-surface-variant hover:bg-white/15"
                      }`}
                    >
                      {emailVerified
                        ? "Verified email"
                        : resendingVerify
                          ? "Resending..."
                          : "Unverified email"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-on-surface-variant">
                    Wallet identity
                  </p>
                )}
                <p className="mt-2 text-sm text-on-surface-variant">
                  Wallet address:{" "}
                  {walletAddressDisplay ? (
                    <span className="break-all text-on-surface">
                      {walletAddressDisplay}
                    </span>
                  ) : (
                    <span className="text-on-surface-variant">Not connected</span>
                  )}
                </p>
                {walletSyncing ? (
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Syncing connected wallet to your profile...
                  </p>
                ) : null}
                {walletSyncError ? (
                  <p className="mt-1 text-xs text-error">{walletSyncError}</p>
                ) : null}
                {verifyNotice ? (
                  <p className="mt-2 text-xs text-on-surface-variant">
                    {verifyNotice}
                  </p>
                ) : null}
              </div>
            </header>

            {profile ? (
              <section
                className="m2m-rise glass-card rounded-[2rem] border border-white/10 p-6 transition-all duration-500 ease-out hover:border-white/15 sm:p-8"
                style={{ animationDelay: "90ms" }}
              >
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  Profile details
                </h2>
                <ProfileEditForm
                  profile={profile}
                  onSaved={() => void refetch()}
                />
              </section>
            ) : null}

            {profile && showHost ? (
              <HostChargerManager ownerId={profile.id} />
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
                  to complete onboarding. Wallet connection is optional until you start a paid session.
                </p>
              </div>
            ) : null}

            <div
              className="flex flex-wrap justify-end gap-3 pt-4"
              style={{ animationDelay: "320ms" }}
            >
              <button
                type="button"
                onClick={() => void onDeleteAccount()}
                disabled={deletingAccount}
                className="rounded-xl border border-error/40 px-5 py-2.5 font-headline text-sm font-bold text-error transition hover:bg-error/10 disabled:opacity-60"
              >
                {deletingAccount ? "Deleting account…" : "Delete account"}
              </button>
              <button
                type="button"
                onClick={() => void onLogoutAll()}
                className="rounded-xl border border-white/15 px-5 py-2.5 font-headline text-sm font-bold text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
              >
                Sign out everywhere
              </button>
            </div>
            {deleteAccountError ? (
              <p className="text-right text-sm text-error">{deleteAccountError}</p>
            ) : null}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
