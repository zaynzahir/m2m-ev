"use client";

import { useState } from "react";

import { publicAssetUrl } from "@/lib/asset-url";

type BasePath = "/supported-vehicles" | "/supported-chargers";

type BrandLogoImageProps = {
  name: string;
  slug: string;
  basePath: BasePath;
};

/**
 * Uses a plain <img> so missing files under /public do not trip the Next.js
 * Image optimizer ("isn't a valid image"). Add PNGs at
 * `public{basePath}/{slug}.png` when ready.
 */
export function BrandLogoImage({ name, slug, basePath }: BrandLogoImageProps) {
  const [failed, setFailed] = useState(false);
  const src = publicAssetUrl(`${basePath}/${slug}.png`);

  return (
    <div className="relative aspect-square w-44 shrink-0 rounded-2xl border border-white/10 bg-black/25 p-4 shadow-inner sm:w-52 sm:p-5 md:w-56 md:p-6">
      {!failed ? (
        <div
          className="absolute inset-4 flex items-start justify-center overflow-hidden sm:inset-5 md:inset-6"
          style={{ clipPath: "inset(0 0 15% 0)" }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- optional static assets; avoid optimizer 404 noise */}
          <img
            src={src}
            alt=""
            className="h-full w-full max-w-[85%] object-contain object-top opacity-95"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        </div>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-headline text-xs font-bold leading-snug text-on-surface-variant sm:text-sm">
          {name}
        </span>
      )}
    </div>
  );
}
