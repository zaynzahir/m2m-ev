"use client";

import { toDataURL } from "qrcode";
import { useEffect, useMemo, useState } from "react";

type AuthQrModalProps = {
  open: boolean;
  chargerId: string;
  nodeTitle: string;
  onClose: () => void;
};

export function AuthQrModal({
  open,
  chargerId,
  nodeTitle,
  onClose,
}: AuthQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const qrPayload = useMemo(() => {
    if (!chargerId) return "";
    if (typeof window === "undefined") {
      return `/?charger=${encodeURIComponent(chargerId)}&source=qr`;
    }
    const url = new URL("/", window.location.origin);
    url.searchParams.set("charger", chargerId);
    url.searchParams.set("source", "qr");
    return url.toString();
  }, [chargerId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !qrPayload) return;
    let disposed = false;
    void toDataURL(qrPayload, {
      margin: 3,
      width: 640,
      errorCorrectionLevel: "H",
      color: {
        // Keep QR itself high-contrast for reliable scanner decoding.
        dark: "#000000",
        light: "#ffffff",
      },
    }).then((url) => {
      if (!disposed) setQrDataUrl(url);
    });
    return () => {
      disposed = true;
    };
  }, [open, qrPayload]);

  useEffect(() => {
    if (copyState !== "copied") return;
    const t = window.setTimeout(() => setCopyState("idle"), 1400);
    return () => window.clearTimeout(t);
  }, [copyState]);

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

          <div className="mx-auto flex aspect-square max-h-[280px] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-xl border border-primary/25 bg-white p-2">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Stable charger QR for ${nodeTitle}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="material-symbols-outlined text-5xl text-primary/50">
                qr_code_2
              </span>
            )}
          </div>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-on-surface-variant/90">
            Stable charger QR (v1). Print this or keep it on-screen. Driver scan opens this listing and starts the session flow.
          </p>
          <p className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center font-mono text-[10px] text-on-surface-variant">
            {qrPayload}
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(qrPayload);
                setCopyState("copied");
              } catch {
                setCopyState("error");
              }
            }}
            className="mt-3 w-full rounded-xl border border-primary/30 bg-primary/10 py-2.5 font-headline text-xs font-bold text-primary transition-colors hover:bg-primary/15"
          >
            {copyState === "copied"
              ? "Link copied"
              : copyState === "error"
                ? "Copy failed"
                : "Copy QR link"}
          </button>

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
