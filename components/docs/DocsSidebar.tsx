"use client";

import { useEffect, useMemo, useState } from "react";

const SCROLL_OFFSET_PX = 140;

function computeActiveSectionId(ids: readonly string[]): string {
  if (typeof document === "undefined" || ids.length === 0) return ids[0] ?? "";
  const fromTop = window.scrollY + SCROLL_OFFSET_PX;
  let current = ids[0];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (top <= fromTop + 1) current = id;
  }
  return current;
}

export type DocsNavItem = { id: string; label: string };

export function DocsSidebar({ items }: { items: readonly DocsNavItem[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const [activeId, setActiveId] = useState<string>(() => ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) {
          setActiveId(computeActiveSectionId(ids));
          return;
        }
        visible.sort(
          (a, b) => ids.indexOf(a.target.id) - ids.indexOf(b.target.id)
        );
        setActiveId(visible[visible.length - 1].target.id);
      },
      {
        root: null,
        rootMargin: "-46% 0px -46% 0px",
        threshold: [0, 0.05, 0.1, 0.25, 0.5, 1],
      }
    );

    elements.forEach((el) => intersectionObserver.observe(el));

    const syncFromScroll = () => {
      setActiveId(computeActiveSectionId(ids));
    };

    const syncFromHashOrScroll = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ids.includes(hash)) setActiveId(hash);
      else syncFromScroll();
    };

    syncFromHashOrScroll();
    requestAnimationFrame(syncFromHashOrScroll);

    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);
    window.addEventListener("hashchange", syncFromHashOrScroll);

    return () => {
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
      window.removeEventListener("hashchange", syncFromHashOrScroll);
    };
  }, [ids]);

  return (
    <nav
      className="glass-card sticky top-28 rounded-2xl border border-white/10 p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      aria-label="Developer documentation"
    >
      <p className="font-headline text-xs font-bold uppercase tracking-[0.18em] text-primary">
        M2M Developers
      </p>
      <ul className="mt-5 space-y-1 border-t border-white/10 pt-4">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setActiveId(item.id)}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border border-primary/35 bg-primary/10 text-primary shadow-[0_0_20px_rgba(52,254,160,0.12)]"
                    : "border border-transparent text-on-surface-variant hover:bg-white/[0.04] hover:text-on-surface"
                }`}
                aria-current={isActive ? "location" : undefined}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
