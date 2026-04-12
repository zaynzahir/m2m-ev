"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deleteChargerForOwner,
  fetchChargersByOwnerId,
  insertChargerForAuthOwner,
  type ChargerType,
  updateChargerListingFieldsForOwner,
} from "@/lib/supabase/client";
import type { ChargerRow, ChargerStatus } from "@/lib/types/database";

const PLUG_OPTIONS: ChargerType[] = [
  "Level 1",
  "Level 2 240V",
  "Tesla Wall Connector",
];

const HOST_STATUSES: ChargerStatus[] = [
  "active",
  "available",
  "inactive",
  "offline",
];

type HostChargerManagerProps = {
  ownerId: string;
};

export function HostChargerManager({ ownerId }: HostChargerManagerProps) {
  const [chargers, setChargers] = useState<ChargerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addPlug, setAddPlug] = useState<ChargerType>("Level 2 240V");
  const [addPrice, setAddPrice] = useState("0.35");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPlug, setEditPlug] = useState<ChargerType>("Level 2 240V");
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState<ChargerStatus>("active");
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchChargersByOwnerId(ownerId);
      setChargers(rows);
    } catch {
      setChargers([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (c: ChargerRow) => {
    setEditingId(c.id);
    setEditTitle(c.title ?? c.label ?? "Charger");
    setEditPlug((c.plug_type as ChargerType) ?? "Level 2 240V");
    setEditPrice(String(Number(c.price_per_kwh)));
    setEditStatus(c.status);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const onSaveEdit = async () => {
    if (!editingId) return;
    const price = Number(editPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setEditError("Enter a valid price per kWh.");
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      await updateChargerListingFieldsForOwner(editingId, ownerId, {
        title: editTitle.trim(),
        plug_type: editPlug,
        label: editPlug,
        price_per_kwh: price,
        status: editStatus,
      });
      setEditingId(null);
      await load();
    } catch (e) {
      setEditError(
        e instanceof Error ? e.message : "Could not update charger.",
      );
    } finally {
      setEditBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    if (
      !window.confirm(
        "Remove this charger listing? This cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await deleteChargerForOwner(id, ownerId);
      await load();
    } catch {
      /* noop */
    }
  };

  const onAdd = async () => {
    setAddError(null);
    const price = Number(addPrice);
    if (!addTitle.trim()) {
      setAddError("Add a title for your charger.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setAddError("Enter a valid price per kWh.");
      return;
    }
    setAddBusy(true);
    try {
      await insertChargerForAuthOwner({
        ownerId,
        title: addTitle.trim(),
        plugType: addPlug,
        pricePerKwh: price,
      });
      setAddTitle("");
      setAddPlug("Level 2 240V");
      setAddPrice("0.35");
      setShowAdd(false);
      await load();
    } catch (e) {
      setAddError(
        e instanceof Error ? e.message : "Could not add charger.",
      );
    } finally {
      setAddBusy(false);
    }
  };

  return (
    <section
      id="charger-management"
      className="m2m-rise scroll-mt-28 rounded-[2rem] border border-white/10 bg-[#000000] p-6 sm:p-8"
      style={{ animationDelay: "260ms" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-headline font-bold uppercase tracking-[0.15em] text-[#34fea0]">
            Host
          </p>
          <h2 className="mt-1 font-headline text-lg font-bold text-on-surface">
            Charger management
          </h2>
          <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
            List chargers and set USD per kWh. New listings use a default map
            hub (NYC) until you place the pin from the full host flow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAdd((v) => !v);
            setAddError(null);
          }}
          className="rounded-xl border border-[#34fea0]/40 bg-[#34fea0]/10 px-4 py-2.5 font-headline text-sm font-bold text-[#34fea0] transition hover:bg-[#34fea0]/15"
        >
          {showAdd ? "Close" : "Add New Charger"}
        </button>
      </div>

      {showAdd ? (
        <div className="mt-6 rounded-2xl border border-[#34fea0]/20 bg-white/[0.02] p-5">
          <p className="font-headline text-sm font-bold text-on-surface">
            New charger
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="hcm-title">
                Charger title
              </label>
              <input
                id="hcm-title"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="e.g. Driveway Level 2"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-[#34fea0]/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="hcm-plug">
                Plug type
              </label>
              <select
                id="hcm-plug"
                value={addPlug}
                onChange={(e) => setAddPlug(e.target.value as ChargerType)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-[#34fea0]/30"
              >
                {PLUG_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant" htmlFor="hcm-price">
                Price per kWh (USD)
              </label>
              <input
                id="hcm-price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-[#34fea0]/30"
              />
            </div>
          </div>
          {addError ? (
            <p className="mt-3 text-sm text-error">{addError}</p>
          ) : null}
          <button
            type="button"
            disabled={addBusy}
            onClick={() => void onAdd()}
            className="mt-4 rounded-xl bg-[#34fea0] px-5 py-2.5 font-headline text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {addBusy ? "Saving…" : "Save charger"}
          </button>
        </div>
      ) : null}

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading chargers…</p>
        ) : chargers.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No chargers yet. Add one to appear on the map (hub location) with your
            rate.
          </p>
        ) : (
          <ul className="space-y-4">
            {chargers.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                {editingId === c.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant" htmlFor={`et-${c.id}`}>
                        Title
                      </label>
                      <input
                        id={`et-${c.id}`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-[#34fea0]/30"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant" htmlFor={`ep-${c.id}`}>
                          Plug type
                        </label>
                        <select
                          id={`ep-${c.id}`}
                          value={editPlug}
                          onChange={(e) =>
                            setEditPlug(e.target.value as ChargerType)
                          }
                          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-on-surface"
                        >
                          {PLUG_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant" htmlFor={`epr-${c.id}`}>
                          $ / kWh
                        </label>
                        <input
                          id={`epr-${c.id}`}
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-on-surface"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant" htmlFor={`es-${c.id}`}>
                        Status
                      </label>
                      <select
                        id={`es-${c.id}`}
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as ChargerStatus)
                        }
                        className="w-full max-w-xs rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-on-surface"
                      >
                        {HOST_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    {editError ? (
                      <p className="text-xs text-error">{editError}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={editBusy}
                        onClick={() => void onSaveEdit()}
                        className="rounded-lg bg-[#34fea0] px-4 py-2 font-headline text-xs font-bold text-black disabled:opacity-50"
                      >
                        {editBusy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-headline font-bold text-on-surface">
                        {c.title ?? c.label ?? "Charger"}
                      </p>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {c.plug_type ?? c.label} · $
                        {Number(c.price_per_kwh).toFixed(2)}/kWh ·{" "}
                        <span className="text-[#34fea0]/90">{c.status}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="rounded-lg border border-[#34fea0]/35 px-3 py-1.5 text-xs font-bold text-[#34fea0] hover:bg-[#34fea0]/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(c.id)}
                        className="rounded-lg border border-error/40 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
