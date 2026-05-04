"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { toSafeToastError } from "@/lib/client-facing-error";
import {
  buildContactMethod,
  isLikelyFullName,
  parseContactMethod,
} from "@/lib/profile-contact";
import {
  updateAuthUserProfile,
  updateUserRoleForAuth,
  updateUserRoleForWallet,
  updateWalletUserProfile,
} from "@/lib/supabase/client";
import type { UserProfileRow, UserRole } from "@/lib/types/database";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "driver", label: "Driver" },
  { value: "host", label: "Host" },
  { value: "both", label: "Driver & host" },
];

type ProfileEditFormProps = {
  profile: UserProfileRow;
  onSaved: () => void;
};

export function ProfileEditForm({ profile, onSaved }: ProfileEditFormProps) {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const parsedContact = parseContactMethod(profile.contact_method);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [vehicleModel, setVehicleModel] = useState(profile.vehicle_model ?? "");
  const [username, setUsername] = useState(parsedContact.username);
  const [phoneNumber, setPhoneNumber] = useState(parsedContact.phone);
  const [role, setRole] = useState<UserRole>(profile.role);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const isDriver = role === "driver" || role === "both";
  const isHost = role === "host" || role === "both";

  const resetFormToProfile = () => {
    setDisplayName(profile.display_name ?? "");
    setVehicleModel(profile.vehicle_model ?? "");
    const parsed = parseContactMethod(profile.contact_method);
    setUsername(parsed.username);
    setPhoneNumber(parsed.phone);
    setRole(profile.role);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const vehiclePayload = isDriver ? vehicleModel.trim() || null : null;
      if (!displayName.trim() || !isLikelyFullName(displayName)) {
        throw new Error("Please enter your name and surname.");
      }
      if (!username.trim()) {
        throw new Error("Username is required.");
      }
      if (!phoneNumber.trim()) {
        throw new Error("Phone number is required.");
      }
      const contactMethod = buildContactMethod({
        username: username.trim(),
        phone: phoneNumber.trim(),
      });

      if (user) {
        await updateAuthUserProfile({
          display_name: displayName.trim() || null,
          vehicle_model: vehiclePayload,
          contact_method: contactMethod || null,
        });
        if (role !== profile.role) {
          await updateUserRoleForAuth(role);
        }
      } else if (publicKey) {
        await updateWalletUserProfile(publicKey.toBase58(), {
          display_name: displayName.trim() || null,
          vehicle_model: vehiclePayload,
          contact_method: contactMethod || null,
        });
        if (role !== profile.role) {
          await updateUserRoleForWallet(publicKey.toBase58(), role);
        }
      } else {
        throw new Error("Sign in or connect a wallet to save.");
      }
      setSaved(true);
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(
        toSafeToastError(
          err,
          "Could not save profile changes. Refresh once or email info@m2m.energy.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-5 border-t border-white/10 pt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">
          Profile information
        </h3>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setSaved(false);
              setError(null);
              setEditing(true);
            }}
            className="rounded-xl border border-white/15 px-4 py-2 font-headline text-xs font-bold uppercase tracking-wide text-on-surface transition hover:bg-white/5"
          >
            Edit profile
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-on-surface-variant" htmlFor="pe-role">
          Role on M2M
        </label>
        <select
          id="pe-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={!editing}
          className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-on-surface-variant">
          {role === "driver" && "Find chargers, start sessions, and track your EV."}
          {role === "host" && "List chargers and coordinate with drivers at your node."}
          {role === "both" && "Use driver tools and host listing flows with one account."}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-on-surface-variant" htmlFor="pe-name">
          Full name
        </label>
        <input
          id="pe-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={!editing}
          placeholder={
            isHost && !isDriver
              ? "e.g. Alex Johnson"
              : "e.g. Alex Johnson"
          }
          className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="text-[11px] text-on-surface-variant">
          {isHost
            ? "Shown on listings and in session handoffs."
            : "Use first and last name so hosts/drivers can identify you."}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
        {isDriver ? (
          <>
          <p className="font-headline text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            Driver
          </p>
          <div className="space-y-2">
            <label
              className="text-xs font-bold text-on-surface-variant"
              htmlFor="pe-vehicle"
            >
              Vehicle
            </label>
            <input
              id="pe-vehicle"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              disabled={!editing}
              placeholder="e.g. Tesla Model 3"
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-[11px] text-on-surface-variant">
              Helps hosts recognize your session and plan plug type.
            </p>
          </div>
          </>
        ) : null}

          <div className="space-y-2">
            <label
              className="text-xs font-bold text-on-surface-variant"
              htmlFor="pe-username"
            >
              Username
            </label>
            <input
              id="pe-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!editing}
              placeholder="@alex"
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-bold text-on-surface-variant"
              htmlFor="pe-phone"
            >
              Phone number
            </label>
            <input
              id="pe-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!editing}
              placeholder="+1 555 123 4567"
              className="w-full rounded-xl border border-white/10 bg-surface-container-low/50 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-[11px] text-on-surface-variant">
              {isHost && isDriver
                ? "Shared for both driver and host coordination."
                : "Used by drivers/hosts to coordinate live sessions."}
            </p>
          </div>
      </div>

      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : saved ? (
        <p className="text-sm text-primary" role="status">
          Saved.
        </p>
      ) : null}
      {editing ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary-fixed transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetFormToProfile();
              setEditing(false);
              setSaved(false);
              setError(null);
            }}
            className="rounded-xl border border-white/15 px-6 py-3 font-headline text-sm font-bold text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </form>
  );
}
