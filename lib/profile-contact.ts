export type ParsedContact = {
  username: string;
  phone: string;
};

/**
 * We store one DB field (`contact_method`) but expose separate UI fields.
 * Stored format: "@username | +123456789"
 */
export function buildContactMethod(input: ParsedContact): string {
  const username = input.username.trim();
  const phone = input.phone.trim();
  if (username && phone) return `${username} | ${phone}`;
  return username || phone;
}

export function parseContactMethod(raw: string | null | undefined): ParsedContact {
  const value = (raw ?? "").trim();
  if (!value) return { username: "", phone: "" };
  const parts = value.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { username: parts[0], phone: parts[1] };
  }
  if (value.startsWith("@")) {
    return { username: value, phone: "" };
  }
  return { username: "", phone: value };
}

export function isLikelyFullName(name: string): boolean {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts.length >= 2;
}
