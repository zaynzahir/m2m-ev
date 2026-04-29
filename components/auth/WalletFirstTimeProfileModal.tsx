"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Map, { Marker } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  createInitialChargerForCurrentAuth,
  fetchUserProfileByWallet,
  linkWalletToAuthProfile,
  signUpWithEmail,
  updateAuthUserProfile,
} from "@/lib/supabase/client";
import { getPublicEnv, hasMapboxPublicToken } from "@/lib/env/public";
import type { UserRole } from "@/lib/types/database";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "driver", label: "Driver" },
  { value: "host", label: "Host" },
  { value: "both", label: "Both" },
];

const CHARGER_PLUG_OPTIONS = [
  "Level 1",
  "Level 2 240V",
  "Tesla Wall Connector",
] as const;

function validateStrongPassword(password: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}

export function WalletFirstTimeProfileModal() {
  const { user } = useAuth();
  const { connected, publicKey } = useWallet();
  const pathname = usePathname() ?? "";
  const { mapboxToken } = getPublicEnv();
  const mapboxReady = hasMapboxPublicToken();

  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<UserRole>("driver");
  const [displayName, setDisplayName] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [chargerTitle, setChargerTitle] = useState("");
  const [chargerPlugType, setChargerPlugType] = useState<
    (typeof CHARGER_PLUG_OPTIONS)[number]
  >("Level 2 240V");
  const [chargerPricePerKwh, setChargerPricePerKwh] = useState("0.35");
  const [pickedLocation, setPickedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationMode, setLocationMode] = useState<"choice" | "map">("choice");
  const [locationBusy, setLocationBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const checkedWalletRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/auth")) {
      setOpen(false);
      return;
    }
    // Avoid double onboarding prompt for normal email-auth users.
    if (user) {
      setOpen(false);
      return;
    }
    if (!connected || !publicKey) {
      setOpen(false);
      setError(null);
      checkedWalletRef.current = null;
      return;
    }

    const walletAddress = publicKey.toBase58();
    if (checkedWalletRef.current === walletAddress) return;

    let cancelled = false;
    setChecking(true);
    void (async () => {
      try {
        const existing = await fetchUserProfileByWallet(walletAddress);
        if (!cancelled) {
          checkedWalletRef.current = walletAddress;
          setOpen(!existing);
        }
      } catch {
        if (!cancelled) {
          checkedWalletRef.current = walletAddress;
          setOpen(true);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, pathname, user]);

  const passwordError = useMemo(() => validateStrongPassword(password), [password]);

  if (!open || checking || !publicKey) return null;

  const onChooseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocationBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickedLocation(coords);
        setLocationModalOpen(false);
        setSaving(true);
        void doSave()
          .catch((e) => {
            setError(e instanceof Error ? e.message : "Could not save profile.");
          })
          .finally(() => setSaving(false));
        setLocationBusy(false);
      },
      () => {
        setLocationBusy(false);
        setError("Could not get your location. Try again or choose on map.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const doSave = async () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Password and confirm password are required.");
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { needsEmailConfirmation } = await signUpWithEmail(email.trim(), password, {
      role,
      displayName,
      vehicleModel,
      contactMethod,
      walletAddress: publicKey.toBase58(),
    });

    if (!needsEmailConfirmation) {
      await updateAuthUserProfile({
        role,
        display_name: displayName.trim(),
        vehicle_model:
          role === "driver" || role === "both" ? vehicleModel.trim() : null,
        contact_method: contactMethod.trim(),
        onboarding_completed_at: new Date().toISOString(),
      });
      await linkWalletToAuthProfile(publicKey.toBase58());
    }

    if (!needsEmailConfirmation && (role === "host" || role === "both")) {
      if (!pickedLocation) {
        setError("Please choose charger location.");
        return;
      }
      await createInitialChargerForCurrentAuth({
        title: chargerTitle.trim(),
        plugType: chargerPlugType,
        pricePerKwh: Number(chargerPricePerKwh),
        lat: pickedLocation.lat,
        lng: pickedLocation.lng,
      });
    }

    if (needsEmailConfirmation) {
      setSuccessMessage("Account created. Please verify your email, then sign in.");
    }

    setOpen(false);
  };

  const onSave = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    if (!contactMethod.trim()) {
      setError("Contact is required.");
      return;
    }
    if ((role === "driver" || role === "both") && !vehicleModel.trim()) {
      setError("Vehicle model is required for driver onboarding.");
      return;
    }

    if (role === "host" || role === "both") {
      if (!chargerTitle.trim()) {
        setError("Charger title is required.");
        return;
      }
      const price = Number(chargerPricePerKwh);
      if (!Number.isFinite(price) || price <= 0) {
        setError("Charger price per kWh must be greater than zero.");
        return;
      }
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Password and confirm password are required.");
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "host" || role === "both") {
      setLocationModalOpen(true);
      setLocationMode("choice");
      return;
    }

    setSaving(true);
    try {
      await doSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <div className="flex max-h-[min(92vh,860px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#000000] shadow-[0_0_80px_rgba(52,254,160,0.08)]">
          <div className="overflow-y-auto p-6 sm:p-8">
          <p className="text-center text-xs font-headline font-bold uppercase tracking-[0.2em] text-[#34fea0]">
            Welcome to M2M
          </p>
          <h2 className="mt-2 text-center font-headline text-2xl font-extrabold text-on-surface sm:text-3xl">
            Complete your profile
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            First-time wallet onboarding. Create your account to link this wallet.
          </p>
          <p className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-center text-[11px] leading-relaxed text-on-surface-variant">
            Mobile tip: tap connect once, approve in Solflare/Phantom, then return here.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="wf-role">
                Role on M2M
              </label>
              <select
                id="wf-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="wf-name">
                Display name
              </label>
              <input
                id="wf-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. Alex"
              />
            </div>

            {(role === "driver" || role === "both") ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant" htmlFor="wf-vehicle">
                  Vehicle model
                </label>
                <input
                  id="wf-vehicle"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Tesla Model 3"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="wf-contact">
                Contact (phone / Telegram)
              </label>
              <input
                id="wf-contact"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="+1 ... or @username"
              />
            </div>

            {(role === "host" || role === "both") ? (
              <div className="space-y-3 rounded-xl border border-secondary/20 bg-secondary/[0.06] p-4">
                <p className="font-headline text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
                  Host charger setup
                </p>
                <input
                  value={chargerTitle}
                  onChange={(e) => setChargerTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-secondary/40"
                  placeholder="Charger title (e.g. Driveway Level 2)"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={chargerPlugType}
                    onChange={(e) =>
                      setChargerPlugType(
                        e.target.value as (typeof CHARGER_PLUG_OPTIONS)[number],
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-secondary/40"
                  >
                    {CHARGER_PLUG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={chargerPricePerKwh}
                    onChange={(e) => setChargerPricePerKwh(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-secondary/40"
                    placeholder="Price per kWh (USD)"
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
                Account credentials
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-secondary/40"
                placeholder="Email"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 pr-12 text-on-surface outline-none focus:ring-2 focus:ring-secondary/40"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-on-surface-variant"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 pr-12 text-on-surface outline-none focus:ring-2 focus:ring-secondary/40"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-on-surface-variant"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Minimum 12 chars with at least 1 number and 1 special character.
              </p>
            </div>
          </div>

          {successMessage ? (
            <p className="mt-4 text-sm text-primary">{successMessage}</p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-error">{error}</p>
          ) : null}
          </div>
          <div className="border-t border-white/10 bg-[#000000] p-4 sm:p-6">
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saving || locationBusy}
              className="w-full rounded-xl bg-[#34fea0] py-3.5 font-headline text-sm font-bold text-black shadow-[0_0_24px_rgba(52,254,160,0.25)] transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>

      {locationModalOpen ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface-container-high p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Set charger location
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Choose how to place your charger on the map before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="rounded-lg p-1 text-on-surface-variant hover:bg-white/5"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {locationMode === "choice" ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onChooseMyLocation}
                  disabled={locationBusy}
                  className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 text-left transition hover:bg-primary/15 disabled:opacity-50"
                >
                  <p className="font-headline text-sm font-bold text-primary">Choose my location</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Use browser location permission.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("map")}
                  className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-4 text-left transition hover:bg-secondary/15"
                >
                  <p className="font-headline text-sm font-bold text-secondary">Choose on map</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Drop a pin manually, then Done.</p>
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="h-72 overflow-hidden rounded-xl border border-white/10 bg-black">
                  {mapboxReady ? (
                    <Map
                      mapLib={mapboxgl}
                      mapboxAccessToken={mapboxToken}
                      initialViewState={{
                        longitude: pickedLocation?.lng ?? -74.006,
                        latitude: pickedLocation?.lat ?? 40.7128,
                        zoom: pickedLocation ? 14 : 11,
                      }}
                      style={{ width: "100%", height: "100%" }}
                      mapStyle="mapbox://styles/mapbox/dark-v11"
                      onClick={(e) => {
                        const lngLat = (e as { lngLat?: { lat: number; lng: number } })
                          ?.lngLat;
                        if (!lngLat) return;
                        setPickedLocation({ lat: lngLat.lat, lng: lngLat.lng });
                      }}
                    >
                      {pickedLocation ? (
                        <Marker longitude={pickedLocation.lng} latitude={pickedLocation.lat} anchor="bottom">
                          <span className="material-symbols-outlined text-3xl text-[#34fea0]">location_on</span>
                        </Marker>
                      ) : null}
                    </Map>
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-on-surface-variant">
                      Mapbox token missing. Set NEXT_PUBLIC_MAPBOX_TOKEN to use map selection.
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationMode("choice")}
                    className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-white/5"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!pickedLocation || saving}
                    onClick={() => {
                      if (!pickedLocation) return;
                      setLocationModalOpen(false);
                      setSaving(true);
                      void doSave()
                        .catch((e) => {
                          setError(e instanceof Error ? e.message : "Could not save profile.");
                        })
                        .finally(() => setSaving(false));
                    }}
                    className="rounded-lg bg-[#34fea0] px-3 py-2 text-xs font-bold text-black disabled:opacity-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
