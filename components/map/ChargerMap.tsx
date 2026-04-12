"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { useAuth } from "@/components/auth/AuthProvider";
import { SessionEscrowModal } from "@/components/SessionEscrowModal";
import { accuracyCirclePolygon } from "@/lib/geo/accuracyCircle";
import { nearestCharger } from "@/lib/geo/haversine";
import {
  getPublicEnv,
  hasMapboxPublicToken,
  hasSupabasePublicConfig,
} from "@/lib/env/public";
import { SUPPORTED_CHARGER_BRANDS } from "@/lib/supported-brands";
import { fetchActiveChargers } from "@/lib/supabase/client";
import {
  isDriverRole,
  isHostRole,
  useDriverLiveTracking,
  useHostDriverLocations,
  useLocateMe,
  useMapProfile,
} from "@/hooks/useDriverMapLocation";
import type { ChargerRow } from "@/lib/types/database";

/** Default map view: New York, United States (before geolocation). */
const DEFAULT_MAP_VIEW = {
  longitude: -74.006,
  latitude: 40.7128,
  zoom: 11,
} as const;
const ACCURACY_RING_MIN_M = 75;

function chargerBrandDisplayName(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const row = SUPPORTED_CHARGER_BRANDS.find((b) => b.slug === slug);
  return row?.name ?? slug;
}

function GlowingPin({ animationDelay }: { animationDelay?: string }) {
  return (
    <div className="relative flex cursor-pointer items-center justify-center">
      <div
        className="absolute h-8 w-8 animate-ping rounded-full bg-primary/20"
        style={animationDelay ? { animationDelay } : undefined}
      />
      <span
        className="material-symbols-outlined text-3xl text-primary drop-shadow-[0_0_8px_rgba(52,254,160,0.8)]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        location_on
      </span>
    </div>
  );
}

function UserBlueDot({ pulse }: { pulse: boolean }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      {pulse ? (
        <div className="absolute inset-0 animate-ping rounded-full bg-sky-400/35" />
      ) : null}
      <div className="h-4 w-4 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.95)] ring-2 ring-white/90" />
    </div>
  );
}

function NearbyDriverDot() {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <div className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.85)] ring-2 ring-white/70" />
    </div>
  );
}

function ringRadiusM(accuracy: number | null): number | null {
  if (accuracy == null) return null;
  if (accuracy < ACCURACY_RING_MIN_M) return null;
  return Math.min(accuracy, 5000);
}

