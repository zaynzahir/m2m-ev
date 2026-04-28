import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import {
  DEVNET_USDC_MINT,
  getM2MTokenDecimals,
  getM2MTokenMint,
  toTokenBaseUnits,
} from "@/lib/payments/token-config";

export const runtime = "nodejs";

type PrepareEscrowBody = {
  userPublicKey?: string;
  m2mAmountUi?: number;
  slippageBps?: number;
};

type JupiterQuoteResponse = {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: unknown[];
};

type JupiterSwapResponse = {
  swapTransaction: string;
  lastValidBlockHeight?: number;
  prioritizationFeeLamports?: number;
};

function parseBody(raw: PrepareEscrowBody) {
  const userPublicKey = raw.userPublicKey?.trim();
  if (!userPublicKey) throw new Error("Missing userPublicKey.");

  const m2mAmountUi = Number(raw.m2mAmountUi);
  if (!Number.isFinite(m2mAmountUi) || m2mAmountUi <= 0) {
    throw new Error("m2mAmountUi must be greater than zero.");
  }

  const slippageBps = Number(raw.slippageBps ?? 100);
  if (!Number.isFinite(slippageBps) || slippageBps < 10 || slippageBps > 3000) {
    throw new Error("slippageBps must be between 10 and 3000.");
  }

  return { userPublicKey, m2mAmountUi, slippageBps };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstream ${res.status}: ${text || "request failed"}`);
  }

  return (await res.json()) as T;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PrepareEscrowBody;
    const { userPublicKey, m2mAmountUi, slippageBps } = parseBody(body);

    const escrowPublicKeyRaw = process.env.NEXT_PUBLIC_ESCROW_PUBLIC_KEY?.trim();
    if (!escrowPublicKeyRaw) {
      return NextResponse.json(
        {
          error:
            "Escrow destination missing: set NEXT_PUBLIC_ESCROW_PUBLIC_KEY in environment.",
        },
        { status: 500 },
      );
    }

    const m2mMint = getM2MTokenMint();
    const usdcMint = new PublicKey(DEVNET_USDC_MINT);
    const escrowOwner = new PublicKey(escrowPublicKeyRaw);
    const destinationTokenAccount = getAssociatedTokenAddressSync(
      usdcMint,
      escrowOwner,
      true,
    );

    const amountBaseUnits = toTokenBaseUnits(m2mAmountUi, getM2MTokenDecimals());

    const quote = await fetchJson<JupiterQuoteResponse>(
      "https://quote-api.jup.ag/v6/quote" +
        `?inputMint=${m2mMint.toBase58()}` +
        `&outputMint=${usdcMint.toBase58()}` +
        `&amount=${amountBaseUnits.toString()}` +
        `&slippageBps=${slippageBps}`,
    );

    const swap = await fetchJson<JupiterSwapResponse>(
      "https://quote-api.jup.ag/v6/swap",
      {
        method: "POST",
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey,
          destinationTokenAccount: destinationTokenAccount.toBase58(),
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
          wrapAndUnwrapSol: true,
        }),
      },
    );

    return NextResponse.json({
      swapTransaction: swap.swapTransaction,
      quote: {
        inAmount: quote.inAmount,
        outAmount: quote.outAmount,
        otherAmountThreshold: quote.otherAmountThreshold,
        slippageBps: quote.slippageBps,
        priceImpactPct: quote.priceImpactPct,
      },
      escrow: {
        owner: escrowOwner.toBase58(),
        destinationUsdcAta: destinationTokenAccount.toBase58(),
        usdcMint: usdcMint.toBase58(),
      },
      jupiter: {
        lastValidBlockHeight: swap.lastValidBlockHeight ?? null,
        prioritizationFeeLamports: swap.prioritizationFeeLamports ?? null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to prepare escrow swap.";
    const low = msg.toLowerCase();
    const isSlippage = low.includes("slippage") || low.includes("route") || low.includes("liquidity");

    return NextResponse.json(
      {
        error: msg,
        code: isSlippage ? "JUPITER_SWAP_UNAVAILABLE" : "PREPARE_ESCROW_FAILED",
      },
      { status: isSlippage ? 400 : 500 },
    );
  }
}
