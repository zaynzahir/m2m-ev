"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { hasSupabasePublicConfig } from "@/lib/env/public";
import {
  fetchChargerSessionPreview,
  insertChargingSessionIntent,
} from "@/lib/supabase/client";
import { SUPPORTED_CHARGER_BRANDS } from "@/lib/supported-brands";
import type { ChargerRow, ChargerSessionPreviewRpc } from "@/lib/types/database";

type SessionEntryMode = "map" | "qr_print";

type ChargerSessionPreviewModalProps = {
  open: boolean;
  charger: ChargerRow | null;
  sessionEntry: SessionEntryMode;
  onClose: () => void;
  /** Map flow: intent created as `opened`, driver must scan host QR next. */
  onContinueToScan: (intentId: string | null, hostHasPayoutWallet: boolean) => void;
  /** Printed / deep-link QR flow: intent created as `qr_verified`, skip scan. */
  onContinueToEscrow: (intentId: string | null, hostHasPayoutWallet: boolean) => void;
};

export function ChargerSessionPreviewModal({
  open,
  charger,
  sessionEntry,
  onClose,
  onContinueToScan,
  onContinueToEscrow,
}: ChargerSessionPreviewModalProps) {
  const { connected, publicKey } = useWallet();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open && Boolean(charger), panelRef);

  const [preview, setPreview] = useState<ChargerSessionPreviewRpc | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !charger) {
      setPreview(null);
      setError(null);
      return;
    }
    if (!hasSupabasePublicConfig()) {
      setError("Supabase is not configured.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchChargerSessionPreview(charger.id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError("Listing not found.");
          setPreview(null);
          return;
        }
        setPreview(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load listing.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, charger]);

  const handleContinue = useCallback(async () => {
    if (!charger || !preview) return;
    const driverWallet = publicKey?.toBase58() ?? null;
    const hostWallet = preview.host_wallet?.trim() ?? null;
    const hostHasPayoutWallet = Boolean(hostWallet);

    setSubmitting(true);
    setError(null);
    try {
      let intentId: string | null = null;
      if (sessionEntry === "qr_print") {
        if (driverWallet && hostWallet) {
          const { id } = await insertChargingSessionIntent({
            chargerId: charger.id,
            driverWallet,
            hostWallet,
            stage: "qr_verified",
          });
          intentId = id;
        }
        onContinueToEscrow(intentId, hostHasPayoutWallet);
      } else {
        if (driverWallet && hostWallet) {
          const { id } = await insertChargingSessionIntent({
            chargerId: charger.id,
            driverWallet,
            hostWallet,
            stage: "opened",
          });
          intentId = id;
        }
        onContinueToScan(intentId, hostHasPayoutWallet);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not start session.");
    } finally {
      setSubmitting(false);
    }
  }, [
    charger,
    preview,
    publicKey,
    sessionEntry,
    onContinueToScan,
    onContinueToEscrow,
  ]);

  if (!open || !charger) return null;

  const title =
    preview?.charger_title ??
    charger.title ??
    charger.label ??
    "Charger listing";
  const plugLine = [
    preview?.plug_type ?? charger.plug_type,
    chargerBrandDisplayName(charger.charger_brand_slug),
  ]
    .filter(Boolean)
    .join(" · ");

  const busy = charger.status === "charging" ||
    charger.status === "inactive" ||
    charger.status === "offline";

  const hostHasPayoutWallet = Boolean(preview?.host_wallet?.trim());

  function shortAddr(w: string) {
    if (w.length <= 14) return w;
    return `${w.slice(0, 6)}…${w.slice(-4)}`;
  }

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6">
      <div className="max-h-[min(92dvh,calc(100vh-2rem))] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#050506] shadow-[0_0_60px_rgba(52,254,160,0.08)]">
        <div ref={panelRef} className="flex flex-col gap-4 p-6 sm:p-8">
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Session start
              </p>
              <h2 className="mt-1 font-headline text-xl font-bold text-on-surface sm:text-2xl">
                {title}
              </h2>
              {plugLine ? (
                <p className="mt-2 text-sm text-on-surface-variant">{plugLine}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface disabled:opacity-40"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </header>

          <div className="rounded-xl border border-[#34fea0]/25 bg-[#34fea0]/[0.06] px-4 py-3 text-xs leading-relaxed text-on-surface-variant">
            <strong className="font-headline text-on-surface">How billing will work:</strong>{" "}
            Real-time kWh reconciliation will connect to charger & vehicle APIs once partners
            onboard. This milestone demonstrates wallet escrow, session intent state, and host QR
            verification—not live hardware telemetry yet.
          </div>

          <dl className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Energy rate</dt>
              <dd className="font-headline font-bold tabular-nums text-primary">
                $
                {Number(
                  preview?.price_per_kwh ?? charger.price_per_kwh,
                ).toFixed(2)}{" "}
                / kWh
              </dd>
            </div>
            <div className="border-t border-white/[0.06] pt-3">
              <dt className="text-on-surface-variant">Host contact</dt>
              <dd className="mt-1 font-medium text-on-surface">
                {preview?.host_contact_method?.trim() ||
                  "Not on file yet — coordinate via in-app messaging when enabled."}
              </dd>
            </div>
            <div className="border-t border-white/[0.06] pt-3">
              <dt className="text-on-surface-variant">Host display name</dt>
              <dd className="mt-1 text-on-surface">
                {preview?.host_display_name?.trim() || "M2M host"}
              </dd>
            </div>
            {preview && !hostHasPayoutWallet ? (
              <div className="border-t border-amber-500/30 bg-amber-500/[0.08] p-3 sm:rounded-lg">
                <p className="text-xs font-headline font-bold text-amber-200/95">
                  Host payout wallet missing
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-100/90">
                  Sessions need the <strong>listing owner&apos;s</strong> on-chain address for escrow (not
                  the driver&apos;s). Sign in as the account that created this listing, open{" "}
                  <strong>Profile</strong>, and <strong>Connect wallet</strong> so your address is
                  saved there.
                </p>
              </div>
            ) : preview && hostHasPayoutWallet ? (
              <div className="border-t border-white/[0.06] pt-3">
                <dt className="text-on-surface-variant">Host payout wallet</dt>
                <dd className="mt-1 font-mono text-[11px] text-primary/90">
                  {shortAddr(preview.host_wallet as string)}
                </dd>
              </div>
            ) : null}
            {(preview?.parking_instructions ?? charger.parking_instructions ?? charger.description)
              ? (
              <div className="border-t border-white/[0.06] pt-3">
                <dt className="text-on-surface-variant">Parking / access</dt>
                <dd className="mt-1 text-on-surface-variant">
                  {preview?.parking_instructions ??
                    charger.parking_instructions ??
                    charger.description}
                </dd>
              </div>
            ) : null}
          </dl>

          {loading ? (
            <p className="text-center text-sm text-on-surface-variant">Loading listing…</p>
          ) : null}
          {error ? (
            <p className="text-center text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}

          {!connected ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center">
                <p className="font-headline text-sm font-bold text-primary">
                  Connect wallet to continue payment
                </p>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                  Account signup stays separate. Wallet is only required when you start paid charging sessions.
                </p>
              </div>
              <div className="flex justify-center">
                <WalletConnectButton variant="primary" />
              </div>
              <button
                type="button"
                disabled={busy || loading || submitting || !preview}
                onClick={() => void handleContinue()}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 font-headline font-bold text-on-surface transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "Working…"
                  : sessionEntry === "qr_print"
                    ? "Continue to payment step"
                    : "Continue — scan host QR"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-center text-[13px] leading-relaxed text-on-surface-variant">
                {hostHasPayoutWallet
                  ? sessionEntry === "qr_print"
                    ? "You opened this listing from the host QR link. Your driver wallet is connected — you can continue to escrow."
                    : "Your driver wallet is connected. Next: scan the host’s printed QR at the charger."
                  : "Your driver wallet is connected, but the listing owner must link a Solana wallet on their host account before a session can start (see the notice above)."}
              </p>
              <button
                type="button"
                disabled={
                  busy ||
                  loading ||
                  submitting ||
                  !preview
                }
                onClick={() => void handleContinue()}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-headline font-bold text-on-primary-fixed transition-all hover:shadow-[0_0_18px_rgba(52,254,160,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "Working…"
                  : sessionEntry === "qr_print"
                    ? "Continue to escrow"
                    : "Continue — scan host QR"}
              </button>
              {busy ? (
                <p className="text-center text-xs text-error">
                  This listing is not available for a new session right now.
                </p>
              ) : null}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full rounded-xl border border-white/10 py-2.5 font-headline text-sm font-semibold text-on-surface-variant transition-colors hover:bg-white/[0.06] disabled:opacity-40"
          >
            Back to map
          </button>
        </div>
      </div>
    </div>
  );
}

function chargerBrandDisplayName(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const row = SUPPORTED_CHARGER_BRANDS.find((b) => b.slug === slug);
  return row?.name ?? slug;
}
