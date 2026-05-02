import Link from "next/link";

const LINKS = [
  {
    href: "/support",
    title: "Support",
    description: "FAQs for hosts and drivers, wallet help, and how sessions work.",
    icon: "help",
    accent: "text-secondary",
    borderHover: "hover:border-secondary/25",
    glow: "bg-secondary/5 group-hover:bg-secondary/10",
  },
  {
    href: "/supported-vehicles",
    title: "Supported vehicles",
    description: "EV brands and models we integrate with on the M2M network.",
    icon: "directions_car",
    accent: "text-primary",
    borderHover: "hover:border-primary/25",
    glow: "bg-primary/5 group-hover:bg-primary/10",
  },
  {
    href: "/supported-chargers",
    title: "Supported chargers",
    description: "Wallbox OEMs and hardware families hosts can list with confidence.",
    icon: "ev_station",
    accent: "text-secondary",
    borderHover: "hover:border-secondary/25",
    glow: "bg-secondary/5 group-hover:bg-secondary/10",
  },
] as const;

export function SupportAndVehicles() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8">
      <div className="mb-12 text-center md:mb-14">
        <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
          Resources
        </p>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Support &amp; compatibility
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
          Get help, then see which vehicles and chargers fit the network today.
          For support, contact info@m2m.energy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface-container-low/20 p-6 transition-colors sm:p-8 ${item.borderHover}`}
          >
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl transition-colors ${item.glow}`}
            />
            <div className="relative z-10 flex flex-col gap-5">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ${item.accent}`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {item.icon}
                </span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {item.description}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-sm font-bold ${item.accent}`}
              >
                View
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
