export function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-[#f0edf1]/10 bg-[#0e0e11] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:items-center sm:px-8 lg:px-12">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-bold text-[#f0edf1] font-headline tracking-tight">
            M2M Network
          </span>
          <p className="font-body text-xs text-[#f0edf1]/50">
            © 2026 M2M Network. Built on Solana.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[#f0edf1]/50 text-sm font-medium">
          <a className="hover:text-[#b984ff] transition-colors" href="#">
            Privacy
          </a>
          <a className="hover:text-[#b984ff] transition-colors" href="#">
            Terms
          </a>
          <a className="hover:text-[#b984ff] transition-colors" href="#">
            Twitter
          </a>
          <a className="hover:text-[#b984ff] transition-colors" href="#">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
