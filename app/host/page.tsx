import { WalletFirstProfileGate } from "@/components/auth/WalletFirstProfileGate";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RegisterChargerForm } from "@/components/host/RegisterChargerForm";

export default function HostPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 pb-24 pt-28 sm:px-8">
        <h1 className="mb-2 font-headline text-3xl font-extrabold text-on-surface">
          Host and earn
        </h1>
        <p className="mb-2 max-w-2xl text-sm text-on-surface-variant">
          List your charger, drop a precise map pin in the form, set your USD price per
          kWh. Payout readiness follows Solana wallet connection for escrow milestones.
          Charger cloud telemetry is on the roadmap beside QR authorization and escrow.
        </p>
        <p className="mb-6 max-w-2xl text-sm text-on-surface-variant">
          Hosting or integration help{" "}
          <a
            href="mailto:info@m2m.energy"
            className="font-semibold text-secondary underline decoration-secondary/40 underline-offset-2 hover:text-secondary"
          >
            info@m2m.energy
          </a>
          .
        </p>
        <WalletFirstProfileGate redirectTo="/dashboard">
          <RegisterChargerForm />
        </WalletFirstProfileGate>
      </main>
      <Footer />
    </>
  );
}
