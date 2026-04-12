"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase/client";

type Tab = "signin" | "signup";

type EmailAuthTabsProps = {
  nextHref: string;
};

export function EmailAuthTabs({ nextHref }: EmailAuthTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignupSuccess(null);
    setSubmitting(true);
    try {
      if (tab === "signin") {
        await signInWithEmail(email.trim(), password);
      } else {
        const { needsEmailConfirmation } = await signUpWithEmail(
          email.trim(),
          password,
        );
        if (needsEmailConfirmation) {
          setSignupSuccess(
            "Account created successfully! Please check your email to verify, then sign in.",
          );
          return;
        }
      }
      router.push(nextHref);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tab === "signin"
            ? "Sign in failed."
            : "Sign up failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-surface-container-low/40 px-4 py-3 text-on-surface outline-none transition duration-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/25";

  return (
    <div className="mx-auto w-full max-w-md transition-all duration-300 m2m-rise">
      <div className="mb-8 text-center">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.25em] text-primary/90">
          M2M
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Welcome
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Sign in or create an account. Link a Solana wallet from Profile for
          payments.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/10 p-1 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div
          className="flex rounded-[1.75rem] bg-black/25 p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signin"}
            className={`flex-1 rounded-2xl py-3 font-headline text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
              tab === "signin"
                ? "bg-primary/20 text-primary shadow-[0_0_24px_rgba(52,254,160,0.12)]"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => {
              setTab("signin");
              setError(null);
              setSignupSuccess(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signup"}
            className={`flex-1 rounded-2xl py-3 font-headline text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
              tab === "signup"
                ? "bg-secondary/20 text-secondary shadow-[0_0_24px_rgba(185,132,255,0.15)]"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => {
              setTab("signup");
              setError(null);
              setSignupSuccess(null);
            }}
          >
            Create account
          </button>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-5 px-6 pb-8 pt-6 sm:px-8"
        >
          <div className="space-y-2">
            <label
              htmlFor="auth-email"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="auth-password"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={
                tab === "signin" ? "current-password" : "new-password"
              }
              required
              minLength={tab === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {tab === "signup" ? (
              <p className="text-xs text-on-surface-variant/80">
                At least 8 characters.
              </p>
            ) : null}
          </div>

          {signupSuccess ? (
            <p className="rounded-xl border border-primary/35 bg-primary/10 px-3 py-2 text-sm text-primary transition-opacity duration-200">
              {signupSuccess}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error transition-opacity duration-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-xl py-3.5 font-headline font-bold shadow-lg transition-all duration-200 hover:brightness-110 disabled:opacity-50 ${
              tab === "signin"
                ? "bg-primary text-on-primary-fixed shadow-[0_0_20px_rgba(52,254,160,0.2)]"
                : "bg-secondary text-on-secondary-fixed shadow-[0_0_24px_rgba(185,132,255,0.25)]"
            }`}
          >
            {submitting
              ? tab === "signin"
                ? "Signing in…"
                : "Creating…"
              : tab === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="space-y-3 border-t border-white/10 px-6 pb-6 pt-2 sm:px-8">
          <p className="text-center text-xs uppercase tracking-widest text-on-surface-variant">
            Or continue with
          </p>
          <OAuthButtons />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-on-surface-variant transition-colors duration-200">
        <Link
          href="/"
          className="font-bold text-primary hover:text-primary/90 hover:underline"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
