"use client";

import Image from "next/image";
import { useEffect, useId } from "react";

import {
  getDexscreenerEmbedUrl,
  getDexscreenerPageUrl,
  getPublicM2MMint,
  getPumpFunCoinUrl,
  shouldShowDexscreenerChart,
} from "@/lib/constants/token";

declare global {
  interface Window {
    createMyWidget?: (
      containerId: string,
      config: Record<string, unknown>,
    ) => void;
  }
}

/**
 * Live chart appears only after NEXT_PUBLIC_M2M_TOKEN_MINT is set in Vercel.
 * Primary: pump.fun coin + Moralis chart widget (works on bonding curve).
 * Later: set NEXT_PUBLIC_M2M_SHOW_DEXSCREENER_CHART=1 after graduation.
 */
export function TokenLiveChart() {
  const mint = getPublicM2MMint();
  const containerId = useId().replace(/:/g, "");
  const chartContainerId = `m2m-pump-chart-${containerId}`;

  const pumpUrl = getPumpFunCoinUrl(mint);
  const showDex = shouldShowDexscreenerChart();
  const dexEmbed = getDexscreenerEmbedUrl(mint);
  const dexPage = getDexscreenerPageUrl(mint);

  useEffect(() => {
    if (!mint || showDex) return;

    const loadWidget = () => {
      if (typeof window.createMyWidget !== "function") return;
      window.createMyWidget(chartContainerId, {
        width: "100%",
        height: "100%",
        chainId: "solana",
        tokenAddress: mint,
        defaultInterval: "15",
        timeZone:
          Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Etc/UTC",
        theme: "moralis",
        locale: "en",
        backgroundColor: "#0a0a0c",
        gridColor: "#1a1a1f",
        textColor: "#9ca3af",
        candleUpColor: "#34fea0",
        candleDownColor: "#f87171",
        hideLeftToolbar: false,
        hideTopToolbar: false,
        hideBottomToolbar: false,
      });
    };

    const existing = document.getElementById("moralis-chart-widget");
    if (existing) {
      loadWidget();
      return;
    }

    const script = document.createElement("script");
    script.id = "moralis-chart-widget";
    script.src = "https://moralis.com/static/embed/chart.js";
    script.async = true;
    script.onload = loadWidget;
    document.body.appendChild(script);

    return () => {
      // Keep script cached across navigations; only clear widget node content.
      const node = document.getElementById(chartContainerId);
      if (node) node.innerHTML = "";
    };
  }, [mint, showDex, chartContainerId]);

  if (!mint || !pumpUrl) return null;

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
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_40px_rgba(0,0,0,0.35)]">
          <div
            id={chartContainerId}
            className="h-[420px] w-full sm:h-[520px]"
            style={{ width: "100%", height: "100%", minHeight: 420 }}
          />
        </div>
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
