"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";

import { ProfileMenu } from "@/components/ProfileMenu";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useAuth } from "@/components/auth/AuthProvider";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname() ?? "";
  const { connected } = useWallet();
  const { session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = useMemo(() => {
    const base: { href: string; label: string }[] = [
      { href: "/how-it-works", label: "How it Works" },
      { href: "/whitepaper", label: "Whitepaper" },
      { href: "/docs", label: "Docs" },
    ];
    if (connected || session) {
      base.push({ href: "/dashboard", label: "Dashboard" });
    }
    base.push({ href: "/support", label: "Support" });
    base.push({ href: "/supported-vehicles", label: "Vehicles" });
    base.push({ href: "/supported-chargers", label: "Chargers" });
    return base;
  }, [connected, session]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const linkClass = (href: string) =>
    linkActive(pathname, href)
      ? "text-primary transition-all duration-300"
      : "text-[#f0edf1]/70 hover:text-[#f0edf1] transition-all duration-300";

  const mobileLinkClass = (href: string) =>
    linkActive(pathname, href)
      ? "bg-primary/12 text-primary"
      : "text-[#f0edf1] hover:bg-white/[0.06]";

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-surface-container-highest/40 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(52,254,160,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 pb-3 sm:px-8 sm:pb-4">
          <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-8">
            <Link
              href="/"
              className={`shrink-0 text-2xl font-bold tracking-tighter font-headline ${
                pathname === "/"
                  ? "text-primary"
                  : "text-[#f0edf1] hover:text-[#f0edf1]/90"
              }`}
            >
              M2M
            </Link>
            <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 font-headline text-sm tracking-wide lg:flex">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className={linkClass(href)}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              className="-mr-0.5 flex h-10 w-10 items-center justify-center rounded-xl text-[#f0edf1] transition hover:bg-white/10 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="material-symbols-outlined text-[26px] leading-none">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
            <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
              <ProfileMenu />
              <WalletConnectButton variant="nav" />
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0c] pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight font-headline text-[#f0edf1]"
              onClick={() => setMobileOpen(false)}
            >
              M2M
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#f0edf1] transition hover:bg-white/10"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[26px] leading-none">
                close
              </span>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-xl px-4 py-3.5 font-headline text-sm font-bold uppercase tracking-[0.12em] transition ${mobileLinkClass(href)}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/10 bg-black/40 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="mb-3 text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">
              Account
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ProfileMenu />
              <WalletConnectButton variant="nav" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
