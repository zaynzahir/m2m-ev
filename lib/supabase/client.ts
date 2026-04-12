import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { getPublicEnv, hasSupabasePublicConfig } from "@/lib/env/public";
import type {
  ChargerRow,
  ChargingChargerRow,
  ChargingSessionReceiptRow,
  DriverLocationRow,
  UserProfileRow,
  UserRole,
} from "@/lib/types/database";

export type { ChargingChargerRow } from "@/lib/types/database";

export type ChargerType =
  | "Level 1"
  | "Level 2 240V"
  | "Tesla Wall Connector";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.");
  }
  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
  return browserClient;
}

/** Provider string from Supabase Auth (email, google, apple, …). */
export function authProviderFromSupabaseUser(user: User): string {
  const fromMeta = user.app_metadata?.provider;
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
  const first = user.identities?.[0]?.provider;
  if (typeof first === "string" && first.trim()) return first.trim();
  return "email";
}

function emailVerifiedAtIso(user: User): string | null {
  const at = user.email_confirmed_at;
  if (!at) return null;
  try {
    return new Date(at).toISOString();
  } catch {
    return null;
  }
}

export async function signOutAll(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await ensureAuthProfileRow();
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ needsEmailConfirmation: boolean }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  await ensureAuthProfileRow();
  return { needsEmailConfirmation: !data.session };
}

/**
 * Ensures a `public.users` row exists for the current Supabase Auth user (backup if DB trigger is not installed).
 * Keeps email, auth_provider, and email_verified_at in sync with Auth on every call.
 */
export async function ensureAuthProfileRow(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return;

  const provider = authProviderFromSupabaseUser(user);
  const verifiedAt = emailVerifiedAtIso(user);

  const { data: existing, error: findErr } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing) {
    const { error: upErr } = await supabase
      .from("users")
      .update({
        email: user.email ?? null,
        auth_provider: provider,
        email_verified_at: verifiedAt,
      })
      .eq("auth_user_id", user.id);
    if (upErr) throw upErr;
    return;
  }

  const { error: insErr } = await supabase.from("users").insert({
    auth_user_id: user.id,
    email: user.email ?? null,
    role: "driver",
    auth_provider: provider,
    email_verified_at: verifiedAt,
  });
  if (insErr) {
    const msg = insErr.message ?? "";
    if (!/duplicate|unique/i.test(msg)) throw insErr;
  }
}

export async function signInWithOAuthProvider(
  provider: "google" | "apple",
  redirectPath = "/auth/callback",
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!origin) {
    throw new Error("Set NEXT_PUBLIC_SITE_URL for server OAuth redirects.");
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}${redirectPath.startsWith("/") ? "" : "/"}${redirectPath}`,
    },
  });
  if (error) throw error;
}

export async function requestPasswordResetEmail(email: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/update-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function resendSignupConfirmation(email: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
  });
  if (error) throw error;
}

/**
 * Profile for map features: prefers Supabase Auth row, else wallet only profile.
 */
export async function fetchProfileForMapContext(
  walletAddress: string | null,
): Promise<UserProfileRow | null> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return data as UserProfileRow | null;
  }
  if (walletAddress) {
    return fetchUserProfileByWallet(walletAddress);
  }
  return null;
}

export async function fetchUserProfileByWallet(
  walletAddress: string,
): Promise<UserProfileRow | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle();
  if (error) throw error;
  return data as UserProfileRow | null;
}

export async function upsertDriverProfile(input: {
  walletAddress: string;
  displayName: string;
  vehicleModel: string;
  contactMethod: string;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("users").upsert(
    {
      wallet_address: input.walletAddress,
      display_name: input.displayName,
      vehicle_model: input.vehicleModel,
      contact_method: input.contactMethod,
      role: "driver",
      auth_provider: "wallet",
    },
    { onConflict: "wallet_address" },
  );
  if (error) throw error;
}

async function ensureUserForWallet(
  supabase: SupabaseClient,
  walletAddress: string,
  displayName: string,
  contactMethod: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        wallet_address: walletAddress,
        display_name: displayName,
        contact_method: contactMethod,
        role: "host",
        auth_provider: "wallet",
      },
      { onConflict: "wallet_address" },
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function createChargerListing(input: {
  ownerWalletAddress: string;
  displayName: string;
  contactMethod: string;
  lat: number;
  lng: number;
  pricePerKwh: number;
  chargerType: ChargerType;
  parkingInstructions: string;
  chargerBrandSlug: string;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const ownerId = await ensureUserForWallet(
    supabase,
    input.ownerWalletAddress,
    input.displayName,
    input.contactMethod,
  );

  const { error } = await supabase.from("chargers").insert({
    owner_id: ownerId,
    lat: input.lat,
    lng: input.lng,
    price_per_kwh: input.pricePerKwh,
    status: "active",
    title: `${input.displayName}'s charger`,
    label: input.chargerType,
    plug_type: input.chargerType,
    description: input.parkingInstructions,
    parking_instructions: input.parkingInstructions,
    charger_brand_slug: input.chargerBrandSlug,
  });
  if (error) throw error;
}

