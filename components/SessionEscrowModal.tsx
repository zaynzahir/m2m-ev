"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useEscrowSwapPayment } from "@/hooks/useEscrowSwapPayment";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { toSafeToastError } from "@/lib/client-facing-error";
import { getEscrowPublicKey } from "@/lib/constants/escrow";
import { hasSupabasePublicConfig } from "@/lib/env/public";
import {
  updateChargingSessionIntentStage,
  updateChargerStatus,
} from "@/lib/supabase/client";
import type { ChargerRow } from "@/lib/types/database";

type UiPhase =
  | "idle"
  | "awaiting_approval"
  | "confirming"
  | "charging"
  | "error";

type SessionEscrowModalProps = {
  open: boolean;
  charger: ChargerRow | null;
  hostHasPayoutWallet?: boolean;
  /** When set, workflow stages sync to charging_session_intents (migration_phase18). */
  sessionIntentId?: string | null;
  onClose: () => void;
  onSessionConfirmed?: () => void;
};

export function SessionEscrowModal({
  open,
  charger,
  hostHasPayoutWallet = true,
  sessionIntentId,
  onClose,
  onSessionConfirmed,
}: SessionEscrowModalProps) {
  const { connected, publicKey } = useWallet();
  const { prepareAndSendEscrowSwap } = useEscrowSwapPayment();

  const [phase, setPhase] = useState<UiPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(open && Boolean(charger), panelRef);

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setErrorMessage(null);
    }
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      !charger ||
      !sessionIntentId?.trim() ||
      !hasSupabasePublicConfig()
    ) {
      return;
    }
    void updateChargingSessionIntentStage(sessionIntentId, "awaiting_escrow").catch(
      () => {},
    );
  }, [open, charger, sessionIntentId]);

  const handleStartSession = useCallback(async () => {
    if (!charger || !publicKey) return;

    setErrorMessage(null);
    setPhase("awaiting_approval");

    try {
      setPhase("confirming");
      await prepareAndSendEscrowSwap({
        // TODO: bind this to dynamic quote (rate * estimated kWh).
        m2mAmountUi: 5,
        slippageBps: 100,
      });

      if (hasSupabasePublicConfig()) {
        await updateChargerStatus(charger.id, "charging", publicKey.toBase58());
      }

      setPhase("charging");
      onSessionConfirmed?.();
    } catch (e) {
      setErrorMessage(
        toSafeToastError(
          e,
          "Payment step did not complete. Retry or approve in your wallet again. Questions: info@m2m.energy",
        ),
      );
      setPhase("error");
    }
  }, [
    charger,
    publicKey,
    prepareAndSendEscrowSwap,
    onSessionConfirmed,
    sessionIntentId,
  ]);

  if (!open || !charger) return null;

  const statusLabel = (() => {
    switch (phase) {
      case "awaiting_approval":
        return "Awaiting Wallet Approval…";
      case "confirming":
        return "Confirming Swap + Escrow…";
      case "charging":
        return "Charging in Progress";
      case "error":
        return "Something went wrong";
      default:
        return null;
    }
  })();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="glass-card w-full max-w-md space-y-6 rounded-2xl border border-white/10 p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="session-modal-title"
              className="font-headline text-xl font-bold text-on-surface"
            >
              Charging session
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {charger.title ?? charger.label ?? "M2M host"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface disabled:opacity-40"
            aria-label="Close"
            disabled={phase === "awaiting_approval" || phase === "confirming"}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {!connected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center">
              <p className="font-headline text-sm font-bold text-primary">
                Connect wallet to continue payment
              </p>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                Signup/login does not require a wallet. Wallet is required only now, when payment escrow starts.
              </p>
            </div>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              You will approve a Jupiter swap from $M2M into USDC, then route that USDC into escrow to start this session.
            </p>
            <div className="flex justify-center">
              <WalletConnectButton variant="primary" />
            </div>
            <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-center text-[11px] leading-relaxed text-on-surface-variant">
              Mobile tip: approve once in Solflare/Phantom, then return to this tab.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-on-surface-variant">
              <strong className="text-on-surface">Escrow flow:</strong> Jupiter
              swaps your $M2M to USDC and sends output USDC to the escrow
              destination token account.
            </div>
            <p className="text-center text-xs leading-relaxed text-on-surface-variant">
              Escrow destination:{" "}
              <code className="break-all text-[11px] text-primary/90">
                {getEscrowPublicKey().toBase58()}
              </code>
            </p>

            {phase === "idle" || phase === "error" ? (
              <>
                {!hostHasPayoutWallet ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-3 py-2 text-center text-xs leading-relaxed text-amber-100/90">
                    Host payout wallet is missing. Ask the listing owner to connect their wallet in Profile before payment can start.
                  </div>
                ) : null}
                {phase === "error" && errorMessage ? (
                  <p className="text-center text-sm text-error">{errorMessage}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleStartSession()}
                  disabled={!publicKey || !hostHasPayoutWallet}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-on-primary-fixed transition-all hover:shadow-[0_0_15px_rgba(52,254,160,0.4)] disabled:opacity-50"
                >
                  Pay with $M2M -&gt; Escrow USDC
                  <span className="material-symbols-outlined text-lg">bolt</span>
                </button>
                <p className="text-center text-[11px] text-on-surface-variant">
                  Wallet approval required. Swap may fail due to slippage or low
                  liquidity.
                </p>
              </>
            ) : null}

            {(phase === "awaiting_approval" ||
              phase === "confirming" ||
              phase === "charging") && (
              <div className="space-y-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-primary shadow-[0_0_12px_rgba(52,254,160,0.45)] transition-[width] duration-700 ease-out ${
                      phase === "charging" ? "animate-pulse" : ""
                    }`}
                    style={{
                      width:
                        phase === "awaiting_approval"
                          ? "33%"
                          : phase === "confirming"
                            ? "66%"
                            : "100%",
                    }}
                  />
                </div>
                <p
                  className="min-h-[1.5rem] text-center font-headline font-bold text-primary"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {statusLabel}
                </p>
                {phase === "charging" ? (
                  <p className="text-center text-xs text-on-surface-variant">
                    Escrow payment confirmed and session is marked as charging.
                    This is the current MVP flow; full automated telemetry/reconciliation
                    will be added in the next phase.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
