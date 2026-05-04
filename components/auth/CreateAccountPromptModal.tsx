"use client";

import Link from "next/link";

type CreateAccountPromptModalProps = {
  open: boolean;
  onClose: () => void;
  nextPath: string;
};

export function CreateAccountPromptModal({
  open,
  onClose,
  nextPath,
}: CreateAccountPromptModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#050506] p-6 shadow-2xl sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Account required
            </p>
            <h2 className="mt-2 font-headline text-2xl font-extrabold text-on-surface">
              Please create an account
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              You need an account to continue. Create one now or sign in if you already have one.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-white/10"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid gap-3">
          <Link
            href={`/auth/sign-up?next=${encodeURIComponent(nextPath)}`}
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-3 text-center font-bold text-on-primary-fixed"
          >
            Create account
          </Link>
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(nextPath)}`}
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-3 text-center font-bold text-on-surface"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
