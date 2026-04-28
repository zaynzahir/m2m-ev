import { PublicKey } from "@solana/web3.js";

// Devnet USDC mint used by Jupiter quotes for test environments.
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export const DEFAULT_M2M_DECIMALS = 9;

export function getM2MTokenMint(): PublicKey {
  const raw =
    process.env.NEXT_PUBLIC_M2M_TOKEN_MINT?.trim() ||
    process.env.M2M_TOKEN_MINT?.trim();
  if (!raw) {
    throw new Error(
      "Missing NEXT_PUBLIC_M2M_TOKEN_MINT (or M2M_TOKEN_MINT). Add your $M2M mint address.",
    );
  }
  return new PublicKey(raw);
}

export function getM2MTokenDecimals(): number {
  const raw = process.env.NEXT_PUBLIC_M2M_TOKEN_DECIMALS?.trim();
  if (!raw) return DEFAULT_M2M_DECIMALS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 18) return DEFAULT_M2M_DECIMALS;
  return Math.floor(n);
}

export function toTokenBaseUnits(amountUi: number, decimals: number): bigint {
  if (!Number.isFinite(amountUi) || amountUi <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
  const scale = 10 ** decimals;
  const scaled = Math.round(amountUi * scale);
  if (!Number.isFinite(scaled) || scaled <= 0) {
    throw new Error("Invalid token amount.");
  }
  return BigInt(scaled);
}
