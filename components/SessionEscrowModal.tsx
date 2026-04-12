"use client";

import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { getEscrowPublicKey } from "@/lib/constants/escrow";
import { hasSupabasePublicConfig } from "@/lib/env/public";
import { updateChargerStatus } from "@/lib/supabase/client";
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
  onClose: () => void;
  onSessionConfirmed?: () => void;
};

export function SessionEscrowModal({
  open,
  charger,
  onClose,
  onSessionConfirmed,
}: SessionEscrowModalProps) {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();

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

  const handleStartSession = useCallback(async () => {
    if (!charger || !publicKey) return;

    setErrorMessage(null);
    setPhase("awaiting_approval");

    const escrow = getEscrowPublicKey();
    const lamports = Math.floor(0.01 * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: escrow,
        lamports,
      }),
    );

    try {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
      });

      setPhase("confirming");

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      );

      if (hasSupabasePublicConfig()) {
        await updateChargerStatus(
          charger.id,
          "charging",
          publicKey.toBase58(),
        );
      }

      setPhase("charging");
      onSessionConfirmed?.();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Transaction failed. Try again.";
      const friendly =
        /user reject|denied|cancel/i.test(msg) ||
        msg.includes("0x1") /* some wallets */
          ? "Transaction was cancelled in the wallet."
          : msg;
      setErrorMessage(friendly);
      setPhase("error");
    }
  }, [
    charger,
    connection,
    publicKey,
    sendTransaction,
    onSessionConfirmed,
  ]);

  if (!open || !charger) return null;

  const statusLabel = (() => {
    switch (phase) {
      case "awaiting_approval":
        return "Awaiting Wallet Approval…";
      case "confirming":
        return "Confirming on Devnet…";
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
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2
              id="session-modal-title"
              className="font-headline font-bold text-xl text-on-surface"
            >
              Charging session
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {charger.title ?? charger.label ?? "M2M host"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-white/5 disabled:opacity-40"
            aria-label="Close"
            disabled={
              phase === "awaiting_approval" || phase === "confirming"
            }
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {!connected ? (
          <div className="space-y-4">
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Connect your Solana wallet on Devnet. You will approve a 0.01 SOL
              transfer to the M2M escrow address to start this session.
            </p>
            <div className="flex justify-center">
              <WalletConnectButton variant="primary" />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-on-surface-variant">
              <strong className="text-on-surface">Demo hold:</strong> this sends
              SOL to a configured devnet address, not a custodial escrow program,
              no USDC streaming, and no automated refunds. Production would use a
              verified program + oracle.
            </div>
            <p className="text-xs text-on-surface-variant text-center leading-relaxed">
              Devnet address:{" "}
              <code className="text-primary/90 break-all text-[11px]">
                {getEscrowPublicKey().toBase58()}
              </code>
            </p>

            {phase === "idle" || phase === "error" ? (
              <>
                {phase === "error" && errorMessage ? (
                  <p className="text-sm text-error text-center">{errorMessage}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleStartSession()}
                  disabled={!publicKey}
                  className="w-full py-3 bg-primary text-on-primary-fixed font-bold rounded-xl hover:shadow-[0_0_15px_rgba(52,254,160,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Start Session (0.01 SOL escrow)
                  <span className="material-symbols-outlined text-lg">
                    bolt
                  </span>
                </button>
                <p className="text-[11px] text-center text-on-surface-variant">
                  Real Devnet transfer. Phantom will ask you to approve.
                </p>
              </>
            ) : null}

            {(phase === "awaiting_approval" ||
              phase === "confirming" ||
              phase === "charging") && (
              <div className="space-y-4">
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-primary transition-[width] duration-700 ease-out shadow-[0_0_12px_rgba(52,254,160,0.45)] ${
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
                  <p className="text-xs text-center text-on-surface-variant">
                    Funds locked on chain. Charger status updated to
                    &quot;charging&quot; in Supabase.
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