export async function fetchActiveChargers(): Promise<ChargerRow[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("chargers")
    .select("*")
    .in("status", ["active", "available", "charging"])
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChargerRow[];
}

export async function updateChargerStatus(
  chargerId: string,
  status: ChargerRow["status"],
  activeDriverWallet?: string | null,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const patch: Record<string, unknown> = { status };
  if (activeDriverWallet !== undefined) {
    patch.active_driver_wallet = activeDriverWallet;
  }
  const { error } = await supabase
    .from("chargers")
    .update(patch)
    .eq("id", chargerId);
  if (error) throw error;
}

export async function fetchChargersByOwnerId(ownerId: string): Promise<ChargerRow[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("chargers")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChargerRow[];
}

export async function linkWalletToAuthProfile(walletAddress: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("You must be signed in to link a wallet.");

  const provider = authProviderFromSupabaseUser(user);
  const verifiedAt = emailVerifiedAtIso(user);

  const { error } = await supabase.from("users").upsert(
    {
      auth_user_id: user.id,
      wallet_address: walletAddress,
      email: user.email ?? null,
      auth_provider: provider,
      email_verified_at: verifiedAt,
    },
    { onConflict: "auth_user_id" },
  );
  if (error) throw error;
}

export async function fetchChargingSessions(): Promise<ChargingChargerRow[]> {
  if (!hasSupabasePublicConfig()) return [];
  const supabase = getSupabaseBrowserClient();

  const { data: chargers, error: cErr } = await supabase
    .from("chargers")
    .select("id,title,status,owner_id")
    .eq("status", "charging");
  if (cErr) throw cErr;
  if (!chargers?.length) return [];

  const ownerIds = [...new Set(chargers.map((c) => c.owner_id).filter(Boolean))] as string[];
  const { data: owners, error: oErr } = await supabase
    .from("users")
    .select("id,wallet_address")
    .in("id", ownerIds);
  if (oErr) throw oErr;
  const walletByOwner = new Map(
    (owners ?? []).map((o) => [o.id as string, o.wallet_address as string | null]),
  );

  return chargers.map((c) => ({
    id: c.id as string,
    title: (c.title as string | null) ?? null,
    owner_wallet: c.owner_id ? walletByOwner.get(c.owner_id as string) ?? null : null,
    status: c.status as ChargerRow["status"],
  }));
}

export async function recordOracleChargeComplete(chargerId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  const { data: charger, error: chErr } = await supabase
    .from("chargers")
    .select("id,owner_id,active_driver_wallet")
    .eq("id", chargerId)
    .single();
  if (chErr) throw chErr;
  if (!charger?.active_driver_wallet) {
    throw new Error("No active driver on this charger.");
  }

  const { data: owner, error: owErr } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("id", charger.owner_id as string)
    .single();
  if (owErr) throw owErr;
  const hostWallet = owner?.wallet_address as string | null;
  if (!hostWallet) {
    throw new Error("Host wallet missing for this charger.");
  }

  const driverWallet = charger.active_driver_wallet as string;

  const { error: insErr } = await supabase.from("charging_sessions").insert({
    charger_id: chargerId,
    driver_wallet: driverWallet,
    host_wallet: hostWallet,
    amount_sol: 0.01,
    status: "completed",
  });
  if (insErr) throw insErr;

  const { error: upErr } = await supabase
    .from("chargers")
    .update({
      status: "available",
      active_driver_wallet: null,
    })
    .eq("id", chargerId);
  if (upErr) throw upErr;
}

export async function fetchChargersOwnedByWallet(
  walletAddress: string,
): Promise<ChargerRow[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: user, error: uErr } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", walletAddress)
    .maybeSingle();
  if (uErr) throw uErr;
  if (!user?.id) return [];

  const { data, error } = await supabase
    .from("chargers")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChargerRow[];
}

