import { PublicKey } from "@solana/web3.js";

let cached: PublicKey | null = null;

/**
 * Escrow wallet that receives the small devnet hold for demo sessions.
 * Set `NEXT_PUBLIC_ESCROW_PUBLIC_KEY` in `.env.local` (base58 devnet address).
 */
export function getEscrowPublicKey(): PublicKey {
  if (cached) return cached;
  const raw = process.env.NEXT_PUBLIC_ESCROW_PUBLIC_KEY?.trim();
  if (!raw) {
    throw new Error(
      "Missing NEXT_PUBLIC_ESCROW_PUBLIC_KEY. Add a devnet public key to .env.local",
    );
  }
  cached = new PublicKey(raw);
  return cached;
}
