import Link from "next/link";

import { WalletFirstProfileGate } from "@/components/auth/WalletFirstProfileGate";
import { Footer } from "@/components/Footer";
import { MapSection } from "@/components/MapSection";
import { Navbar } from "@/components/Navbar";
import { RegisterDriverForm } from "@/components/driver/RegisterDriverForm";

export default function ChargePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 pb-24 pt-28 sm:px-8">
        <h1 className="mb-2 font-headline text-3xl font-extrabold text-on-surface">
          Find a charger
        </h1>
        <p className="mb-2 max-w-2xl text-sm text-on-surface-variant">
          Explore listings on the map (same experience as home). Paid sessions route
          through Solana escrow when you advance the flow from a listing.
        </p>
        <p className="mb-8 text-sm text-on-surface-variant">
          Same map embedded here for convenience.{" "}
          <Link href="/#map" className="font-bold text-primary hover:underline">
            Open map from home
          </Link>
          . Driver registration below uses a wallet to attach your profile before you
          complete the form. Support{" "}
          <a
            href="mailto:info@m2m.energy"
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
          >
            info@m2m.energy
          </a>
          .
        </p>

        <div className="mb-12">
          <MapSection id="charge-map" />
        </div>

        <div className="border-t border-white/10 pt-10">
          <h2 className="mb-2 font-headline text-xl font-bold text-on-surface">
            Driver registration
          </h2>
          <p className="mb-6 max-w-2xl text-sm text-on-surface-variant">
            Connect your Solana wallet, then save vehicle and contact details so hosts see
            a consistent driver record. OEM API telemetry attaches later as integrations
            go live on our roadmap.
          </p>
          <WalletFirstProfileGate redirectTo="/dashboard">
            <RegisterDriverForm />
          </WalletFirstProfileGate>
        </div>
      </main>
      <Footer />
    </>
  );
}
