"use client";

import type { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { extractChargerIdFromQrPayload } from "@/lib/charger/qrPayload";
import { hasSupabasePublicConfig } from "@/lib/env/public";
import { updateChargingSessionIntentStage } from "@/lib/supabase/client";

type HostQrScanModalProps = {
  open: boolean;
  expectedChargerId: string;
  intentId: string | null;
  onClose: () => void;
  /** Called after QR matches + intent advances to qr_verified. */
  onVerified: () => void;
};

export function HostQrScanModal({
  open,
  expectedChargerId,
  intentId,
  onClose,
  onVerified,
}: HostQrScanModalProps) {
  const reactId = useId();
  const readerDomId = `host-qr-reader-${reactId.replace(/:/g, "")}`;
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef);

  const html5Ref = useRef<Html5Qrcode | null>(null);
  const stoppingRef = useRef(false);
  const verifiedRef = useRef(false);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;

  const [hint, setHint] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [lastDecoded, setLastDecoded] = useState<string | null>(null);

  const stopScanner = useCallback(async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    try {
      await html5Ref.current?.stop();
      html5Ref.current?.clear();
    } catch {
      /* noop */
    }
    html5Ref.current = null;
    stoppingRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      void stopScanner();
      setHint(null);
      setFatal(null);
      setLastDecoded(null);
      verifiedRef.current = false;
      return;
    }

    let disposed = false;

    const run = async () => {
      verifiedRef.current = false;
      setFatal(null);
      setHint('Starting camera… If prompted, tap "Allow" so we can verify the printed host QR.');
      try {
        const mod = await import("html5-qrcode");
        if (disposed) return;
        const Html5Qrcode = mod.Html5Qrcode;
        const Html5QrcodeSupportedFormats = mod.Html5QrcodeSupportedFormats;
        const qr = new Html5Qrcode(readerDomId, false);
        html5Ref.current = qr;

        const config = {
          fps: 12,
          aspectRatio: 1,
          rememberLastUsedCamera: true,
          disableFlip: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          qrbox: (viewW: number, viewH: number) => {
            const m = Math.min(viewW, viewH);
            const side = Math.min(300, Math.max(190, Math.floor(m * 0.74)));
            return { width: side, height: side };
          },
        };

        const onScanSuccess = async (decodedText: string) => {
            if (verifiedRef.current) return;
            setLastDecoded(decodedText);
            const extracted = extractChargerIdFromQrPayload(decodedText);
            const expectLower = expectedChargerId.toLowerCase();
            if (!extracted || extracted !== expectLower) {
              setHint("Wrong QR — scan the printed sticker for this charger.");
              return;
            }
            verifiedRef.current = true;
            setHint("QR verified. Opening payment step…");
            await stopScanner();
            try {
              if (intentId && hasSupabasePublicConfig()) {
                await updateChargingSessionIntentStage(intentId, "qr_verified");
              }
              setHint(null);
              onVerifiedRef.current();
            } catch (e: unknown) {
              verifiedRef.current = false;
              setFatal(e instanceof Error ? e.message : "Could not verify session.");
            }
          };

        try {
          await qr.start(
            { facingMode: { ideal: "environment" } },
            config,
            onScanSuccess,
            () => {},
          );
        } catch {
          const cameras = await Html5Qrcode.getCameras();
          const backCam = cameras.find((c: { label: string }) =>
            /back|rear|environment/i.test(c.label),
          );
          await qr.start(
            backCam?.id ?? cameras[0]?.id,
            config,
            onScanSuccess,
            () => {},
          );
        }

        setHint(null);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Could not access the camera.";
        setFatal(
          `${msg} On desktop, connect a webcam or complete this step on your phone.`,
        );
      }
    };

    void run();

    return () => {
      disposed = true;
      void stopScanner();
    };
  }, [open, readerDomId, expectedChargerId, intentId, stopScanner]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-6">
      <div className="max-h-[100dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-2xl border border-white/10 bg-[#050506] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_0_80px_rgba(52,254,160,0.12)] sm:max-h-[min(92dvh,calc(100vh-2rem))] sm:rounded-2xl sm:px-0 sm:pb-0 sm:pt-0">
        <div ref={panelRef} className="flex flex-col gap-4 p-6 sm:p-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Physical verification
              </p>
              <h2 className="mt-1 font-headline text-xl font-bold text-on-surface">
                Scan host QR
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Align the printed M2M QR from this host. We match it to this listing before escrow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void stopScanner();
                onClose();
              }}
              className="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </header>

          <div
            id={readerDomId}
            className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-xl border border-primary/25 bg-black"
          />

          {hint ? (
            <p className="text-center text-xs leading-relaxed text-amber-200/95" role="status">
              {hint}
            </p>
          ) : null}
          {lastDecoded && !fatal ? (
            <p className="text-center text-[11px] leading-relaxed text-on-surface-variant">
              Scanner detected QR. Verifying charger match…
            </p>
          ) : null}
          {fatal ? (
            <p className="text-center text-sm text-error" role="alert">
              {fatal}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void stopScanner();
              onClose();
            }}
            className="w-full rounded-xl border border-white/10 py-2.5 font-headline text-sm font-semibold text-on-surface-variant transition-colors hover:bg-white/[0.06]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
