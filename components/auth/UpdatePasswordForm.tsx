"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { updatePassword } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md m2m-rise">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">
          New password
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Set a new password for your account.
        </p>
      </div>
      <div className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-2xl">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none transition focus:ring-2 focus:ring-secondary/40"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Confirm
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none transition focus:ring-2 focus:ring-secondary/40"
            />
          </div>
          {error ? (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-secondary py-3.5 font-headline font-bold text-on-secondary-fixed transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Update password"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          <Link href="/auth/sign-in" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
