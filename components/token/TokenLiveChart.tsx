"use client";

import Image from "next/image";

import {
  getDexscreenerEmbedUrl,
  getDexscreenerPageUrl,
  getPublicM2MMint,
  getPumpFunCoinUrl,
  shouldShowDexscreenerChart,
  shortenMint,
} from "@/lib/constants/token";

function looksLikeSolanaMint(mint: string): boolean {
  if (mint.startsWith("0x") || mint.startsWith("0X")) return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint);
}

/** Live chart / trade panel. Only renders when mint env is configured. */
export function TokenLiveChart() {
  const mint = getPublicM2MMint();
  const pumpUrl = getPumpFunCoinUrl(mint);
  const showDex = shouldShowDexscreenerChart();
  const dexEmbed = getDexscreenerEmbedUrl(mint);
  const dexPage = getDexscreenerPageUrl(mint);

  if (!mint || !pumpUrl || !looksLikeSolanaMint(mint)) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          Live chart · pump.fun
        </p>
        <a
          href={pumpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary/15"
        >
          <Image
            src="/logo/pumpfun.png"
            alt=""
            width={18}
            height={18}
            className="rounded-sm object-contain"
          />
          Open on pump.fun
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>

      {showDex && dexEmbed ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_40px_rgba(0,0,0,0.35)]">
          <iframe
            title="$M2M Dexscreener live chart"
            src={dexEmbed}
            className="h-[420px] w-full border-0 sm:h-[520px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="clipboard-write; encrypted-media"
          />
        </div>
      ) : (
        <a
          href={pumpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black via-[#0c1210] to-black shadow-[0_0_40px_rgba(0,0,0,0.35)] transition hover:border-primary/35"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,254,160,0.12),transparent_55%)]" />
          <div className="relative flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center sm:min-h-[360px]">
            <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-black ring-1 ring-white/15">
              <Image
                src="/logo/pumpfun.png"
                alt="pump.fun"
                width={56}
                height={56}
                className="object-contain p-1"
              />
            </span>
            <p className="font-headline text-xl font-extrabold text-on-surface sm:text-2xl">
              Live chart &amp; trade on pump.fun
            </p>
            <code className="max-w-full break-all rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[11px] text-primary sm:text-xs">
              {shortenMint(mint, 10, 10)}
            </code>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary-fixed shadow-[0_0_25px_rgba(52,254,160,0.3)] transition group-hover:brightness-110">
              View live chart
              <span className="material-symbols-outlined text-lg">open_in_new</span>
            </span>
          </div>
        </a>
      )}

      {showDex && dexPage ? (
        <a
          href={dexPage}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Open Dexscreener
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      ) : null}
    </div>
  );
}
