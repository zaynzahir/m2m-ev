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
  logoSrc: string;
  /** White / light logos need a dark pad to stay visible */
  darkPad?: boolean;
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
      logoSrc: "/logo/images-removebg-preview.png",
      darkPad: true,
      alwaysShow: true,
    },
    {
      id: "birdeye",
      label: "Birdeye",
      href: mint
        ? `https://birdeye.so/token/${mint}?chain=solana`
        : "https://birdeye.so",
      logoSrc: "/logo/birdeye.png",
      darkPad: true,
      alwaysShow: true,
    },
    {
      id: "jupiter",
      label: "Jupiter",
      href: mint ? `https://jup.ag/swap/SOL-${mint}` : "https://jup.ag",
      logoSrc: "/logo/jupiter.png",
      alwaysShow: true,
    },
    {
      id: "raydium",
      label: "Raydium",
      href: mint
        ? `https://raydium.io/swap/?inputMint=sol&outputMint=${mint}`
        : "https://raydium.io/swap/",
      logoSrc: "/logo/raydium.png",
      alwaysShow: true,
    },
    {
      id: "solscan",
      label: "Solscan",
      href: mint ? `https://solscan.io/token/${mint}` : "https://solscan.io",
      logoSrc: "/logo/solscan.png",
      alwaysShow: true,
    },
    {
      id: "pumpfun",
      label: "pump.fun",
      href: pumpFunBase,
      logoSrc: "/logo/pumpfun.png",
      alwaysShow: true,
    },
  ];
}

export type TokenTickerItem = {
  text: string;
  tone: "primary" | "muted";
  logoSrc?: string;
  darkPad?: boolean;
};

/** Scrolling ticker items — logos + network pulse. */
export const TOKEN_TICKER_ITEMS: TokenTickerItem[] = [
  {
    text: "$M2M",
    tone: "primary",
    logoSrc: "/logo/m2m-token.png",
  },
  {
    text: "Solana",
    tone: "primary",
    logoSrc: "/logo/svg/solana.svg",
  },
  {
    text: "Dexscreener",
    tone: "muted",
    logoSrc: "/logo/images-removebg-preview.png",
    darkPad: true,
  },
  {
    text: "Jupiter",
    tone: "muted",
    logoSrc: "/logo/jupiter.png",
  },
  {
    text: "Raydium",
    tone: "muted",
    logoSrc: "/logo/raydium.png",
  },
  {
    text: "Birdeye",
    tone: "muted",
    logoSrc: "/logo/birdeye.png",
    darkPad: true,
  },
  {
    text: "Solscan",
    tone: "muted",
    logoSrc: "/logo/solscan.png",
  },
  {
    text: "pump.fun",
    tone: "muted",
    logoSrc: "/logo/pumpfun.png",
  },
  {
    text: "API-driven DePIN",
    tone: "primary",
  },
  {
    text: "m2m.energy",
    tone: "primary",
    logoSrc: "/logo/m2m-token.png",
  },
];
