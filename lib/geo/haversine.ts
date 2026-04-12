import type { ChargerRow } from "@/lib/types/database";

/** Great-circle distance in kilometers. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestCharger(
  lat: number,
  lng: number,
  chargers: ChargerRow[],
): ChargerRow | null {
  if (chargers.length === 0) return null;
  let best = chargers[0];
  let bestKm = Infinity;
  for (const c of chargers) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestKm) {
      bestKm = d;
      best = c;
    }
  }
  return best;
}
