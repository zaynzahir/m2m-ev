"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useM2MProfile } from "@/hooks/useM2MProfile";
import { updateAuthUserProfile } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types/database";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "driver", label: "Driver" },
  { value: "host", label: "Host" },
  { value: "both", label: "Both" },
];

export function GoogleProfileCompletionModal() {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const { profile, loading, refetch } = useM2MProfile();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<UserRole>("driver");
  const [displayName, setDisplayName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isGoogleUser = useMemo(() => {
    const provider = (profile?.auth_provider ?? user?.app_metadata?.provider ?? "")
      .toString()
      .toLowerCase();
    return provider === "google";
  }, [profile?.auth_provider, user?.app_metadata?.provider]);

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (pathname.startsWith("/auth")) {
      setOpen(false);
      return;
    }
    if (!isGoogleUser) {
      setOpen(false);
      return;
    }

    const needsProfile =
      !profile.display_name?.trim() ||
      !profile.contact_method?.trim() ||
      !profile.onboarding_completed_at;
    setOpen(needsProfile);

    if (!displayName && profile.display_name) setDisplayName(profile.display_name);
    if (!contactMethod && profile.contact_method) setContactMethod(profile.contact_method);
    if (!vehicleModel && profile.vehicle_model) setVehicleModel(profile.vehicle_model);
    if (role === "driver" && profile.role && profile.role !== "driver") {
      setRole(profile.role);
    }
  }, [
    loading,
    user,
    profile,
    pathname,
    isGoogleUser,
    displayName,
    contactMethod,
    vehicleModel,
    role,
  ]);

  if (!open || !user || !profile) return null;

  const onSave = async () => {
    setError(null);
    if (!displayName.trim()) {
      setError("Username / display name is required.");
      return;
    }
    if (!contactMethod.trim()) {
      setError("Phone or Telegram contact is required.");
      return;
    }
    if ((role === "driver" || role === "both") && !vehicleModel.trim()) {
      setError("Vehicle model is required for driver access.");
      return;
    }

    setSaving(true);
    try {
      await updateAuthUserProfile({
        role,
        display_name: displayName.trim(),
        contact_method: contactMethod.trim(),
        vehicle_model:
          role === "driver" || role === "both" ? vehicleModel.trim() : null,
        onboarding_completed_at: new Date().toISOString(),
      });
      await refetch();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-white/10 bg-[#000000] shadow-[0_0_80px_rgba(52,254,160,0.08)]">
        <div className="max-h-[min(90vh,760px)] overflow-y-auto p-6 sm:p-8">
          <p className="text-center text-xs font-headline font-bold uppercase tracking-[0.2em] text-[#34fea0]">
            Continue with Google
          </p>
          <h2 className="mt-2 text-center font-headline text-2xl font-extrabold text-on-surface">
            Complete your profile
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            One-time setup: role and contact. Wallet can be connected later when needed for payments.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">
                Role on M2M
              </label>
              <select
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
              <label className="text-xs font-bold text-on-surface-variant">
                Username / display name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. @faisal"
              />
            </div>

            {(role === "driver" || role === "both") && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant">
                  Vehicle model
                </label>
                <input
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Tesla Model 3"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">
                Contact (phone / Telegram)
              </label>
              <input
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="+1... or @username"
              />
            </div>

          </div>

          {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-[#34fea0] py-3.5 font-headline text-sm font-bold text-black shadow-[0_0_24px_rgba(52,254,160,0.25)] transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

