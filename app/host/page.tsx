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
          Host & earn
        </h1>
        <p className="mb-6 text-sm text-on-surface-variant max-w-2xl">
          List your charger and set your price per kWh.
        </p>
        <WalletFirstProfileGate redirectTo="/dashboard">
          <RegisterChargerForm />
        </WalletFirstProfileGate>
      </main>
      <Footer />
    </>
  );
}
