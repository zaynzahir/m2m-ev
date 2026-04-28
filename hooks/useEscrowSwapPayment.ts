"use client";

import { VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";

type PrepareEscrowResponse = {
  swapTransaction: string;
  quote: {
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    slippageBps: number;
    priceImpactPct: string;
  };
  escrow: {
    owner: string;
    destinationUsdcAta: string;
    usdcMint: string;
  };
  jupiter: {
    lastValidBlockHeight: number | null;
    prioritizationFeeLamports: number | null;
  };
};

function friendlyWalletError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("reject") ||
    m.includes("denied") ||
    m.includes("cancel") ||
    message.includes("0x1")
  ) {
    return "Transaction was cancelled in your wallet.";
  }
  if (m.includes("slippage") || m.includes("route") || m.includes("liquidity")) {
    return "Swap failed due to slippage or low liquidity. Try again with a smaller amount or higher slippage tolerance.";
  }
  return message;
}

export function useEscrowSwapPayment() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const prepareAndSendEscrowSwap = useCallback(
    async (input: { m2mAmountUi: number; slippageBps?: number }) => {
      if (!publicKey) {
        throw new Error("Connect your wallet first.");
      }

      const res = await fetch("/api/payments/prepare-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPublicKey: publicKey.toBase58(),
          m2mAmountUi: input.m2mAmountUi,
          slippageBps: input.slippageBps ?? 100,
        }),
      });

      const json = (await res.json()) as
        | PrepareEscrowResponse
        | { error?: string; code?: string };

      if (!res.ok || !("swapTransaction" in json)) {
        const msg = ("error" in json && json.error) || "Failed to prepare escrow swap.";
        throw new Error(friendlyWalletError(msg));
      }

      try {
        const tx = VersionedTransaction.deserialize(
          Buffer.from(json.swapTransaction, "base64"),
        );

        const signature = await sendTransaction(tx, connection, {
          skipPreflight: false,
          maxRetries: 3,
        });

        await connection.confirmTransaction(signature, "confirmed");

        return {
          signature,
          quote: json.quote,
          escrow: json.escrow,
          jupiter: json.jupiter,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Swap transaction failed.";
        throw new Error(friendlyWalletError(msg));
      }
    },
    [publicKey, sendTransaction, connection],
  );

  return { prepareAndSendEscrowSwap };
}
