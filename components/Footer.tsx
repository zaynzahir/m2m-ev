import Link from "next/link";

const GITHUB_REPO = "https://github.com/zaynzahir/m2m-ev";

export function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-[#f0edf1]/10 bg-[#0e0e11] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:items-center sm:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="font-headline text-lg font-bold tracking-tight text-[#f0edf1]">
            M2M Network
          </span>
          <p className="font-body text-xs text-[#f0edf1]/50">
            © 2026 M2M Network. Built on Solana.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-[#f0edf1]/50">
          <Link
            href="/privacy/"
            className="transition-colors hover:text-[#b984ff]"
          >
            Privacy
          </Link>
          <Link
            href="/terms/"
            className="transition-colors hover:text-[#b984ff]"
          >
            Terms
          </Link>
          <a
            className="transition-colors hover:text-[#b984ff]"
            href="https://x.com/m2m_energy?s=11"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
          <a
            className="transition-colors hover:text-[#b984ff]"
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
