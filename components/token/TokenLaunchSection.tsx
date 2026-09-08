"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import {
  getPublicM2MMint,
  getTokenMarketLinks,
  M2M_TOKEN_NAME,
  M2M_TOKEN_TICKER,
  shortenMint,
  TOKEN_TICKER_ITEMS,
} from "@/lib/constants/token";

function PlatformLogo({
  src,
  alt,
  darkPad,
  size = 28,
}: {
  src: string;
  alt: string;
  darkPad?: boolean;
  size?: number;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${
        darkPad
          ? "bg-[#0a0a0c] ring-1 ring-white/15"
          : "bg-white/[0.06] ring-1 ring-white/10"
      }`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-contain p-1"
      />
    </span>
  );
}

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
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
    >
      <span className="material-symbols-outlined text-base">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copied" : "Copy CA"}
    </button>
  );
}

function MarketLinkChip({
  label,
  href,
  logoSrc,
  darkPad,
}: {
  label: string;
  href: string | null;
  logoSrc: string;
  darkPad?: boolean;
}) {
  const className =
    "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-on-surface transition hover:border-primary/35 hover:text-primary";

  const inner = (
    <>
      <PlatformLogo src={logoSrc} alt="" darkPad={darkPad} size={22} />
      {label}
      <span className="material-symbols-outlined text-sm opacity-70">
        open_in_new
      </span>
    </>
  );

  if (!href) {
    return <span className={`${className} cursor-not-allowed opacity-45`}>{inner}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {inner}
    </a>
  );
}

export function TokenLaunchSection() {
  const mint = getPublicM2MMint();
  const links = getTokenMarketLinks(mint);
  const hasMint = Boolean(mint);
  const marqueeItems = [...TOKEN_TICKER_ITEMS, ...TOKEN_TICKER_ITEMS];

  return (
    <section
      id="token"
      aria-labelledby="token-heading"
      className="relative overflow-hidden border-y border-white/10 bg-surface-container-low/40"
    >
      <div className="border-b border-white/5 bg-black/40 py-3">
        <div className="m2m-token-marquee flex w-max items-center gap-10 whitespace-nowrap px-4">
          {marqueeItems.map((item, i) => (
            <span
              key={`${item.text}-${i}`}
              className={`inline-flex items-center gap-2.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] ${
                item.tone === "primary"
                  ? "text-primary"
                  : "text-on-surface-variant/90"
              }`}
            >
              {item.logoSrc ? (
                <PlatformLogo
                  src={item.logoSrc}
                  alt={item.text}
                  darkPad={item.darkPad}
                  size={30}
                />
              ) : (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    item.tone === "primary"
                      ? "animate-pulse bg-primary shadow-[0_0_8px_rgba(52,254,160,0.8)]"
                      : "bg-on-surface-variant/40"
                  }`}
                />
              )}
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {hasMint ? "Token live on Solana" : "Token launch ready"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="relative inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-black ring-1 ring-white/15 sm:h-16 sm:w-16">
                <Image
                  src="/logo/m2m-token.png"
                  alt="$M2M token"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain p-1.5"
                  priority
                />
              </span>
              <h2
                id="token-heading"
                className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl"
              >
                ${M2M_TOKEN_TICKER}{" "}
                <span className="text-on-surface-variant">·</span>{" "}
                {M2M_TOKEN_NAME}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
              Official contract address, charts, and Solana market venues. Track
              ${M2M_TOKEN_TICKER} on Dexscreener, trade via Jupiter or Raydium,
              and verify the mint on Solscan.
            </p>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 break-all font-mono text-sm text-on-surface sm:text-[0.9375rem]">
                  <span className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Contract address:
                  </span>{" "}
                  {hasMint && mint ? (
                    <code className="text-primary">
                      <span className="sm:hidden">{shortenMint(mint, 8, 8)}</span>
                      <span className="hidden sm:inline">{mint}</span>
                    </code>
                  ) : null}
                </p>
                {hasMint && mint ? <CopyContractButton mint={mint} /> : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Charts &amp; markets
            </p>
            <div className="flex flex-wrap gap-2.5">
              {links.map((link) => (
                <MarketLinkChip
                  key={link.id}
                  label={link.label}
                  href={link.href}
                  logoSrc={link.logoSrc}
                  darkPad={link.darkPad}
                />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant/80">
              Always verify the mint against this page before trading. Links open
              the Solana venues listed above once the contract is published.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
