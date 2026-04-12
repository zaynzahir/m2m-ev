/**
 * Supported vehicle brands and BEV / PHEV-relevant models only (no ICE trims).
 * Slugs align with `public/supported-vehicles/{slug}.png` and
 * `SUPPORTED_VEHICLE_BRANDS` in `supported-brands.ts`.
 */
export type VehicleBrandCatalogEntry = {
  slug: string;
  name: string;
  models: readonly string[];
};

export const VEHICLE_BRAND_MODELS: readonly VehicleBrandCatalogEntry[] = [
  {
    slug: "tesla",
    name: "Tesla",
    models: [
      "Model S",
      "Model 3",
      "Model X",
      "Model Y",
      "Cybertruck",
      "Roadster (Gen 2)",
    ],
  },
  {
    slug: "rivian",
    name: "Rivian",
    models: ["R1T", "R1S", "EDV (delivery van)"],
  },
  {
    slug: "ford",
    name: "Ford",
    models: [
      "Mustang Mach-E",
      "F-150 Lightning",
      "E-Transit",
      "Explorer EV",
    ],
  },
  {
    slug: "gm",
    name: "General Motors",
    models: [
      "Chevrolet Bolt EV",
      "Chevrolet Bolt EUV",
      "Chevrolet Equinox EV",
      "Chevrolet Blazer EV",
      "Chevrolet Silverado EV",
      "GMC Sierra EV",
      "GMC Hummer EV",
      "Cadillac Lyriq",
      "Cadillac Optiq",
      "Cadillac Escalade IQ",
    ],
  },
  {
    slug: "hyundai",
    name: "Hyundai",
    models: [
      "IONIQ 5",
      "IONIQ 6",
      "IONIQ 9",
      "Kona Electric",
    ],
  },
  {
    slug: "kia",
    name: "Kia",
    models: ["EV6", "EV9", "EV3", "Niro EV"],
  },
  {
    slug: "bmw",
    name: "BMW",
    models: ["i4", "i5", "i7", "iX", "iX1", "iX2", "iX3"],
  },
  {
    slug: "mercedes-benz",
    name: "Mercedes-Benz",
    models: [
      "EQS Sedan",
      "EQS SUV",
      "EQE Sedan",
      "EQE SUV",
      "EQA",
      "EQB",
      "EQC",
    ],
  },
  {
    slug: "volkswagen",
    name: "Volkswagen",
    models: ["ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz"],
  },
  {
    slug: "volvo",
    name: "Volvo",
    models: [
      "EX30",
      "EX40",
      "EC40",
      "EX90",
      "XC40 Recharge",
      "C40 Recharge",
    ],
  },
  {
    slug: "polestar",
    name: "Polestar",
    models: ["Polestar 2", "Polestar 3", "Polestar 4"],
  },
  {
    slug: "nissan",
    name: "Nissan",
    models: ["LEAF", "ARIYA"],
  },
] as const;
