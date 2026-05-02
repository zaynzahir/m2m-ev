/** Slugs map to `public/supported-vehicles/{slug}.png` */

export const SUPPORTED_VEHICLE_BRANDS = [
  {
    name: "Tesla",
    slug: "tesla",
    blurb:
      "Roadmap OEM API focus for telemetry where Tesla programs allow access in your region. Physical AC and DC charging still follows normal plug standards on the driver side.",
  },
  {
    name: "Rivian",
    slug: "rivian",
    blurb:
      "R1T and R1S aligned with Rivian connected services integrations as OEM APIs mature. Participation depends on availability of partner APIs where you charge.",
  },
  {
    name: "Ford",
    slug: "ford",
    blurb:
      "Mustang Mach E, F 150 Lightning, and E Transit class vehicles are compatibility targets through Ford developer resources as we widen API partnerships.",
  },
  {
    name: "General Motors",
    slug: "gm",
    blurb:
      "Chevrolet, GMC, Cadillac, and Buick EVs on GM connected services are phased integration priorities market by market, not identical coverage everywhere on day one.",
  },
  {
    name: "Hyundai",
    slug: "hyundai",
    blurb:
      "IONIQ 5, IONIQ 6, Kona Electric, and related EVs tracked for OEM cloud access where Hyundai exposes partner interfaces in your geography.",
  },
  {
    name: "Kia",
    slug: "kia",
    blurb:
      "EV6, EV9, Niro EV, and the wider Kia electric range sit on our vehicle API rollout list beside shared platform cousins from Hyundai Motor Group.",
  },
  {
    name: "BMW",
    slug: "bmw",
    blurb:
      "i4, i5, i7, iX families are integration targets via BMW Connected API style programs depending on approvals and fleet policies per country.",
  },
  {
    name: "Mercedes Benz",
    slug: "mercedes-benz",
    blurb:
      "EQS, EQE, EQA, EQB, and EQ SUVs are roadmap alignments toward Mercedes me style connected data exchanges when contracts permit.",
  },
  {
    name: "Volkswagen",
    slug: "volkswagen",
    blurb:
      "ID family vehicles in regions with VW developer or fleet programs are prioritized for orderly API onboarding rather than a single global toggle.",
  },
  {
    name: "Volvo",
    slug: "volvo",
    blurb:
      "EX line and Recharge models align with Volvo Cars connected app ecosystems for future telemetry taps while today’s MVP flow relies on QR and escrow.",
  },
  {
    name: "Polestar",
    slug: "polestar",
    blurb:
      "Polestar 2 onward tracked with Google embedded systems and Volvo group adjacency so cloud APIs land with consistent governance as they open up.",
  },
  {
    name: "Nissan",
    slug: "nissan",
    blurb:
      "LEAF, ARIYA, and successive Nissan EV launches follow regional NissanConnect style availability for API side signals alongside driver reported data.",
  },
] as const;

/** Slugs map to `public/supported-chargers/{slug}.png` */

export const SUPPORTED_CHARGER_BRANDS = [
  {
    name: "ChargePoint",
    slug: "chargepoint",
    blurb:
      "Home and networked ChargePoint installs are anchors for charger cloud API style integrations under existing partner programs.",
  },
  {
    name: "Wallbox",
    slug: "wallbox",
    blurb:
      "Pulsar, Copper, and Quasar portfolio units typically ship Wallbox cloud accounts we plan to unify through official APIs instead of onsite hardware addons.",
  },
  {
    name: "Tesla",
    slug: "tesla",
    blurb:
      "Wall Connector and Tesla destination hardware counted where Tesla publishes suitable integration surfaces for telemetry or occupancy style signals.",
  },
  {
    name: "Enel X",
    slug: "enel-x",
    blurb:
      "JuiceBox and Enel X commercial lines emphasize cloud dashboards that map cleanly to phased oracle pipelines for session aware reporting.",
  },
  {
    name: "EVBox",
    slug: "evbox",
    blurb:
      "Livo, Elvi, and BusinessLine hardware pairs with Everon style cloud backends as we pursue documented REST or OCPP gateways per deployment.",
  },
  {
    name: "ABB",
    slug: "abb",
    blurb:
      "Terra AC wallboxes plus DC fleets reference ABB Ability digital layers for industrial grade uptime without custom metering firmware on site.",
  },
  {
    name: "Siemens",
    slug: "siemens",
    blurb:
      "VersiCharge family chargers align through OEM cloud maintenance channels common in enterprise energy retrofits.",
  },
  {
    name: "Schneider Electric",
    slug: "schneider-electric",
    blurb:
      "EVlink connected lines interoperate where Schneider publishes partner APIs complementary to onsite load management dashboards.",
  },
  {
    name: "Zaptec",
    slug: "zaptec",
    blurb:
      "Zaptec Go and cloud first operations align with Nordic market expectations for remotely observable session health.",
  },
  {
    name: "FLO",
    slug: "flo",
    blurb:
      "CoRe+ residential and FLO public nodes often already expose networked session records through operator consoles we can normalize over time.",
  },
  {
    name: "EO Charging",
    slug: "eo-charging",
    blurb:
      "EO Genius and Mini Pro units seen across UK EU sites make strong candidates when regional APIs certify third party reconciliation.",
  },
  {
    name: "Hypervolt",
    slug: "hypervolt",
    blurb:
      "Hypervolt cloud accounts deliver app first scheduling semantics we can ingest where vendor programs allow delegated access.",
  },
  {
    name: "myenergi",
    slug: "myenergi",
    blurb:
      "Zappi solar aware logic supports hosts who optimize around onsite generation signals once cloud exports are negotiated.",
  },
  {
    name: "Pod Point",
    slug: "pod-point",
    blurb:
      "Solo Twin workplace and homeowner installs match British density goals for networked session exports when Pod Point exposes partner telemetry.",
  },
  {
    name: "Emporia",
    slug: "emporia",
    blurb:
      "Emporia chargers plus whole home clamps provide rich context for anomaly checks when empirical energy curves become part of oracle rules.",
  },
  {
    name: "Autel",
    slug: "autel",
    blurb:
      "MaxiCharger AC fleets highlight OCPP ready hardware at friendly price tiers for hosts who prioritize standards based cloud hooks.",
  },
  {
    name: "Blink",
    slug: "blink",
    blurb:
      "Blink HQ 200 residential and networked curbside assets appear where municipal or retail fleets already consolidate usage data centrally.",
  },
] as const;
