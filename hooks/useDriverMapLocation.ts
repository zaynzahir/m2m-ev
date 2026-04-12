"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { MapRef } from "react-map-gl/mapbox";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  clearDriverLocationRow,
  fetchProfileForMapContext,
  subscribeDriverLocationsRealtime,
  upsertDriverLocation,
} from "@/lib/supabase/client";
import type { DriverLocationRow, UserProfileRow } from "@/lib/types/database";

export type MapPosition = {
  lat: number;
  lng: number;
  accuracy: number | null;
};

const UPSERT_MS = 4000;

export function isDriverRole(role: UserProfileRow["role"] | undefined): boolean {
  return role === "driver" || role === "both";
}

export function isHostRole(role: UserProfileRow["role"] | undefined): boolean {
  return role === "host" || role === "both";
}

export function useMapProfile() {
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const p = await fetchProfileForMapContext(wallet);
        if (!cancelled) setProfile(p);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet, connected, user?.id]);

  return { profile, profileLoading: loading, wallet };
}

export function useLocateMe(
  mapRef: RefObject<MapRef | null>,
  onDenied: () => void,
) {
  const [locating, setLocating] = useState(false);
  const [preview, setPreview] = useState<MapPosition | null>(null);

  const locateMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      onDenied();
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy ?? null;
        setPreview({ lat, lng, accuracy });
        const z = mapRef.current?.getZoom?.() ?? 11;
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: Math.max(12, z),
          duration: 1200,
        });
      },
      () => {
        setLocating(false);
        setPreview(null);
        onDenied();
      },
      { enableHighAccuracy: true, maximumAge: 0 },
    );
  }, [mapRef, onDenied]);

  return { locating, locateMe, locatePreview: preview };
}

export function useDriverLiveTracking(
  enabled: boolean,
  userId: string | null,
  syncToSupabase: boolean,
) {
  const watchIdRef = useRef<number | null>(null);
  const lastUpsertRef = useRef(0);
  const [position, setPosition] = useState<MapPosition | null>(null);
  const [gpsResolving, setGpsResolving] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      setPosition(null);
      setGpsResolving(false);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    setGpsResolving(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsResolving(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy ?? null;
        setPosition({ lat, lng, accuracy });

        if (!syncToSupabase) return;
        const now = Date.now();
        if (now - lastUpsertRef.current < UPSERT_MS) return;
        lastUpsertRef.current = now;
        void upsertDriverLocation(userId, lat, lng, accuracy).catch(() => {});
      },
      () => {
        setGpsResolving(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 },
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (syncToSupabase) {
        void clearDriverLocationRow().catch(() => {});
      }
    };
  }, [enabled, userId, syncToSupabase]);

  return { driverPosition: position, gpsResolving };
}

export function useHostDriverLocations(
  enabled: boolean,
  excludeUserId: string | null,
) {
  const [rows, setRows] = useState<DriverLocationRow[]>([]);

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      return;
    }
    return subscribeDriverLocationsRealtime((all) => {
      const filtered = excludeUserId
        ? all.filter((r) => r.user_id !== excludeUserId)
        : all;
      setRows(filtered);
    });
  }, [enabled, excludeUserId]);

  return rows;
}
