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
        <p className="mb-2 text-sm text-on-surface-variant max-w-2xl">
          Browse live listings on the map (same as the home page), then register
          as a driver so hosts can recognize you.
        </p>
        <p className="mb-8 text-sm text-on-surface-variant">
          The map below mirrors the home page.{" "}
          <Link href="/#map" className="font-bold text-primary hover:underline">
            Open map on home
          </Link>
        </p>

        <div className="mb-12">
          <MapSection id="charge-map" />
        </div>

        <div className="border-t border-white/10 pt-10">
          <h2 className="mb-2 font-headline text-xl font-bold text-on-surface">
            Driver registration
          </h2>
          <p className="mb-6 text-sm text-on-surface-variant max-w-2xl">
            Save your vehicle and contact info to your profile (wallet required).
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
