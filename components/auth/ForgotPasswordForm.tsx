"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { toSafeToastError } from "@/lib/client-facing-error";
import { requestPasswordResetEmail } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordResetEmail(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        toSafeToastError(
          err,
          "Request did not send. Try again or email info@m2m.energy.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-md text-center m2m-rise">
        <p className="font-headline text-lg font-bold text-on-surface">
          Check your email
        </p>
        <p className="mt-3 text-sm text-on-surface-variant">
          If an account exists for that address, we sent a reset link. Check inbox and
          spam, then tap the link soon so your recovery session stays valid. Still stuck
          after a few minutes?{" "}
          <a
            href="mailto:info@m2m.energy"
            className="font-bold text-primary underline"
          >
            info@m2m.energy
          </a>
          .
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-8 inline-block font-bold text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md m2m-rise">
      <div className="mb-10 text-center">
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">
          Reset password
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          We email you a secure reset link. Use it soon after it arrives so recovery stays
          active. Check spam if you do not see it. Support{" "}
          <a
            href="mailto:info@m2m.energy"
            className="font-bold text-primary underline"
          >
            info@m2m.energy
          </a>
          .
        </p>
      </div>
      <div className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-2xl">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="forgot-email"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none transition focus:ring-2 focus:ring-primary/40"
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
            className="w-full rounded-xl bg-primary py-3.5 font-headline font-bold text-on-primary-fixed transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send reset link"}
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
