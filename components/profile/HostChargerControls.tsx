"use client";

import { useEffect, useState } from "react";

import { toSafeToastError } from "@/lib/client-facing-error";
import {
  deleteChargerForOwner,
  setChargerListingStatusForOwner,
  updateChargerPriceForOwner,
} from "@/lib/supabase/client";
import type { ChargerRow, ChargerStatus } from "@/lib/types/database";

const HOST_STATUSES: ChargerStatus[] = [
  "active",
  "available",
  "inactive",
  "offline",
];

type Props = {
  charger: ChargerRow;
  ownerId: string;
  onChanged: () => void;
};

export function HostChargerControls({ charger, ownerId, onChanged }: Props) {
  const [status, setStatus] = useState<ChargerStatus>(charger.status);
  const [priceInput, setPriceInput] = useState(() =>
    String(Number(charger.price_per_kwh)),
  );
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSaving, setPriceSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(charger.status);
  }, [charger.status]);

  useEffect(() => {
    setPriceInput(String(Number(charger.price_per_kwh)));
    setPriceError(null);
  }, [charger.id, charger.price_per_kwh]);

  const numericPrice = Number(priceInput);
  const priceDirty =
    Number.isFinite(numericPrice) &&
    Math.round(numericPrice * 10_000) !==
      Math.round(Number(charger.price_per_kwh) * 10_000);

  const onSavePrice = async () => {
    setPriceError(null);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setPriceError("Enter a valid price greater than zero.");
      return;
    }
    setPriceSaving(true);
    try {
      await updateChargerPriceForOwner(charger.id, ownerId, numericPrice);
      onChanged();
    } catch (e) {
      setPriceError(
        toSafeToastError(
          e,
          "Could not update price. Refresh once or email info@m2m.energy.",
        ),
      );
    } finally {
      setPriceSaving(false);
    }
  };

  const onStatusChange = async (next: ChargerStatus) => {
    setBusy(true);
    try {
      await setChargerListingStatusForOwner(charger.id, ownerId, next);
      setStatus(next);
      onChanged();
    } catch {
      setStatus(charger.status);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (
      !window.confirm(
        "Remove this charger listing from the map? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteChargerForOwner(charger.id, ownerId);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const isCharging = charger.status === "charging";

  return (
    <div className="mt-3 space-y-3">
      {isCharging ? (
        <p className="text-xs text-primary">
          Session active. Status returns to available when the charge completes
          (demo oracle).
        </p>
      ) : null}

      <div
        className={
          isCharging
            ? "rounded-xl border border-white/10 bg-surface-container-low/30 p-3"
            : "rounded-xl border border-primary/20 bg-primary/[0.04] p-3"
        }
      >
        <p
          className={
            isCharging
              ? "text-[11px] font-headline font-semibold uppercase tracking-wide text-on-surface-variant"
              : "text-[11px] font-headline font-semibold uppercase tracking-wide text-primary"
          }
        >
          Rate on map ($ / kWh)
        </p>
        {isCharging ? (
          <p className="mt-1 text-xs text-on-surface-variant">
            You can still update the price shown for future sessions. Current
            listing:{" "}
            <span className="font-mono font-bold text-primary">
              ${Number(charger.price_per_kwh).toFixed(2)}/kWh
            </span>
          </p>
        ) : (
          <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
            Drivers see this on your pin and in the map card. Save to update the
            live listing.
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`price-${charger.id}`}>
            Price per kilowatt-hour
          </label>
          <div className="flex min-w-[8rem] flex-1 items-center gap-1 rounded-lg border border-white/10 bg-surface-container-low/80 px-2">
            <span className="text-on-surface-variant text-sm">$</span>
            <input
              id={`price-${charger.id}`}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="min-h-9 flex-1 border-0 bg-transparent py-1.5 text-sm text-on-surface outline-none"
            />
            <span className="text-[10px] text-on-surface-variant">/kWh</span>
          </div>
          <button
            type="button"
            disabled={priceSaving || !priceDirty}
            onClick={() => void onSavePrice()}
            className={
              isCharging
                ? "rounded-lg bg-primary/90 px-3 py-2 font-headline text-xs font-bold text-on-primary-fixed transition hover:brightness-110 disabled:opacity-40"
                : "rounded-lg bg-primary px-3 py-2 font-headline text-xs font-bold text-on-primary-fixed shadow-[0_0_12px_rgba(52,254,160,0.2)] transition hover:brightness-110 disabled:opacity-40"
            }
          >
            {priceSaving ? "Saving…" : "Save rate"}
          </button>
        </div>
        {priceError ? (
          <p className="mt-2 text-xs text-error">{priceError}</p>
        ) : null}
      </div>

      {isCharging ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`st-${charger.id}`}>
            Listing status
          </label>
          <select
            id={`st-${charger.id}`}
            disabled={busy}
            value={status}
            onChange={(e) =>
              void onStatusChange(e.target.value as ChargerStatus)
            }
            className="rounded-lg border border-white/10 bg-surface-container-low/80 px-2 py-1.5 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          >
            {HOST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onDelete()}
            className="rounded-lg border border-error/40 px-2 py-1.5 text-xs font-bold text-error transition hover:bg-error/10 disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
