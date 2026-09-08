/**
 * $M2M Solana token public config for the landing page.
 * Launch flow: set NEXT_PUBLIC_M2M_TOKEN_MINT in Vercel → redeploy → CA + pump.fun chart appear.
 */

export const M2M_TOKEN_TICKER = "M2M";
export const M2M_TOKEN_NAME = "M2M Network";

/** Must stay a direct NEXT_PUBLIC_* read so Next can inline it for the client. */
const M2M_TOKEN_MINT = process.env.NEXT_PUBLIC_M2M_TOKEN_MINT;
const M2M_PUMPFUN_URL = process.env.NEXT_PUBLIC_M2M_PUMPFUN_URL;
const M2M_DEXSCREENER_PAIR = process.env.NEXT_PUBLIC_M2M_DEXSCREENER_PAIR;
const M2M_SHOW_DEXSCREENER_CHART =
  process.env.NEXT_PUBLIC_M2M_SHOW_DEXSCREENER_CHART;

export function getPublicM2MMint(): string | null {
  const raw = M2M_TOKEN_MINT?.trim();
  return raw && raw.length > 0 ? raw : null;
}

export function getPumpFunCoinUrl(mint: string | null): string | null {
  if (!mint) return null;
  const custom = M2M_PUMPFUN_URL?.trim();
  if (custom) return custom;
  return `https://pump.fun/coin/${mint}`;
}

/** Pair address if mint alone isn't enough for Dexscreener (optional, post-graduate). */
export function getDexscreenerPairAddress(): string | null {
  const raw = M2M_DEXSCREENER_PAIR?.trim();
  return raw && raw.length > 0 ? raw : null;
}

/** Opt-in after graduation: set NEXT_PUBLIC_M2M_SHOW_DEXSCREENER_CHART=1 */
export function shouldShowDexscreenerChart(): boolean {
  const raw = M2M_SHOW_DEXSCREENER_CHART?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function getDexscreenerEmbedUrl(mint: string | null): string | null {
  if (!shouldShowDexscreenerChart()) return null;
  const pair = getDexscreenerPairAddress();
  const id = pair || mint;
  if (!id) return null;
  const params = new URLSearchParams({
    embed: "1",
    theme: "dark",
    trades: "0",
    info: "0",
  });
  return `https://dexscreener.com/solana/${id}?${params.toString()}`;
}

export function getDexscreenerPageUrl(mint: string | null): string | null {
  const pair = getDexscreenerPairAddress();
  const id = pair || mint;
  if (!id) return null;
  return `https://dexscreener.com/solana/${id}`;
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

/** Build market / explorer links once mint is known. pump.fun first. */
export function getTokenMarketLinks(mint: string | null): TokenMarketLink[] {
  const pumpFunBase = getPumpFunCoinUrl(mint) || "https://pump.fun";

  return [
    {
      id: "pumpfun",
      label: "pump.fun",
      href: pumpFunBase,
      logoSrc: "/logo/pumpfun.png",
      alwaysShow: true,
    },
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
    text: "pump.fun",
    tone: "primary",
    logoSrc: "/logo/pumpfun.png",
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
    text: "API-driven DePIN",
    tone: "primary",
  },
  {
    text: "m2m.energy",
    tone: "primary",
    logoSrc: "/logo/m2m-token.png",
  },
];
