/** Extract charger UUID from an M2M QR / deep-link string (printed or scanned). */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidLike(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function extractChargerIdFromQrPayload(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  try {
    const url = new URL(text);
    const q = url.searchParams.get("charger");
    if (q && isUuidLike(q)) return q.toLowerCase();
  } catch {
    /* not a full URL */
  }

  const loose = /[?&]charger=([0-9a-f-]{36})/i.exec(text);
  if (loose?.[1] && isUuidLike(loose[1])) return loose[1].toLowerCase();

  if (isUuidLike(text)) return text.toLowerCase();

  return null;
}
