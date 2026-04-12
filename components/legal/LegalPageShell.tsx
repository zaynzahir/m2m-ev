import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

type LegalPageShellProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black px-4 pb-28 pt-28 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-[1.75rem] p-[1px] shadow-[0_0_80px_rgba(52,254,160,0.08),0_0_100px_rgba(185,132,255,0.06)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(52,254,160,0.85) 0%, rgba(52,254,160,0.12) 42%, rgba(185,132,255,0.85) 100%)",
            }}
          >
            <article className="rounded-[1.7rem] bg-black px-6 py-10 sm:px-10 sm:py-14">
              <p className="text-center text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary/90">
                M2M Network
              </p>
              <h1 className="mt-3 text-center font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 text-center text-sm text-on-surface-variant">
                Last updated: {lastUpdated}
              </p>
              <div className="prose prose-m2m prose-lg mt-10 max-w-none [&_h2]:scroll-mt-28 [&_h2]:font-headline [&_h2]:text-on-surface [&_strong]:text-on-surface">
                {children}
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
