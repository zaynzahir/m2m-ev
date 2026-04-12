/**
 * Read Next public env vars with literal property access so values are inlined
 * at build time (Next.js static analysis).
 */
export function getPublicEnv(): {
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  mapboxToken: string | undefined;
} {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  };
}

export function hasSupabasePublicConfig(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return Boolean(
    supabaseUrl?.trim() &&
      supabaseAnonKey?.trim() &&
      supabaseUrl.startsWith("http"),
  );
}

export function hasMapboxPublicToken(): boolean {
  const t = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  return Boolean(t && t.length > 10);
}
