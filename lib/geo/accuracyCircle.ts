/**
 * Approximate GeoJSON polygon for a circle (meters) around a WGS84 point.
 * Good enough for an uncertainty ring on the map at city scale.
 */
export function accuracyCirclePolygon(
  lng: number,
  lat: number,
  radiusM: number,
  segments = 64,
): {
  type: "Feature";
  properties: Record<string, never>;
  geometry: { type: "Polygon"; coordinates: [number, number][][] };
} {
  const r = Math.max(radiusM, 1);
  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const dy = (r * Math.sin(theta)) / 111_320;
    const dx =
      (r * Math.cos(theta)) /
      (111_320 * Math.cos((lat * Math.PI) / 180));
    coords.push([lng + dx, lat + dy]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
  };
}
