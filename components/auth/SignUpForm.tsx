"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { resendSignupConfirmation, signUpWithEmail } from "@/lib/supabase/client";

type SignUpFormProps = {
  nextHref: string;
};

export function SignUpForm({ nextHref }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needEmailConfirm, setNeedEmailConfirm] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUpWithEmail(
        email.trim(),
        password,
      );
      if (needsEmailConfirmation) {
        setNeedEmailConfirm(true);
        return;
      }
      router.push(nextHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (needEmailConfirm) {
    return (
      <div className="mx-auto w-full max-w-md text-center m2m-rise">
        <p className="font-headline text-lg font-bold text-on-surface">
          Confirm your email
        </p>
        <p className="mt-3 text-sm text-on-surface-variant">
          We sent a link to <strong className="text-on-surface">{email}</strong>.
          After confirming, sign in or you will be redirected from the link.
        </p>
        <button
          type="button"
          disabled={resending}
          onClick={() => {
            setResending(true);
            void resendSignupConfirmation(email.trim())
              .catch(() => {})
              .finally(() => setResending(false));
          }}
          className="mt-6 font-bold text-secondary hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend confirmation email"}
        </button>
        <p className="mt-8 text-sm text-on-surface-variant">
          <Link href="/auth/sign-in" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md m2m-rise">
      <div className="mb-10 text-center">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.25em] text-secondary">
          Join M2M
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Create account
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Connect a Solana wallet from Profile when you are ready for on-chain
          actions.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-2xl">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="signup-email"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none transition focus:ring-2 focus:ring-secondary/40"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="signup-password"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none transition focus:ring-2 focus:ring-secondary/40"
            />
            <p className="text-xs text-on-surface-variant/80">
              At least 8 characters.
            </p>
          </div>

          {error ? (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-secondary py-3.5 font-headline font-bold text-on-secondary-fixed shadow-[0_0_24px_rgba(185,132,255,0.25)] transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
          <p className="text-center text-xs uppercase tracking-widest text-on-surface-variant">
            Or continue with
          </p>
          <OAuthButtons />
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(nextHref)}`}
            className="font-bold text-secondary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
