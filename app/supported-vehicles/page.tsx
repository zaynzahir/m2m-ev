import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SupportedBrandList } from "@/components/integrations/SupportedBrandList";
import { SUPPORTED_VEHICLE_BRANDS } from "@/lib/supported-brands";

const VEHICLE_ITEMS = SUPPORTED_VEHICLE_BRANDS.map((b) => ({
  name: b.name,
  slug: b.slug,
  blurb: b.blurb,
}));

export default function SupportedVehiclesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-24 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <header className="mb-10 text-center sm:mb-14">
            <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
              Integrations
            </p>
            <h1 className="text-balance font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              Supported vehicles
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-left text-[15px] leading-relaxed text-on-surface-variant sm:text-center sm:text-base">
              Brands below are directional targets for OEM API connectivity. Availability
              depends on manufacturer programs and your region. Today&apos;s MVP flow uses the
              in app session and escrow path while telemetry integrations roll out.
              Integration questions{" "}
              <a
                href="mailto:info@m2m.energy"
                className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
              >
                info@m2m.energy
              </a>
              .
            </p>
          </header>

          <SupportedBrandList items={VEHICLE_ITEMS} basePath="/supported-vehicles" />
        </div>
      </main>
      <Footer />
    </>
  );
}
