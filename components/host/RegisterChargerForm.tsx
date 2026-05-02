"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Map, { Marker } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ChargerType } from "@/lib/supabase/client";
import { createChargerListing } from "@/lib/supabase/client";
import { toSafeToastError } from "@/lib/client-facing-error";
import { getPublicEnv, hasMapboxPublicToken } from "@/lib/env/public";
import { SUPPORTED_CHARGER_BRANDS } from "@/lib/supported-brands";

type LatLng = { lat: number; lng: number };

function GlowingPin() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-8 h-8 bg-secondary/20 rounded-full animate-ping" />
      <span
        className="material-symbols-outlined text-secondary text-3xl drop-shadow-[0_0_8px_rgba(185,132,255,0.8)]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        location_on
      </span>
    </div>
  );
}

export function RegisterChargerForm() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { mapboxToken } = getPublicEnv();
  const mapboxReady = hasMapboxPublicToken();

  const [displayName, setDisplayName] = useState("");
  const [chargerBrandSlug, setChargerBrandSlug] = useState("");
  const [chargerType, setChargerType] = useState<ChargerType>("Level 2 240V");
  const [pricePerKwh, setPricePerKwh] = useState<number>(0.15);
  const [contactMethod, setContactMethod] = useState("");
  const [parkingInstructions, setParkingInstructions] = useState("");
  const [picked, setPicked] = useState<LatLng | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (t: "success" | "error", message: string) => {
    setToast({ type: t, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const initialViewState = useMemo(
    () => ({
      longitude: picked?.lng ?? -74.006,
      latitude: picked?.lat ?? 40.7128,
      zoom: 11,
    }),
    [picked],
  );

  const canSubmit =
    connected &&
    Boolean(publicKey) &&
    Boolean(picked) &&
    displayName.trim().length > 0 &&
    Boolean(chargerBrandSlug) &&
    contactMethod.trim().length > 0 &&
    parkingInstructions.trim().length > 0 &&
    pricePerKwh > 0;

  const onSubmit = async () => {
    if (!connected || !publicKey) {
      showToast("error", "Connect your Solana wallet to register a charger.");
      return;
    }
    if (!picked) {
      showToast("error", "Click the map to drop a pin for your charger.");
      return;
    }
    if (!hasMapboxPublicToken()) {
      showToast(
        "error",
        "Location map is unavailable. Try again later or email info@m2m.energy for help.",
      );
      return;
    }
    if (displayName.trim().length === 0) {
      showToast("error", "Please enter a display name.");
      return;
    }
    if (!chargerBrandSlug) {
      showToast("error", "Please select your charger brand.");
      return;
    }
    if (contactMethod.trim().length === 0) {
      showToast("error", "Please enter a phone/telegram contact.");
      return;
    }
    if (parkingInstructions.trim().length === 0) {
      showToast("error", "Please add parking instructions.");
      return;
    }
    if (!(pricePerKwh > 0)) {
      showToast("error", "Price per kWh must be greater than 0.");
      return;
    }

    try {
      setSubmitting(true);
      await createChargerListing({
        ownerWalletAddress: publicKey.toBase58(),
        displayName: displayName.trim(),
        contactMethod: contactMethod.trim(),
        lat: picked.lat,
        lng: picked.lng,
        pricePerKwh,
        chargerType,
        parkingInstructions: parkingInstructions.trim(),
        chargerBrandSlug,
      });

      showToast("success", "Charger listed! Redirecting to the map...");
      router.push("/");
    } catch (e) {
      showToast(
        "error",
        toSafeToastError(
          e,
          "We could not save your listing. Refresh once or email info@m2m.energy if it continues.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full min-h-[3rem] rounded-xl bg-surface-container-low/40 border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary/40";

  return (
    <div className="w-full pb-8">
      <div className="glass-card border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-10">
        <div className="mb-6 md:mb-8">
          <p className="text-secondary font-headline font-bold text-xs uppercase tracking-widest">
            Host onboarding
          </p>
          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl tracking-tight mt-2">
            Register Your Charger
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-on-surface-variant sm:text-lg">
            Connect your Solana wallet, pick coordinates on the map, and publish price
            so drivers can discover you before escrow steps. Telemetry from charger clouds
            continues on our phased integration plan.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 items-stretch">
          <div className="space-y-5 min-w-0 flex flex-col">
            <div className="space-y-2">
              <label
                htmlFor="host-display-name"
                className="text-sm uppercase tracking-wide text-[#f0edf1]/70 font-headline font-bold block"
              >
                Display name
              </label>
              <input
                id="host-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
                placeholder="e.g., Maple Street driveway spot"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface-container-low/25 p-4 sm:p-5 space-y-3">
              <p className="text-sm uppercase tracking-wide text-[#f0edf1]/70 font-headline font-bold">
                Charger hardware
              </p>
              <p className="text-xs text-on-surface-variant/80">
                OEM brand and outlet type (same brands as Supported chargers).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 min-w-0">
                  <label
                    htmlFor="host-charger-brand"
                    className="text-xs font-headline font-semibold uppercase tracking-wide text-on-surface-variant"
                  >
                    Brand
                  </label>
                  <select
                    id="host-charger-brand"
                    value={chargerBrandSlug}
                    onChange={(e) => setChargerBrandSlug(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Choose brand…</option>
                    {SUPPORTED_CHARGER_BRANDS.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 min-w-0">
                  <label
                    htmlFor="host-charger-type"
                    className="text-xs font-headline font-semibold uppercase tracking-wide text-on-surface-variant"
                  >
                    Type
                  </label>
                  <select
                    id="host-charger-type"
                    value={chargerType}
                    onChange={(e) =>
                      setChargerType(e.target.value as ChargerType)
                    }
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2 240V">Level 2 240V</option>
                    <option value="Tesla Wall Connector">
                      Tesla Wall Connector
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/[0.07] p-4 sm:p-5 space-y-3">
              <div>
                <p className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
                  Your rate on the map (USD per kWh)
                </p>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                  Set what you charge per kilowatt hour. Drivers see this on your pin and
                  in the charger card before they proceed to escrow.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2 min-w-[8rem] flex-1">
                  <label
                    htmlFor="host-price"
                    className="text-xs font-headline font-semibold uppercase tracking-wide text-on-surface-variant"
                  >
                    Price per kWh
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-low/50 px-3">
                    <span className="text-on-surface-variant font-headline text-sm">
                      $
                    </span>
                    <input
                      id="host-price"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      lang="en"
                      value={Number.isFinite(pricePerKwh) ? pricePerKwh : 0}
                      onChange={(e) => setPricePerKwh(Number(e.target.value))}
                      className="min-h-[3rem] flex-1 border-0 bg-transparent py-3 text-on-surface outline-none focus:ring-0"
                    />
                    <span className="whitespace-nowrap text-xs text-on-surface-variant">
                      per kWh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 min-w-0">
              <label
                htmlFor="host-contact"
                className="text-sm uppercase tracking-wide text-[#f0edf1]/70 font-headline font-bold block"
              >
                Private contact
              </label>
              <input
                id="host-contact"
                type="text"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className={inputClass}
                placeholder="Phone or @handle"
              />
            </div>
            <p className="text-xs text-on-surface-variant/70">
              Contact stays private until escrow related steps unlock handoff signals in
              the app.
            </p>

            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <label
                htmlFor="host-parking"
                className="text-sm uppercase tracking-wide text-[#f0edf1]/70 font-headline font-bold block"
              >
                Parking instructions
              </label>
              <textarea
                id="host-parking"
                value={parkingInstructions}
                onChange={(e) => setParkingInstructions(e.target.value)}
                className={`${inputClass} min-h-[120px] flex-1 resize-y`}
                placeholder="e.g., Park in driveway, gate code ABCD..."
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || !canSubmit}
              className="w-full min-h-[3.25rem] py-3.5 bg-secondary text-on-secondary-fixed font-bold rounded-xl hover:shadow-[0_0_15px_rgba(185,132,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {submitting ? "Listing..." : "List Charger"}
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-3 min-h-0 lg:min-h-[560px]">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <p className="text-sm uppercase tracking-widest text-[#f0edf1]/70 font-headline font-bold">
                  Charger location
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant/70">
                  {mapboxReady
                    ? "Click the map to set coordinates."
                    : "Map preview unavailable in this deployment."}
                </p>
              </div>
            </div>

            <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] lg:min-h-0 rounded-2xl overflow-hidden border border-white/10 bg-surface-container-low shadow-inner">
              {mapboxReady ? (
                <>
                  <Map
                    mapLib={mapboxgl}
                    mapboxAccessToken={mapboxToken}
                    initialViewState={initialViewState}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    attributionControl={true}
                    onClick={(e) => {
                      const lngLat = (e as { lngLat?: { lat: number; lng: number } })
                        ?.lngLat;
                      if (!lngLat) return;
                      setPicked({ lat: lngLat.lat, lng: lngLat.lng });
                    }}
                  >
                    {picked ? (
                      <Marker
                        longitude={picked.lng}
                        latitude={picked.lat}
                        anchor="bottom"
                      >
                        <GlowingPin />
                      </Marker>
                    ) : null}
                  </Map>

                  {!picked ? (
                    <div className="absolute bottom-4 left-4 right-4 glass-card border border-white/10 rounded-2xl p-4 z-10">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-secondary text-2xl">
                          location_searching
                        </span>
                        <div>
                          <p className="font-headline font-bold text-sm">
                            Pick your charger location
                          </p>
                          <p className="mt-1 text-xs text-on-surface-variant">
                            Click anywhere on the map to set precise coordinates.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="material-symbols-outlined text-error/90 text-4xl">
                    map
                  </span>
                  <div className="max-w-sm space-y-2">
                    <p className="font-headline font-bold text-error">
                      Map unavailable
                    </p>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      Hosted environments must enable interactive maps before you can pin
                      a listing. Retry later or write{" "}
                      <a
                        href="mailto:info@m2m.energy"
                        className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
                      >
                        info@m2m.energy
                      </a>{" "}
                      if deployment staff should prioritize map enablement for your zone.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          className="fixed top-20 right-4 z-[120] max-w-md rounded-2xl p-4 shadow-2xl border border-white/10 glass-card"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span
              className={
                toast.type === "success"
                  ? "material-symbols-outlined text-secondary text-2xl"
                  : "material-symbols-outlined text-error text-2xl"
              }
            >
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <div>
              <p
                className={
                  toast.type === "success"
                    ? "font-headline font-bold text-secondary"
                    : "font-headline font-bold text-error"
                }
              >
                {toast.type === "success" ? "Success" : "Error"}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
