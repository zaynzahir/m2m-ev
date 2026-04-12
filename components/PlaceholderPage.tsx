import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
        <p className="text-sm uppercase tracking-widest text-primary font-headline mb-4">
          M2M
        </p>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          {title}
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
          {description}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary font-bold hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