export async function fetchLedgerSessionsForHost(
  hostWallet: string,
): Promise<ChargingSessionReceiptRow[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("charging_sessions")
    .select("*")
    .eq("host_wallet", hostWallet)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ChargingSessionReceiptRow[];
}

export async function fetchLedgerSessionsForDriver(
  driverWallet: string,
): Promise<ChargingSessionReceiptRow[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("charging_sessions")
    .select("*")
    .eq("driver_wallet", driverWallet)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ChargingSessionReceiptRow[];
}

export async function sumHostEarningsSol(hostWallet: string): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("charging_sessions")
    .select("amount_sol")
    .eq("host_wallet", hostWallet)
    .eq("status", "completed");
  if (error) throw error;
  return (data ?? []).reduce(
    (acc, row) => acc + Number((row as { amount_sol: number }).amount_sol),
    0,
  );
}

export async function sumDriverSpentSol(driverWallet: string): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("charging_sessions")
    .select("amount_sol")
    .eq("driver_wallet", driverWallet)
    .eq("status", "completed");
  if (error) throw error;
  return (data ?? []).reduce(
    (acc, row) => acc + Number((row as { amount_sol: number }).amount_sol),
    0,
  );
}

export async function updateAuthUserProfile(
  patch: Partial<
    Pick<
      UserProfileRow,
      "display_name" | "vehicle_model" | "contact_method" | "role"
    >
  >,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Sign in to edit your profile.");
  const { error } = await supabase
    .from("users")
    .update(patch)
    .eq("auth_user_id", user.id);
  if (error) throw error;
}

export async function updateWalletUserProfile(
  walletAddress: string,
  patch: Partial<
    Pick<
      UserProfileRow,
      "display_name" | "vehicle_model" | "contact_method" | "role"
    >
  >,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("users")
    .update(patch)
    .eq("wallet_address", walletAddress);
  if (error) throw error;
}

export async function updateUserRoleForAuth(role: UserRole): Promise<void> {
  await updateAuthUserProfile({ role });
}

export async function updateUserRoleForWallet(
  walletAddress: string,
  role: UserRole,
): Promise<void> {
  await updateWalletUserProfile(walletAddress, { role });
}

export async function setChargerListingStatusForOwner(
  chargerId: string,
  ownerId: string,
  status: ChargerRow["status"],
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("chargers")
    .update({ status })
    .eq("id", chargerId)
    .eq("owner_id", ownerId);
  if (error) throw error;
}

/** Updates listing price shown on map pins and charger cards (owner must match). */
export async function updateChargerPriceForOwner(
  chargerId: string,
  ownerId: string,
  pricePerKwh: number,
): Promise<void> {
  if (!Number.isFinite(pricePerKwh) || pricePerKwh <= 0) {
    throw new Error("Price per kWh must be greater than zero.");
  }
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("chargers")
    .update({ price_per_kwh: pricePerKwh })
    .eq("id", chargerId)
    .eq("owner_id", ownerId);
  if (error) throw error;
}

export async function deleteChargerForOwner(
  chargerId: string,
  ownerId: string,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("chargers")
    .delete()
    .eq("id", chargerId)
    .eq("owner_id", ownerId);
  if (error) throw error;
}

export async function upsertDriverLocation(
  userId: string,
  lat: number,
  lng: number,
  accuracyM: number | null,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("driver_locations").upsert(
    {
      user_id: userId,
      lat,
      lng,
      accuracy_m: accuracyM,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

/** Removes the current user’s live map row (call when leaving the map / stopping tracking). */
export async function clearDriverLocationRow(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!profile?.id) return;
  const { error } = await supabase
    .from("driver_locations")
    .delete()
    .eq("user_id", profile.id);
  if (error) throw error;
}

/**
 * Hosts (authenticated) see other drivers’ positions; refetches on Realtime events.
 */
export function subscribeDriverLocationsRealtime(
  onUpdate: (rows: DriverLocationRow[]) => void,
): () => void {
  const supabase = getSupabaseBrowserClient();
  const load = async () => {
    const { data, error } = await supabase.from("driver_locations").select("*");
    if (error) return;
    onUpdate((data ?? []) as DriverLocationRow[]);
  };
  void load();
  const channel = supabase
    .channel("m2m_driver_locations")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "driver_locations" },
      () => void load(),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
