"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

import {
  getPublicM2MMint,
  getTokenMarketLinks,
  M2M_TOKEN_TICKER,
  shortenMint,
} from "@/lib/constants/token";

function CopyContractButton({ mint }: { mint: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [mint]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
    >
      <span className="material-symbols-outlined text-base">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copied" : "Copy CA"}
    </button>
  );
}

type TokenContractCardProps = {
  /** Compact = label + CA only; full adds short blurb + market chips */
  variant?: "compact" | "full";
  className?: string;
};

export function TokenContractCard({
  variant = "compact",
  className = "",
}: TokenContractCardProps) {
  const mint = getPublicM2MMint();
  const links = getTokenMarketLinks(mint).filter((l) =>
    ["dexscreener", "jupiter", "solscan", "pumpfun"].includes(l.id),
  );

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 break-all font-mono text-sm text-on-surface sm:text-[0.9375rem]">
          <span className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Contract address:
          </span>{" "}
          {mint ? (
            <code className="text-primary">
              <span className="sm:hidden">{shortenMint(mint, 8, 8)}</span>
              <span className="hidden sm:inline">{mint}</span>
            </code>
          ) : null}
        </p>
        {mint ? <CopyContractButton mint={mint} /> : null}
      </div>

      {variant === "full" ? (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            ${M2M_TOKEN_TICKER} is the Solana token for M2M Network—software-only,
            API-driven DePIN middleware. Track charts on Dexscreener, trade via
            Jupiter, and verify the mint on Solscan. Official site:{" "}
            <Link href="/#token" className="font-semibold text-primary hover:underline">
              m2m.energy/#token
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            {links.map((link) =>
              link.href ? (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:border-primary/35 hover:text-primary"
                >
                  {link.label}
                  <span className="material-symbols-outlined text-sm opacity-70">
                    open_in_new
                  </span>
                </a>
              ) : null,
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