export function ChargerMap() {
  const { mapboxToken } = getPublicEnv();
  const mapboxOk = hasMapboxPublicToken();
  const hasSupabaseEnv = hasSupabasePublicConfig();
  const { session } = useAuth();
  const mapRef = useRef<MapRef>(null);

  const [chargers, setChargers] = useState<ChargerRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChargerRow | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  /** After first driver GPS sync, avoid re-flying / re-selecting on every tick. */
  const driverGpsSyncedRef = useRef(false);

  const { profile, profileLoading } = useMapProfile();

  const loadChargers = useCallback(async () => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      setLoadError("Supabase env vars are not configured.");
      return;
    }

    setLoading(true);
    try {
      const rows = await fetchActiveChargers();
      setChargers(rows);
      setLoadError(null);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Could not load chargers.",
      );
    } finally {
      setLoading(false);
    }
  }, [hasSupabaseEnv]);

  useEffect(() => {
    void loadChargers();
  }, [loadChargers]);

  useEffect(() => {
    if (chargers.length === 0 || selected !== null) return;
    const n = nearestCharger(
      DEFAULT_MAP_VIEW.latitude,
      DEFAULT_MAP_VIEW.longitude,
      chargers,
    );
    if (n) setSelected(n);
  }, [chargers, selected]);

  useEffect(() => {
    if (selected && !chargers.some((c) => c.id === selected.id)) {
      const fallback =
        nearestCharger(
          DEFAULT_MAP_VIEW.latitude,
          DEFAULT_MAP_VIEW.longitude,
          chargers,
        ) ??
        chargers[0] ??
        null;
      setSelected(fallback);
    }
  }, [chargers, selected]);

  const displayCharger = useMemo(() => {
    if (selected) return selected;
    if (chargers[0]) return chargers[0];
    return null;
  }, [selected, chargers]);

  const onMarkerClick = useCallback((c: ChargerRow) => {
    setSelected(c);
  }, []);

  const onLocateDenied = useCallback(() => {
    setToast(
      "Location access denied. You can still search for chargers manually.",
    );
  }, []);

  const { locating, locateMe, locatePreview } = useLocateMe(mapRef, onLocateDenied);

  const isDriver = isDriverRole(profile?.role);
  const syncToSupabase = Boolean(session?.user && profile?.id);
  const trackDriver =
    isDriver && !!profile?.id && !profileLoading;

  const { driverPosition, gpsResolving } = useDriverLiveTracking(
    trackDriver,
    profile?.id ?? null,
    syncToSupabase,
  );

  useEffect(() => {
    if (!locatePreview || chargers.length === 0) return;
    const n = nearestCharger(
      locatePreview.lat,
      locatePreview.lng,
      chargers,
    );
    if (n) setSelected(n);
  }, [locatePreview, chargers]);

  useEffect(() => {
    if (!trackDriver) {
      driverGpsSyncedRef.current = false;
    }
  }, [trackDriver]);

  useEffect(() => {
    if (!driverPosition || chargers.length === 0) return;
    if (driverGpsSyncedRef.current) return;
    driverGpsSyncedRef.current = true;
    const n = nearestCharger(
      driverPosition.lat,
      driverPosition.lng,
      chargers,
    );
    if (n) setSelected(n);
    const m = mapRef.current;
    if (m) {
      m.flyTo({
        center: [driverPosition.lng, driverPosition.lat],
        zoom: Math.max(12, m.getZoom?.() ?? DEFAULT_MAP_VIEW.zoom),
        duration: 1500,
      });
    }
  }, [driverPosition, chargers, trackDriver]);

  const showHostDrivers =
    isHostRole(profile?.role) && Boolean(session?.user) && !profileLoading;

  const nearbyDrivers = useHostDriverLocations(
    showHostDrivers,
    profile?.id ?? null,
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const primaryUserDot = driverPosition ?? (!isDriver ? locatePreview : null);

  const accuracyForRing = useMemo(() => {
    if (driverPosition) return ringRadiusM(driverPosition.accuracy);
    if (!isDriver && locatePreview) return ringRadiusM(locatePreview.accuracy);
    return null;
  }, [driverPosition, isDriver, locatePreview]);

  const accuracyCircle = useMemo(() => {
    if (!primaryUserDot || !accuracyForRing) return null;
    return accuracyCirclePolygon(
      primaryUserDot.lng,
      primaryUserDot.lat,
      accuracyForRing,
    );
  }, [primaryUserDot, accuracyForRing]);

  if (!mapboxOk) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="rounded-2xl border border-error/30 bg-error/10 p-6 text-on-surface">
          <p className="mb-2 font-headline font-bold text-error">
            Mapbox token missing
          </p>
          <p className="text-sm text-on-surface-variant">
            Add{" "}
            <code className="text-primary">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
            <code className="text-primary">.env.local</code> for local dev, or as a
            repository secret for GitHub Pages (see{" "}
            <code className="text-primary">deploy-github-pages.yml</code>), then
            rebuild.
          </p>
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            Create a token (Mapbox)
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8">
      <div className="group relative h-[min(600px,calc(100dvh-11rem))] min-h-[320px] w-full overflow-hidden rounded-2xl bg-surface-container-low shadow-2xl sm:h-[600px] sm:rounded-3xl">
        <Map
          ref={mapRef}
          mapLib={mapboxgl}
          mapboxAccessToken={mapboxToken}
          initialViewState={DEFAULT_MAP_VIEW}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          reuseMaps
          attributionControl
        >
          <NavigationControl position="top-right" showCompass={false} />

          {accuracyCircle ? (
            <Source id="user-accuracy" type="geojson" data={accuracyCircle}>
              <Layer
                id="user-accuracy-fill"
                type="fill"
                paint={{
                  "fill-color": "#38bdf8",
                  "fill-opacity": 0.12,
                  "fill-outline-color": "rgba(56,189,248,0.45)",
                }}
              />
            </Source>
          ) : null}

          {chargers.map((c, i) => (
            <Marker
              key={c.id}
              longitude={c.lng}
              latitude={c.lat}
              anchor="bottom"
            >
              <button
                type="button"
                className={
                  i === 0
                    ? "flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 transition-transform group-hover:scale-110"
                    : "flex cursor-pointer flex-col items-center border-0 bg-transparent p-0"
                }
                onClick={() => onMarkerClick(c)}
                aria-label={`${c.title ?? c.label ?? "Charger"}, ${Number(c.price_per_kwh).toFixed(2)} dollars per kilowatt hour`}
              >
                <GlowingPin
                  animationDelay={i === 1 ? "1s" : i === 2 ? "2s" : undefined}
                />
                <span
                  className="pointer-events-none -mt-1 max-w-[5.5rem] truncate rounded-md border border-primary/35 bg-black/90 px-1.5 py-0.5 text-center font-mono text-[10px] font-bold leading-tight text-primary shadow-[0_0_12px_rgba(52,254,160,0.2)] tabular-nums sm:text-[11px]"
                  title={`$${Number(c.price_per_kwh).toFixed(2)} / kWh`}
                >
                  ${Number(c.price_per_kwh).toFixed(2)}/kWh
                </span>
              </button>
            </Marker>
          ))}

          {nearbyDrivers.map((d) => (
            <Marker
              key={d.id}
              longitude={d.lng}
              latitude={d.lat}
              anchor="center"
            >
              <span className="sr-only">Driver nearby</span>
              <NearbyDriverDot />
            </Marker>
          ))}

          {primaryUserDot ? (
            <Marker
              longitude={primaryUserDot.lng}
              latitude={primaryUserDot.lat}
              anchor="center"
            >
              <UserBlueDot pulse={Boolean(driverPosition)} />
            </Marker>
          ) : null}
        </Map>

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-col gap-2 sm:left-4 sm:top-4 sm:max-w-sm">
          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void locateMe()}
              disabled={locating}
              className="glass-card inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-white/15 bg-surface-container-highest/90 px-3 py-2 text-xs font-bold text-on-surface shadow-lg backdrop-blur-md transition hover:bg-white/10 disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {locating ? (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                  aria-hidden
                />
              ) : (
                <span className="material-symbols-outlined text-lg text-primary">
                  my_location
                </span>
              )}
              <span className="leading-tight sm:hidden">Near me</span>
              <span className="hidden leading-tight sm:inline">
                Find chargers near me
              </span>
            </button>
            <p className="hidden text-[11px] leading-snug text-on-surface-variant/90 sm:block">
              The map opens on New York by default. Tap to center on you and
              highlight the nearest listed charger; drivers with live tracking
              also get a dot and a one-time fly-to when GPS first locks.
            </p>
          </div>
        </div>

        {(loading || loadError) && (
          <div className="absolute left-2 top-28 z-10 max-w-[min(18rem,calc(100%-1rem))] rounded-xl border border-white/10 bg-surface-container-highest/90 px-3 py-2.5 text-xs text-on-surface-variant backdrop-blur-md sm:left-4 sm:top-36 sm:max-w-xs sm:px-4 sm:py-3 sm:text-sm">
            {loading ? "Loading chargers…" : loadError}
          </div>
        )}

        {trackDriver && gpsResolving && !driverPosition ? (
          <div className="absolute right-2 top-14 z-10 flex max-w-[calc(100%-5rem)] items-center gap-2 rounded-xl border border-white/10 bg-surface-container-highest/90 px-2 py-1.5 text-[10px] text-on-surface-variant backdrop-blur-md sm:right-14 sm:top-4 sm:max-w-none sm:px-3 sm:py-2 sm:text-xs">
            <span
              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"
              aria-hidden
            />
            Resolving GPS…
          </div>
        ) : null}

        {toast ? (
          <div
            className="absolute bottom-[max(6rem,env(safe-area-inset-bottom,0px))] left-1/2 z-20 max-w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-amber-500/30 bg-amber-950/90 px-3 py-2.5 text-center text-xs text-amber-50 shadow-xl backdrop-blur-md sm:bottom-32 sm:max-w-md sm:px-4 sm:py-3 sm:text-sm md:bottom-40"
            role="status"
            aria-live="polite"
          >
            {toast}
          </div>
        ) : null}

        <div className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] left-3 right-3 z-10 rounded-2xl border border-white/10 bg-surface-container-highest/85 p-4 shadow-2xl backdrop-blur-md transition-all hover:-translate-y-1 sm:bottom-8 sm:left-8 sm:right-8 sm:p-6 md:right-auto md:w-96">
          {displayCharger ? (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-headline text-lg font-bold sm:text-xl">
                    {displayCharger.title ?? displayCharger.label ?? "M2M Charger"}
                  </h3>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      bolt
                    </span>
                    {[
                      chargerBrandDisplayName(
                        displayCharger.charger_brand_slug,
                      ),
                      displayCharger.plug_type ??
                        displayCharger.description ??
                        "EV charger",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="w-fit shrink-0 self-start whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary sm:self-auto">
                  ${Number(displayCharger.price_per_kwh).toFixed(2)} / kWh
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSessionOpen(true)}
                disabled={
                  displayCharger.status === "charging" ||
                  displayCharger.status === "inactive" ||
                  displayCharger.status === "offline"
                }
                className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-on-primary-fixed transition-all hover:shadow-[0_0_15px_rgba(52,254,160,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start Session
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </button>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">
              No active chargers yet. Run{" "}
              <code className="text-xs text-primary">supabase/schema.sql</code>{" "}
              and{" "}
              <code className="text-xs text-primary">supabase/seed.sql</code>{" "}
              in the Supabase SQL editor.
            </p>
          )}
        </div>
      </div>

      <SessionEscrowModal
        open={sessionOpen}
        charger={displayCharger}
        onClose={() => setSessionOpen(false)}
        onSessionConfirmed={() => {
          void loadChargers();
        }}
      />
    </section>
  );
}
