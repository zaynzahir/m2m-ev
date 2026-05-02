/**
 * Turns thrown errors into short, user-facing strings for toasts.
 * Avoids leaking Postgres, PostgREST, RLS internals, filenames, or long JSON blobs.
 */

function rawMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  return "";
}

function looksTechnicalDetails(msg: string): boolean {
  const lower = msg.toLowerCase();
  if (lower.includes("postgresql") || lower.includes("postgres ")) return true;
  if (lower.includes("supabase") || lower.includes("pgrst")) return true;
  if (lower.includes(".sql") || lower.includes("schema")) return true;
  if (lower.includes("relation ") || lower.includes("violates "))
    return true;
  if (lower.includes("duplicate key") || lower.includes("foreign key"))
    return true;
  if (lower.includes("row-level security") || lower.includes("new row violates"))
    return true;
  if (lower.includes("hint:") || lower.includes("\"hint\"")) return true;
  if (lower.includes("sqlstate") || lower.includes("error code"))
    return true;
  if (
    lower.includes("simulation failed") ||
    lower.includes("program log") ||
    lower.includes("instructionerror") ||
    lower.includes("instruction error")
  )
    return true;
  return false;
}

/**
 * Maps Supabase-ish failures to concise copy before falling back.
 */
export function toSafeToastError(e: unknown, fallback: string): string {
  const msg = rawMessage(e).trim();
  if (!msg) return fallback;

  const lower = msg.toLowerCase();

  if (
    lower.includes("lock:") ||
    lower.includes("lock broken by another request") ||
    lower.includes("steal option")
  ) {
    return "Sync is busy. Please refresh once or close duplicate tabs.";
  }

  if (
    lower.includes("jwt") ||
    lower.includes("refresh token") ||
    (lower.includes("session") &&
      (lower.includes("invalid") ||
        lower.includes("expired") ||
        lower.includes("missing")))
  ) {
    return "Session check failed. Please sign in again, then retry.";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("load failed")
  ) {
    return "Network issue. Check your connection and try again.";
  }

  if (looksTechnicalDetails(msg)) return fallback;

  if (msg.length > 220) return fallback;

  return msg;
}
