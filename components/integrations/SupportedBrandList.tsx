"use client";

import { useState } from "react";

import { publicAssetUrl } from "@/lib/asset-url";

export type SupportedBrandItem = {
  name: string;
  slug: string;
  blurb: string;
};

function BrandRow({
  item,
  basePath,
}: {
  item: SupportedBrandItem;
  basePath: string;
}) {
  const [showImage, setShowImage] = useState(true);
  const src = publicAssetUrl(`${basePath}/${item.slug}.png`);

  return (
    <li className="glass-card flex items-center gap-5 rounded-2xl border border-white/10 p-5 sm:gap-6 sm:p-7">
      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low shadow-inner sm:h-32 sm:w-32">
        {showImage ? (
          <img
            src={src}
            alt=""
            width={160}
            height={160}
            className="h-full w-full object-contain p-3 sm:p-3.5"
            onError={() => setShowImage(false)}
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 sm:text-[3.25rem]">
            bolt
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <h2 className="font-headline text-lg font-bold text-on-surface sm:text-xl">
          {item.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {item.blurb}
        </p>
      </div>
    </li>
  );
}

export function SupportedBrandList({
  items,
  basePath,
}: {
  items: readonly SupportedBrandItem[];
  basePath: string;
}) {
  return (
    <ul className="space-y-4 sm:space-y-5">
      {items.map((item) => (
        <BrandRow key={item.slug} item={item} basePath={basePath} />
      ))}
    </ul>
  );
}
