export function HowItWorks() {
  return (
    <section className="bg-surface-container-low/30 px-4 py-16 sm:px-8 sm:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">
            The Machine Protocol
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Software middleware that bridges physical energy infrastructure and
            Solana smart contracts—if it has an API, it can join the network.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="flex flex-col items-center text-center space-y-6 relative group">
            <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center bg-background shadow-[inset_0_0_20px_rgba(52,254,160,0.1)] group-hover:shadow-[inset_0_0_30px_rgba(52,254,160,0.2)] transition-all">
              <span className="material-symbols-outlined text-primary text-3xl">
                cloud_sync
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold">1. API Discovery</h3>
            <p className="text-on-surface-variant leading-relaxed px-4">
              Drivers and hosts connect through the map. Existing smart chargers
              (OCPP cloud) and connected vehicles (enterprise OEM APIs) register
              as software nodes—no custom hardware deployment.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-6 relative group">
            <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center bg-background shadow-[inset_0_0_20px_rgba(52,254,160,0.1)] group-hover:shadow-[inset_0_0_30px_rgba(52,254,160,0.2)] transition-all">
              <span className="material-symbols-outlined text-primary text-3xl">
                verified
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold">2. Dual-Verification Oracle</h3>
            <p className="text-on-surface-variant leading-relaxed px-4">
              Our oracle pulls real-time energy output from the charger&apos;s cloud
              API and matches it against the vehicle&apos;s battery intake API. When
              the data reconciles, settlement rules advance on chain.
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
              Once cloud telemetry matches, the Solana Anchor escrow instantly
              releases USDC with sub-second finality—transparent attribution for
              hosts and drivers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
