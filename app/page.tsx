import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MapSection } from "@/components/MapSection";
import { RoleCards } from "@/components/RoleCards";
import { HowItWorks } from "@/components/HowItWorks";
import { Roadmap } from "@/components/Roadmap";
import { SupportAndVehicles } from "@/components/home/SupportAndVehicles";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="space-y-16 pt-24 sm:space-y-24">
        <Hero />
        <MapSection id="map" />
        <RoleCards />
        <HowItWorks />
        <Roadmap />
        <SupportAndVehicles />
      </main>
      <Footer />
    </>
  );
}
