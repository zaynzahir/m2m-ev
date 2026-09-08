"use client";

import {
  getDexscreenerEmbedUrl,
  getDexscreenerPageUrl,
  getPublicM2MMint,
  getTokenMarketLinks,
} from "@/lib/constants/token";

/**
 * Live chart only renders after NEXT_PUBLIC_M2M_TOKEN_MINT is set.
 * Pre-graduation (bonding curve): prefer pump.fun coin page.
 * Post-graduation: Dexscreener usually indexes within minutes of PumpSwap migration.
 */
export function TokenLiveChart() {
  const mint = getPublicM2MMint();
  if (!mint) return null;

  const embedUrl = getDexscreenerEmbedUrl(mint);
  const pageUrl = getDexscreenerPageUrl(mint);
  const pumpLink =
    getTokenMarketLinks(mint).find((l) => l.id === "pumpfun")?.href ??
    `https://pump.fun/coin/${mint}`;

  if (!embedUrl || !pageUrl) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          Live chart
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={pumpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Trade on pump.fun
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Dexscreener
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <iframe
          title="$M2M Dexscreener live chart"
          src={embedUrl}
          className="h-[420px] w-full border-0 sm:h-[520px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="clipboard-write; encrypted-media"
        />
      </div>
    </div>
  );
}
