"use client";

import {
  getDexscreenerEmbedUrl,
  getDexscreenerPageUrl,
  getPublicM2MMint,
} from "@/lib/constants/token";

export function TokenLiveChart() {
  const mint = getPublicM2MMint();
  const embedUrl = getDexscreenerEmbedUrl(mint);
  const pageUrl = getDexscreenerPageUrl(mint);

  if (!embedUrl || !pageUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-black/25 px-5 py-10 text-center">
        <p className="font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          Live chart
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant/90">
          Chart unlocks the moment the contract is set. After pump.fun Create,
          paste the mint into Vercel as{" "}
          <code className="text-primary">NEXT_PUBLIC_M2M_TOKEN_MINT</code> and
          redeploy — Dexscreener embeds here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          Live chart · Dexscreener
        </p>
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Open full chart
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
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
      <p className="text-[11px] leading-relaxed text-on-surface-variant/75">
        If the frame is empty for a minute after launch, Dexscreener is still
        indexing the pair — use Open full chart, or set{" "}
        <code className="text-primary/90">NEXT_PUBLIC_M2M_DEXSCREENER_PAIR</code>{" "}
        to the exact pair address from the Dexscreener URL.
      </p>
    </div>
  );
}
