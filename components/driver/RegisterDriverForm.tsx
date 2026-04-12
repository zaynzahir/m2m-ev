"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { getPublicEnv } from "@/lib/env/public";
import { upsertDriverProfile } from "@/lib/supabase/client";
import { VEHICLE_BRAND_MODELS } from "@/lib/vehicle-catalog";

export function RegisterDriverForm() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const _ = useMemo(() => getPublicEnv(), []);

  const [alias, setAlias] = useState("");
  const [vehicleBrandSlug, setVehicleBrandSlug] = useState("");
  const [vehicleModelName, setVehicleModelName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (t: "success" | "error", message: string) => {
    setToast({ type: t, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const selectedBrand = VEHICLE_BRAND_MODELS.find(
    (b) => b.slug === vehicleBrandSlug,
  );

  const canSubmit =
    connected &&
    Boolean(publicKey) &&
    alias.trim().length > 0 &&
    Boolean(vehicleBrandSlug) &&
    Boolean(vehicleModelName) &&
    contactMethod.trim().length > 0;

  const onSubmit = async () => {
    if (!connected || !publicKey) {
      showToast("error", "Connect your Solana wallet to register.");
      return;
    }
    if (!canSubmit) {
      showToast("error", "Please complete all fields.");
      return;
    }

    try {
      setSubmitting(true);
      const brandLabel = selectedBrand?.name ?? vehicleBrandSlug;
      await upsertDriverProfile({
        walletAddress: publicKey.toBase58(),
        displayName: alias.trim(),
        vehicleModel: `${brandLabel} ${vehicleModelName}`,
        contactMethod: contactMethod.trim(),
      });

      showToast("success", "Driver profile saved! Redirecting to the map...");
      router.push("/");
    } catch (e) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to save driver profile.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full min-h-[3rem] rounded-xl bg-surface-container-low/40 border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="w-full pb-8">
      <div className="glass-card border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-10">
        <div className="mb-6 md:mb-8">
          <p className="text-primary font-headline font-bold text-xs uppercase tracking-widest">
            Driver onboarding
          </p>
          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl tracking-tight mt-2">
            Register Your Driver Profile
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mt-3 max-w-2xl">
            Connect your wallet so you can start charging sessions with verified
            hosts.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:gap-10 items-start">
          <div className="space-y-5 min-w-0">
            <div className="space-y-2">
              <label
                htmlFor="driver-alias"
                className="text-sm uppercase tracking-wide text-[#f0edf1]/70 font-headline font-bold block"
              >
                First Name / Alias
              </label>
              <input
                id="driver-alias"
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className={inputClass}
                placeholder="e.g., Zayn"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface-container-low/25 p-4 sm:p-5 space-y-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-[#f0edf1]/70 font-headline font-bold">
                  Your vehicle
                </p>
                <p className="text-xs text-on-surface-variant/80 mt-1">
                  Pick brand, then model (EVs we support only).
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 min-w-0">
                  <label
                    htmlFor="driver-vehicle-brand"
                    className="text-xs font-headline font-semibold uppercase tracking-wide text-on-surface-variant"
                  >
                    Brand
                  </label>
                  <select
                    id="driver-vehicle-brand"
                    value={vehicleBrandSlug}
                    onChange={(e) => {
                      setVehicleBrandSlug(e.target.value);
                      setVehicleModelName("");
                    }}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Choose brand…</option>
                    {VEHICLE_BRAND_MODELS.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 min-w-0">
                  <label
                    htmlFor="driver-vehicle-model"
                    className="text-xs font-headline font-semibold uppercase tracking-wide text-on-surface-variant"
                  >
                    Model
                  </label>
                  <select
                    id="driver-vehicle-model"
                    value={vehicleModelName}
                    onChange={(e) => setVehicleModelName(e.target.value)}
                    disabled={!selectedBrand}
                    className={`${inputClass} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {!selectedBrand
                        ? "Choose brand first…"
                        : "Choose model…"}
                    </option>
                    {selectedBrand?.models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="driver-contact"
                className="text-sm uppercase tracking-wide text-[#f0edf1]/70 font-headline font-bold block"
              >
                Private contact
              </label>
              <input
                id="driver-contact"
                type="text"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className={inputClass}
                placeholder="Phone or Telegram @handle"
              />
              <p className="text-xs text-on-surface-variant/70">
                Only shared with host during an active session.
              </p>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || !canSubmit}
              className="w-full min-h-[3.25rem] py-3.5 bg-primary text-on-primary-fixed font-bold rounded-xl hover:shadow-[0_0_15px_rgba(52,254,160,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Profile"}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>

          <aside className="lg:sticky lg:top-28 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-surface-container-low/20 p-5 sm:p-6 h-full">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Wallet first onboarding for drivers. Your profile is stored in
                Supabase and used to personalize session flow.
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-on-surface-variant/70 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">
                  verified
                </span>
                <span>RLS policies allow MVP inserts/updates for this demo.</span>
              </div>
            </div>
          </aside>
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
                  ? "material-symbols-outlined text-primary text-2xl"
                  : "material-symbols-outlined text-error text-2xl"
              }
            >
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <div>
              <p
                className={
                  toast.type === "success"
                    ? "font-headline font-bold text-primary"
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

