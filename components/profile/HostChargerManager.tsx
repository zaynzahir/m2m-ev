"use client";

import { useCallback, useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";

import { AuthQrModal } from "@/components/dashboard/AuthQrModal";
import { toSafeToastError } from "@/lib/client-facing-error";
import {
  deleteChargerForOwner,
  fetchChargersByOwnerId,
  insertChargerForAuthOwner,
  type ChargerType,
  updateChargerListingFieldsForOwner,
} from "@/lib/supabase/client";
import { getPublicEnv, hasMapboxPublicToken } from "@/lib/env/public";
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
  const { mapboxToken } = getPublicEnv();
  const mapboxReady = hasMapboxPublicToken();
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
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationMode, setLocationMode] = useState<"choice" | "map">("choice");
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pickedLocation, setPickedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [qrModal, setQrModal] = useState<{ id: string; title: string } | null>(null);

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
        toSafeToastError(
          e,
          "Could not update this charger. Refresh once or email info@m2m.energy.",
        ),
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
    setLocationError(null);
    setPickedLocation(null);
    setLocationMode("choice");
    setLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    if (locationBusy || addBusy) return;
    setLocationModalOpen(false);
    setLocationMode("choice");
    setLocationError(null);
  };

  const saveNewChargerWithLocation = async (coords: { lat: number; lng: number }) => {
    const price = Number(addPrice);
    setAddBusy(true);
    setLocationError(null);
    try {
      await insertChargerForAuthOwner({
        ownerId,
        title: addTitle.trim(),
        plugType: addPlug,
        pricePerKwh: price,
        lat: coords.lat,
        lng: coords.lng,
      });
      setAddTitle("");
      setAddPlug("Level 2 240V");
      setAddPrice("0.35");
      setShowAdd(false);
      setLocationModalOpen(false);
      setLocationMode("choice");
      setPickedLocation(null);
      await load();
    } catch (e) {
      setLocationError(
        toSafeToastError(
          e,
          "Could not add this charger. Refresh once or email info@m2m.energy.",
        ),
      );
    } finally {
      setAddBusy(false);
    }
  };

  const onChooseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setLocationBusy(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickedLocation(coords);
        void saveNewChargerWithLocation(coords);
        setLocationBusy(false);
      },
      (error) => {
        setLocationBusy(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. You can choose on map instead."
            : "Could not get your location. Try again or choose on map.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
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
            Set your USD per kWh rate and manage charger listings shown to
            drivers on the map. You can run multiple chargers with different
            pricing and update availability at any time.
          </p>
          <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
            Host tools also support Proof of Presence QR session flow so drivers
            can coordinate directly at the plug.
          </p>
          {chargers.length > 0 ? (
            <button
              type="button"
              onClick={() =>
                setQrModal({
                  id: chargers[0].id,
                  title: chargers[0].title ?? chargers[0].label ?? "Charger",
                })
              }
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-headline font-bold text-primary transition hover:bg-primary/15"
            >
              <span className="material-symbols-outlined text-base">qr_code_2</span>
              Quick access: Show my host QR
            </button>
          ) : null}
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
            No chargers yet. Add one to publish your spot on the map with your
            selected USD per kWh rate.
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
                        onClick={() =>
                          setQrModal({
                            id: c.id,
                            title: c.title ?? c.label ?? "Charger",
                          })
                        }
                        className="rounded-lg border border-primary/35 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10"
                      >
                        Show Host QR
                      </button>
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

      {locationModalOpen ? (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface-container-high p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Set charger location
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Choose how to place this charger on the map before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={closeLocationModal}
                disabled={locationBusy || addBusy}
                className="rounded-lg p-1 text-on-surface-variant hover:bg-white/5 disabled:opacity-40"
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
                  disabled={locationBusy || addBusy}
                  className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 text-left transition hover:bg-primary/15 disabled:opacity-50"
                >
                  <p className="font-headline text-sm font-bold text-primary">
                    Choose my location
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Use your browser location permission and place charger at your
                    current location.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocationError(null);
                    setLocationMode("map");
                  }}
                  className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-4 text-left transition hover:bg-secondary/15"
                >
                  <p className="font-headline text-sm font-bold text-secondary">
                    Choose on map
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Drop a pin manually, then click Done to save.
                  </p>
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
                        <Marker
                          longitude={pickedLocation.lng}
                          latitude={pickedLocation.lat}
                          anchor="bottom"
                        >
                          <span className="material-symbols-outlined text-3xl text-[#34fea0] drop-shadow-[0_0_8px_rgba(52,254,160,0.7)]">
                            location_on
                          </span>
                        </Marker>
                      ) : null}
                    </Map>
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-on-surface-variant">
                      Mapbox token missing. Set NEXT_PUBLIC_MAPBOX_TOKEN to use
                      manual map selection.
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
                    disabled={!pickedLocation || addBusy}
                    onClick={() =>
                      pickedLocation
                        ? void saveNewChargerWithLocation(pickedLocation)
                        : undefined
                    }
                    className="rounded-lg bg-[#34fea0] px-3 py-2 text-xs font-bold text-black disabled:opacity-50"
                  >
                    {addBusy ? "Saving..." : "Done"}
                  </button>
                </div>
              </div>
            )}

            {locationError ? (
              <p className="mt-3 text-sm text-error">{locationError}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <AuthQrModal
        open={qrModal !== null}
        chargerId={qrModal?.id ?? ""}
        nodeTitle={qrModal?.title ?? ""}
        onClose={() => setQrModal(null)}
      />
    </section>
  );
}
