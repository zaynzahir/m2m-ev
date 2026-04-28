"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Map, { Marker } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import { useMemo, useState, type FormEvent } from "react";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import {
  createInitialChargerForCurrentAuth,
  resendSignupConfirmation,
  signUpWithEmail,
  updateAuthUserProfile,
} from "@/lib/supabase/client";
import { getPublicEnv, hasMapboxPublicToken } from "@/lib/env/public";
import type { UserRole } from "@/lib/types/database";

type SignUpFormProps = {
  nextHref: string;
};

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

export function SignUpForm({ nextHref }: SignUpFormProps) {
  const router = useRouter();
  const { mapboxToken } = getPublicEnv();
  const mapboxReady = hasMapboxPublicToken();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [role, setRole] = useState<UserRole>("driver");
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needEmailConfirm, setNeedEmailConfirm] = useState(false);
  const [resending, setResending] = useState(false);

  const passwordError = useMemo(() => validateStrongPassword(password), [password]);

  const saveSignup = async () => {
    const { needsEmailConfirmation } = await signUpWithEmail(email.trim(), password, {
      role,
      displayName,
      vehicleModel,
      contactMethod,
    });
    if (needsEmailConfirmation) {
      setNeedEmailConfirm(true);
      return;
    }
    await updateAuthUserProfile({
      role,
      display_name: displayName.trim(),
      vehicle_model:
        role === "driver" || role === "both" ? vehicleModel.trim() : null,
      contact_method: contactMethod.trim(),
      onboarding_completed_at: new Date().toISOString(),
    });
      if (role === "host" || role === "both") {
        await createInitialChargerForCurrentAuth({
          title: chargerTitle.trim(),
          plugType: chargerPlugType,
          pricePerKwh: Number(chargerPricePerKwh),
          lat: pickedLocation?.lat,
          lng: pickedLocation?.lng,
        });
      }
    router.push(nextHref);
    router.refresh();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

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

    if ((role === "host" || role === "both") && !chargerTitle.trim()) {
      setError("Charger title is required for host onboarding.");
      return;
    }
    if (role === "host" || role === "both") {
      const price = Number(chargerPricePerKwh);
      if (!Number.isFinite(price) || price <= 0) {
        setError("Charger price per kWh must be greater than zero.");
        return;
      }
      if (!pickedLocation) {
        setLocationModalOpen(true);
        setLocationMode("choice");
        return;
      }
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await saveSignup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onChooseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocationBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickedLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationModalOpen(false);
        setLocationBusy(false);
      },
      () => {
        setLocationBusy(false);
        setError("Could not get your location. Try again or choose on map.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (needEmailConfirm) {
    return (
      <div className="mx-auto w-full max-w-md text-center m2m-rise">
        <p className="font-headline text-lg font-bold text-[#34fea0]">
          Account created successfully
        </p>
        <p className="mt-3 text-sm text-on-surface-variant">
          Please check your email to verify your account. We sent a link to{" "}
          <strong className="text-on-surface">{email}</strong>. After confirming,
          sign in here or use the link from the email.
        </p>
        <button
          type="button"
          disabled={resending}
          onClick={() => {
            setResending(true);
            void resendSignupConfirmation(email.trim())
              .catch(() => {})
              .finally(() => setResending(false));
          }}
          className="mt-6 font-bold text-secondary hover:underline disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend confirmation email"}
        </button>
        <p className="mt-8 text-sm text-on-surface-variant">
          <Link href="/auth/sign-in" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none transition focus:ring-2 focus:ring-secondary/40";

  return (
    <div className="mx-auto w-full max-w-md m2m-rise">
      <div className="mb-10 text-center">
        <p className="font-headline text-xs font-bold uppercase tracking-[0.25em] text-secondary">
          Join M2M
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          Create account
        </h1>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-2xl">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant/80">
              Minimum 12 chars, including at least one number and one special character.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password-confirm" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="signup-password-confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={12}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant" htmlFor="signup-role">
              Role on M2M
            </label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={inputClass}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-display-name" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
              Display name
            </label>
            <input
              id="signup-display-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Alex"
            />
          </div>

          {(role === "driver" || role === "both") ? (
            <div className="space-y-2">
              <label htmlFor="signup-vehicle" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
                Vehicle model
              </label>
              <input
                id="signup-vehicle"
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className={inputClass}
                placeholder="e.g. Tesla Model 3"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="signup-contact" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
              Contact (phone / Telegram)
            </label>
            <input
              id="signup-contact"
              type="text"
              required
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              className={inputClass}
              placeholder="+1 ... or @username"
            />
          </div>

          {(role === "host" || role === "both") ? (
            <div className="space-y-3 rounded-xl border border-secondary/20 bg-secondary/[0.06] p-4">
              <p className="font-headline text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
                Host charger setup
              </p>
              <div className="space-y-2">
                <label htmlFor="signup-charger-title" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
                  Charger title
                </label>
                <input
                  id="signup-charger-title"
                  type="text"
                  required
                  value={chargerTitle}
                  onChange={(e) => setChargerTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Driveway Level 2"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="signup-charger-plug" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
                    Plug type
                  </label>
                  <select
                    id="signup-charger-plug"
                    value={chargerPlugType}
                    onChange={(e) =>
                      setChargerPlugType(
                        e.target.value as (typeof CHARGER_PLUG_OPTIONS)[number],
                      )
                    }
                    className={inputClass}
                  >
                    {CHARGER_PLUG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-charger-price" className="text-xs font-headline font-bold uppercase tracking-wide text-on-surface-variant">
                    Price per kWh (USD)
                  </label>
                  <input
                    id="signup-charger-price"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    required
                    value={chargerPricePerKwh}
                    onChange={(e) => setChargerPricePerKwh(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-secondary py-3.5 font-headline font-bold text-on-secondary-fixed shadow-[0_0_24px_rgba(185,132,255,0.25)] transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
          <p className="text-center text-xs uppercase tracking-widest text-on-surface-variant">
            Or continue with
          </p>
          <OAuthButtons />
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(nextHref)}`}
            className="font-bold text-secondary hover:underline"
          >
            Sign in
          </Link>
        </p>
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
                  Choose where your first charger will appear on the map.
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
                      onClick={(evt) => {
                        const lngLat = (evt as { lngLat?: { lat: number; lng: number } })
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
                    disabled={!pickedLocation || submitting}
                    onClick={() => {
                      if (!pickedLocation) return;
                      setLocationModalOpen(false);
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
    </div>
  );
}
