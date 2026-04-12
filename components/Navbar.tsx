"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

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

  const linkClass = (href: string) =>
    linkActive(pathname, href)
      ? "text-primary transition-all duration-300"
      : "text-[#f0edf1]/70 hover:text-[#f0edf1] transition-all duration-300";

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface-container-highest/40 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(52,254,160,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
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
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 font-headline text-[11px] tracking-wide uppercase sm:justify-start sm:gap-x-6 sm:text-sm">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
          <ProfileMenu />
          <WalletConnectButton variant="nav" />
        </div>
      </div>
    </nav>
  );
}
