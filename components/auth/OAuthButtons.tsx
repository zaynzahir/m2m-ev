"use client";

import { useState } from "react";

import { signInWithOAuthProvider } from "@/lib/supabase/client";

type OAuthButtonsProps = {
  layout?: "stack" | "inline";
};

export function OAuthButtons({ layout = "stack" }: OAuthButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  const onOAuth = async (provider: "google" | "apple") => {
    setError(null);
    setBusy(provider);
    try {
      await signInWithOAuthProvider(provider);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Sign-in with that provider could not be started. Try again.",
      );
      setBusy(null);
    }
  };

  const wrap = layout === "stack" ? "flex flex-col gap-3" : "flex flex-wrap gap-3";

  return (
    <div className={wrap}>
      {error ? (
        <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => void onOAuth("google")}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-50"
      >
        <span className="font-headline font-bold text-on-surface">Google</span>
        {busy === "google" ? (
          <span className="text-xs text-on-surface-variant">Redirecting…</span>
        ) : null}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => void onOAuth("apple")}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-50"
      >
        <span className="font-headline font-bold text-on-surface">Apple</span>
        {busy === "apple" ? (
          <span className="text-xs text-on-surface-variant">Redirecting…</span>
        ) : null}
      </button>
    </div>
  );
}
