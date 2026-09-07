/**
 * $M2M Solana token public config for the landing page.
 * Set NEXT_PUBLIC_M2M_TOKEN_MINT after creating the token on pump.fun.
 */

export const M2M_TOKEN_TICKER = "M2M";
export const M2M_TOKEN_NAME = "M2M Network";

/** Must stay a direct NEXT_PUBLIC_* read so Next can inline it for the client. */
const M2M_TOKEN_MINT = process.env.NEXT_PUBLIC_M2M_TOKEN_MINT;
const M2M_PUMPFUN_URL = process.env.NEXT_PUBLIC_M2M_PUMPFUN_URL;

export function getPublicM2MMint(): string | null {
  const raw = M2M_TOKEN_MINT?.trim();
  return raw && raw.length > 0 ? raw : null;
}

export function shortenMint(mint: string, lead = 6, trail = 6): string {
  if (mint.length <= lead + trail + 3) return mint;
  return `${mint.slice(0, lead)}…${mint.slice(-trail)}`;
}

export type TokenMarketLink = {
  id: string;
  label: string;
  href: string | null;
  alwaysShow?: boolean;
};

/** Build market / explorer links once mint is known. */
export function getTokenMarketLinks(mint: string | null): TokenMarketLink[] {
  const pumpFunBase =
    M2M_PUMPFUN_URL?.trim() ||
    (mint ? `https://pump.fun/coin/${mint}` : "https://pump.fun");

  return [
    {
      id: "dexscreener",
      label: "Dexscreener",
      href: mint
        ? `https://dexscreener.com/solana/${mint}`
        : "https://dexscreener.com/solana",
      alwaysShow: true,
    },
    {
      id: "birdeye",
      label: "Birdeye",
      href: mint
        ? `https://birdeye.so/token/${mint}?chain=solana`
        : "https://birdeye.so",
      alwaysShow: true,
    },
    {
      id: "jupiter",
      label: "Jupiter",
      href: mint ? `https://jup.ag/swap/SOL-${mint}` : "https://jup.ag",
      alwaysShow: true,
    },
    {
      id: "raydium",
      label: "Raydium",
      href: mint
        ? `https://raydium.io/swap/?inputMint=sol&outputMint=${mint}`
        : "https://raydium.io/swap/",
      alwaysShow: true,
    },
    {
      id: "solscan",
      label: "Solscan",
      href: mint ? `https://solscan.io/token/${mint}` : "https://solscan.io",
      alwaysShow: true,
    },
    {
      id: "pumpfun",
      label: "pump.fun",
      href: pumpFunBase,
      alwaysShow: true,
    },
  ];
}

/** Scrolling ticker items — network pulse + ecosystem names. */
export const TOKEN_TICKER_ITEMS = [
  { text: "$M2M live on Solana", tone: "primary" as const },
  { text: "Dexscreener", tone: "muted" as const },
  { text: "Jupiter", tone: "muted" as const },
  { text: "Raydium", tone: "muted" as const },
  { text: "Birdeye", tone: "muted" as const },
  { text: "Solscan", tone: "muted" as const },
  { text: "pump.fun", tone: "muted" as const },
  { text: "API-driven DePIN middleware", tone: "primary" as const },
  { text: "Sub-second finality", tone: "muted" as const },
  { text: "m2m.energy", tone: "primary" as const },
] as const;
