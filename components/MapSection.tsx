"use client";

import dynamic from "next/dynamic";

const ChargerMap = dynamic(
  () =>
    import("@/components/map/ChargerMap").then((mod) => mod.ChargerMap),
  {
    ssr: false,
    loading: () => (
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="h-[min(600px,calc(100dvh-11rem))] min-h-[320px] w-full animate-pulse rounded-2xl border border-white/5 bg-surface-container-low sm:h-[600px] sm:rounded-3xl" />
      </section>
    ),
  },
);

export function MapSection({ id }: { id?: string }) {
  return (
    <div id={id} className={id ? "scroll-mt-28" : undefined}>
      <ChargerMap />
    </div>
  );
}
