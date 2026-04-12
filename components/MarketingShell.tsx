import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
