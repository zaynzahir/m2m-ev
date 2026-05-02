"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { toSafeToastError } from "@/lib/client-facing-error";
import { signInWithEmail } from "@/lib/supabase/client";

type SignInFormProps = {
  nextHref: string;
};

export function SignInForm({ nextHref }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.push(nextHref);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setError("Invalid email or password.");
        } else if (msg.includes("email not confirmed")) {
          setError("Please verify your email first, then sign in.");
        } else {
          setError(
            toSafeToastError(
              err,
              "Sign in failed. Try again or email info@m2m.energy.",
            ),
          );
        }
      } else {
        setError("Sign in failed. Try again or email info@m2m.energy.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md m2m-rise">
      <div className="mb-10 text-center">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.25em] text-primary">
          Welcome back
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Sign in
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Email accounts need a confirmed inbox message before first sign in (check spam
          too). Connect a Solana wallet from Profile when you start paid sessions.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-2xl">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="signin-email"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none ring-primary/0 transition focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-2">
              <label
                htmlFor="signin-password"
                className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-bold text-secondary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 pr-12 text-on-surface outline-none transition focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3.5 font-headline font-bold text-on-primary-fixed shadow-[0_0_20px_rgba(52,254,160,0.2)] transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
          <p className="text-center text-xs uppercase tracking-widest text-on-surface-variant">
            Or continue with
          </p>
          <OAuthButtons />
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          No account?{" "}
          <Link
            href={`/auth/sign-up?next=${encodeURIComponent(nextHref)}`}
            className="font-bold text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
