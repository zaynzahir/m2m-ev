"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { validateStrongPassword } from "@/lib/auth-password-policy";
import { toSafeToastError } from "@/lib/client-facing-error";
import { updatePassword } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const pwdErr = validateStrongPassword(password);
    if (pwdErr) {
      setError(pwdErr);
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
      setError(
        toSafeToastError(
          err,
          "Could not update password. Open the reset link again from email or email info@m2m.energy.",
        ),
      );
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
          Open this screen from the reset link we emailed you while that session is still
          active. Use the same strength rules as sign up (12 characters, one number,
          one special). Need help{" "}
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
              htmlFor="new-password"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 pr-20 text-on-surface outline-none transition focus:ring-2 focus:ring-secondary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-on-surface-variant hover:bg-white/10"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant"
            >
              Confirm
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={12}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 pr-20 text-on-surface outline-none transition focus:ring-2 focus:ring-secondary/40"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-on-surface-variant hover:bg-white/10"
                aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
              >
                {showConfirm ? "Hide" : "Show"}
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
