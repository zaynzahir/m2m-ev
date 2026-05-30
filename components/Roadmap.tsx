export function Roadmap() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 sm:pb-24">
      <h2 className="font-headline text-4xl font-extrabold mb-16 text-center">
        Network Roadmap
      </h2>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-6 hover:translate-y-[-8px] transition-transform">
          <span className="px-4 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full tracking-widest uppercase">
            Phase 1
          </span>
          <h3 className="font-headline text-2xl font-bold">V1 Web Application &amp; Devnet Escrow Live</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Production web app, map discovery, session intent flow, QR proof of
            presence, and Solana devnet escrow—establishing the data bridge between
            listed infrastructure and on-chain settlement rails.
          </p>
          <div className="flex items-center gap-2 text-primary">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-xs font-bold">Current</span>
          </div>
        </div>
        <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-6 hover:translate-y-[-8px] transition-transform">
          <span className="px-4 py-1 bg-white/10 text-on-surface-variant text-xs font-bold rounded-full tracking-widest uppercase">
            Phase 2 · Summer 2026
          </span>
          <h3 className="font-headline text-2xl font-bold">
            Enterprise API Integrations &amp; Oracle Sandbox
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            Tesla Fleet API and OCPP charger cloud integrations, plus oracle
            middleware sandbox testing—reconciling charger energy output against
            vehicle battery intake before Anchor escrow releases USDC.
          </p>
          <div className="flex items-center gap-2 text-on-surface-variant/50">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span className="text-xs font-bold text-on-surface-variant">
              In Development
            </span>
          </div>
        </div>
        <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-6 hover:translate-y-[-8px] transition-transform">
          <span className="px-4 py-1 bg-white/10 text-on-surface-variant text-xs font-bold rounded-full tracking-widest uppercase">
            Phase 3 · Fall 2026
          </span>
          <h3 className="font-headline text-2xl font-bold">
            Colosseum, Mainnet-Beta &amp; Mobile
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            Colosseum Hackathon participation, mainnet-beta launch, and native
            mobile app rollout—scaling the middleware layer for institutional DePIN
            adoption across regions.
          </p>
          <div className="flex items-center gap-2 text-on-surface-variant/30">
            <span className="material-symbols-outlined text-sm">
              rocket_launch
            </span>
            <span className="text-xs font-bold text-on-surface-variant/50">
              Fall 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
