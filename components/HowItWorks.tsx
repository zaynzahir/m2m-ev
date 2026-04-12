export function HowItWorks() {
  return (
    <section className="bg-surface-container-low/30 px-4 py-16 sm:px-8 sm:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">
            The Machine Protocol
          </h2>
          <p className="text-on-surface-variant">
            Three steps to a decentralized energy future.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="flex flex-col items-center text-center space-y-6 relative group">
            <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center bg-background shadow-[inset_0_0_20px_rgba(52,254,160,0.1)] group-hover:shadow-[inset_0_0_30px_rgba(52,254,160,0.2)] transition-all">
              <span className="material-symbols-outlined text-primary text-3xl">
                handshake
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold">1. The Handshake</h3>
            <p className="text-on-surface-variant leading-relaxed px-4">
              Driver and Host agree on the rate. USDC is locked in the M2M Escrow
              Contract.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-6 relative group">
            <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center bg-background shadow-[inset_0_0_20px_rgba(52,254,160,0.1)] group-hover:shadow-[inset_0_0_30px_rgba(52,254,160,0.2)] transition-all">
              <span className="material-symbols-outlined text-primary text-3xl">
                electric_bolt
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold">2. The Charge</h3>
            <p className="text-on-surface-variant leading-relaxed px-4">
              Physical EV plugs into the Host&apos;s charger. M2M API acts as a
              dual-verification oracle.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-6 relative group">
            <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center bg-background shadow-[inset_0_0_20px_rgba(52,254,160,0.1)] group-hover:shadow-[inset_0_0_30px_rgba(52,254,160,0.2)] transition-all">
              <span className="material-symbols-outlined text-primary text-3xl">
                currency_exchange
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold">
              3. Instant Settlement
            </h3>
            <p className="text-on-surface-variant leading-relaxed px-4">
              Smart Contract releases funds instantly on Solana after
              verification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
