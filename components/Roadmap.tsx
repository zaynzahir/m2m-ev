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
          <h3 className="font-headline text-2xl font-bold">The MVP (Current)</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Web App launch, Solana Devnet Escrow Smart Contract deployed, Mapbox
            integration, and local Beta testing in Istanbul.
          </p>
          <div className="flex items-center gap-2 text-primary">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-xs font-bold">Live on Devnet</span>
          </div>
        </div>
        <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-6 hover:translate-y-[-8px] transition-transform">
          <span className="px-4 py-1 bg-white/10 text-on-surface-variant text-xs font-bold rounded-full tracking-widest uppercase">
            Phase 2
          </span>
          <h3 className="font-headline text-2xl font-bold">API &amp; Mobile</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Integration with existing Smart Charger APIs (ChargePoint, Wallbox)
            for automated oracle data. M2M iOS and Android app release.
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
            Phase 3
          </span>
          <h3 className="font-headline text-2xl font-bold">
            Hardware &amp; Scaling
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            Launch of custom M2M DePIN Smart Plugs. Global rollout and onboarding
            of autonomous robotic fleets and delivery bots.
          </p>
          <div className="flex items-center gap-2 text-on-surface-variant/30">
            <span className="material-symbols-outlined text-sm">
              rocket_launch
            </span>
            <span className="text-xs font-bold text-on-surface-variant/50">
              Coming 2025
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
