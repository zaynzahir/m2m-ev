"use client";

import { useEffect } from "react";

type AuthQrModalProps = {
  open: boolean;
  nodeTitle: string;
  onClose: () => void;
};

export function AuthQrModal({ open, nodeTitle, onClose }: AuthQrModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-qr-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div className="relative z-[101] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#050506] p-[1px] shadow-[0_0_60px_rgba(52,254,160,0.12)]">
        <div className="rounded-[15px] bg-[#050506] p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Proof of presence
              </p>
              <h2
                id="auth-qr-modal-title"
                className="mt-2 font-headline text-xl font-bold text-on-surface"
              >
                Session authentication QR
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {nodeTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="flex aspect-square max-h-[220px] w-full max-w-[220px] mx-auto items-center justify-center rounded-xl border border-dashed border-primary/35 bg-black/60">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-5xl text-primary/50">
                qr_code_2
              </span>
              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                QR payload will bind here for the active session. Driver scans with
                the M2M app to authorize energization.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-on-surface-variant/90">
            A session-bound, time-limited QR will appear here for the active node once
            the session pipeline is armed.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 font-headline text-sm font-semibold text-on-surface transition-colors hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
