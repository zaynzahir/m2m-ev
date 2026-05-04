import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

import { getPublicEnv, hasSupabasePublicConfig } from "@/lib/env/public";
import type {
  ChargerRow,
  ChargingChargerRow,
  ChargerSessionPreviewRpc,
  ChargingSessionIntentStage,
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

/**
 * Offline placeholder when public env vars are missing (e.g. CI build without secrets).
 * Avoids throwing during React mount — map/profile still use `hasSupabasePublicConfig()` for real data.
 */
function createOfflineSupabaseClient(): SupabaseClient {
  return createClient("https://offline.invalid", "offline", {
    auth: {
      flowType: "pkce",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    browserClient = createOfflineSupabaseClient();
    return browserClient;
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

function roleFromMetadata(user: User): UserRole {
  const raw = user.user_metadata?.role;
  if (raw === "driver" || raw === "host" || raw === "both") return raw;
  return "driver";
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalAge(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value >= 13 && value <= 120 ? value : null;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed >= 13 && parsed <= 120) {
      return parsed;
    }
  }
  return null;
}

/**
 * App origin without path or stray trailing slashes/backslashes — used for Auth redirect_to /
 * emailRedirectTo so confirmation and reset links stay clean and Supabase redirect allowlists match.
 */
function canonicalSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  let raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  raw = raw.replace(/[\\/]+$/u, "");
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw.replace(/^[\\/]+/, "")}`;
  }
  try {
    return new URL(raw).origin;
  } catch {
    return raw;
  }
}

function siteUrl(pathWithLeadingSlash: string): string {
  const base = canonicalSiteOrigin();
  const path = pathWithLeadingSlash.startsWith("/")
    ? pathWithLeadingSlash
    : `/${pathWithLeadingSlash}`;
  return `${base}${path}`;
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
  profileInput?: {
    role?: UserRole;
    displayName?: string;
    vehicleModel?: string;
    contactMethod?: string;
    walletAddress?: string;
    age?: number;
  },
): Promise<{ needsEmailConfirmation: boolean }> {
  const supabase = getSupabaseBrowserClient();
  const role = profileInput?.role ?? "driver";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: siteUrl("/auth/callback"),
      data: {
        role,
        display_name: profileInput?.displayName?.trim() || null,
        vehicle_model: profileInput?.vehicleModel?.trim() || null,
        contact_method: profileInput?.contactMethod?.trim() || null,
        wallet_address: profileInput?.walletAddress?.trim() || null,
        age: optionalAge(profileInput?.age),
      },
    },
  });
  if (error) throw error;
  const signedUpUser = data.user;
  if (!signedUpUser) {
    return { needsEmailConfirmation: true };
  }
  try {
    await ensureAuthProfileRowForUser(signedUpUser);
  } catch (e) {
    console.warn(
      "[M2M] Profile row sync after sign-up (non-fatal):",
      e instanceof Error ? e.message : e,
    );
  }
  return { needsEmailConfirmation: !data.session };
}

/**
 * Ensures a `public.users` row exists for the given Auth user (use the object returned from `signUp` / session).
 * Prefer this right after sign-up: `getUser()` may not reflect the new user until a session exists.
 */
export async function ensureAuthProfileRowForUser(user: User): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const provider = authProviderFromSupabaseUser(user);
  const verifiedAt = emailVerifiedAtIso(user);
  const metadataRole = roleFromMetadata(user);
  const metadataDisplayName = optionalString(user.user_metadata?.display_name);
  const metadataVehicleModel = optionalString(user.user_metadata?.vehicle_model);
  const metadataContactMethod = optionalString(user.user_metadata?.contact_method);
  const metadataWalletAddress = optionalString(user.user_metadata?.wallet_address);
  const metadataAge = optionalAge(user.user_metadata?.age);

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
        role: metadataRole,
        display_name: metadataDisplayName,
        vehicle_model: metadataVehicleModel,
        contact_method: metadataContactMethod,
        wallet_address: metadataWalletAddress,
        age: metadataAge,
        onboarding_completed_at:
          metadataDisplayName || metadataContactMethod || metadataVehicleModel
            ? new Date().toISOString()
            : null,
      })
      .eq("auth_user_id", user.id);
    if (upErr) throw upErr;
    return;
  }

  const { error: insErr } = await supabase.from("users").insert({
    auth_user_id: user.id,
    email: user.email ?? null,
    role: metadataRole,
    display_name: metadataDisplayName,
    vehicle_model: metadataVehicleModel,
    contact_method: metadataContactMethod,
    wallet_address: metadataWalletAddress,
    age: metadataAge,
    onboarding_completed_at:
      metadataDisplayName || metadataContactMethod || metadataVehicleModel
        ? new Date().toISOString()
        : null,
    auth_provider: provider,
    email_verified_at: verifiedAt,
  });
  if (insErr) {
    const msg = insErr.message ?? "";
    if (!/duplicate|unique/i.test(msg)) throw insErr;
  }
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
  await ensureAuthProfileRowForUser(user);
}

export async function signInWithOAuthProvider(
  provider: "google" | "apple",
  redirectPath = "/auth/callback",
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const base = canonicalSiteOrigin();
  if (!base) {
    throw new Error("Set NEXT_PUBLIC_SITE_URL for server OAuth redirects.");
  }
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${base}${path}`,
    },
  });
  if (error) throw error;
}

export async function requestPasswordResetEmail(email: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: siteUrl("/auth/update-password"),
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
    options: {
      emailRedirectTo: siteUrl("/auth/callback"),
    },
  });
  if (error) throw error;
}

/**
 * Mirrors verified-email timestamp from Supabase Auth into `public.users`.
 * Safe to call multiple times (profile header/status refresh use case).
 */
export async function syncAuthEmailVerification(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return;
  const { error } = await supabase
    .from("users")
    .update({
      email_verified_at: emailVerifiedAtIso(user),
      email: user.email ?? null,
      auth_provider: authProviderFromSupabaseUser(user),
    })
    .eq("auth_user_id", user.id);
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

export type DashboardIdentity = {
  profile: UserProfileRow | null;
  resolvedRole: UserRole;
  walletAddress: string | null;
  emailVerified: boolean;
};

/**
 * Resolves dashboard identity from auth user + wallet context.
 * Uses profile role when available and falls back to driver safely.
 */
export async function fetchDashboardIdentity(
  walletAddress: string | null,
): Promise<DashboardIdentity> {
  const profile = await fetchProfileForMapContext(walletAddress);
  const resolvedRole: UserRole = profile?.role ?? "driver";
  return {
    profile,
    resolvedRole,
    walletAddress: profile?.wallet_address ?? walletAddress ?? null,
    emailVerified: Boolean(profile?.email_verified_at),
  };
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

export async function upsertWalletFirstProfile(input: {
  walletAddress: string;
  role: UserRole;
  displayName?: string;
  vehicleModel?: string;
  contactMethod?: string;
  email?: string;
}): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("users").upsert(
    {
      wallet_address: input.walletAddress,
      role: input.role,
      display_name: input.displayName?.trim() || null,
      vehicle_model: input.vehicleModel?.trim() || null,
      contact_method: input.contactMethod?.trim() || null,
      email: input.email?.trim() || null,
      auth_provider: "wallet",
      onboarding_completed_at: new Date().toISOString(),
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
  const normalizedWallet = walletAddress.trim();
  if (!normalizedWallet) throw new Error("Wallet address is required.");

  // 1) Prefer strict update on the current auth row (RLS-friendly and deterministic).
  const { data: updated, error: updateErr } = await supabase
    .from("users")
    .update({
      wallet_address: normalizedWallet,
      email: user.email ?? null,
      auth_provider: provider,
      email_verified_at: verifiedAt,
    })
    .eq("auth_user_id", user.id)
    .select("id")
    .maybeSingle();
  if (updateErr) throw updateErr;

  // 2) If no row yet (fresh auth account), create one.
  if (!updated?.id) {
    const { error: insertErr } = await supabase.from("users").insert({
      auth_user_id: user.id,
      wallet_address: normalizedWallet,
      email: user.email ?? null,
      role: roleFromMetadata(user),
      display_name: optionalString(user.user_metadata?.display_name),
      vehicle_model: optionalString(user.user_metadata?.vehicle_model),
      contact_method: optionalString(user.user_metadata?.contact_method),
      auth_provider: provider,
      email_verified_at: verifiedAt,
    });
    if (insertErr) {
      const msg = insertErr.message ?? "";
      if (/wallet_address.*duplicate|unique/i.test(msg)) {
        throw new Error(
          "This wallet is already linked to another M2M account. Disconnect it there first or use that account.",
        );
      }
      throw insertErr;
    }
  }

  // Keep auth metadata aligned (best-effort, non-fatal).
  const { error: authMetaErr } = await supabase.auth.updateUser({
    data: { wallet_address: normalizedWallet },
  });
  if (authMetaErr) {
    console.warn(
      "[M2M] Wallet metadata sync skipped:",
      authMetaErr.message ?? authMetaErr,
    );
  }
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

export async function countLedgerSessionsForHost(
  hostWallet: string,
): Promise<number> {
  const sessions = await fetchLedgerSessionsForHost(hostWallet);
  return sessions.length;
}

export async function countLedgerSessionsForDriver(
  driverWallet: string,
): Promise<number> {
  const sessions = await fetchLedgerSessionsForDriver(driverWallet);
  return sessions.length;
}

export type DriverDashboardMetrics = {
  totalSpentSol: number;
  completedSessions: number;
  recentSessions: ChargingSessionReceiptRow[];
  lastSessionAt: string | null;
};

export async function fetchDriverDashboardMetrics(
  driverWallet: string,
): Promise<DriverDashboardMetrics> {
  const [totalSpentSol, recentSessions] = await Promise.all([
    sumDriverSpentSol(driverWallet),
    fetchLedgerSessionsForDriver(driverWallet),
  ]);
  return {
    totalSpentSol,
    completedSessions: recentSessions.length,
    recentSessions,
    lastSessionAt: recentSessions[0]?.created_at ?? null,
  };
}

export type HostDashboardMetrics = {
  totalEarnedSol: number;
  completedSessions: number;
  activeListings: number;
  ownedChargers: ChargerRow[];
  recentSessions: ChargingSessionReceiptRow[];
  lastSessionAt: string | null;
};

export type WalletProfileLookup = {
  wallet_address: string;
  display_name: string | null;
  contact_method: string | null;
};

export async function fetchProfilesByWalletAddresses(
  walletAddresses: string[],
): Promise<WalletProfileLookup[]> {
  const normalized = [...new Set(walletAddresses.map((w) => w.trim()).filter(Boolean))];
  if (!normalized.length) return [];
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("users")
    .select("wallet_address,display_name,contact_method")
    .in("wallet_address", normalized);
  if (error) throw error;
  return (data ?? []) as WalletProfileLookup[];
}

export async function fetchHostDashboardMetrics(
  hostWallet: string,
): Promise<HostDashboardMetrics> {
  const [totalEarnedSol, recentSessions, ownedChargers] = await Promise.all([
    sumHostEarningsSol(hostWallet),
    fetchLedgerSessionsForHost(hostWallet),
    fetchChargersOwnedByWallet(hostWallet),
  ]);
  return {
    totalEarnedSol,
    completedSessions: recentSessions.length,
    activeListings: ownedChargers.filter((c) =>
      ["active", "available", "charging"].includes(c.status),
    ).length,
    ownedChargers,
    recentSessions,
    lastSessionAt: recentSessions[0]?.created_at ?? null,
  };
}

/** Map / session-start UI: host contact + listing fields (SECURITY DEFINER RPC). */
export async function fetchChargerSessionPreview(
  chargerId: string,
): Promise<ChargerSessionPreviewRpc | null> {
  if (!hasSupabasePublicConfig()) return null;
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_charger_session_preview", {
    p_charger_id: chargerId,
  });
  if (error) throw error;
  if (!data || typeof data !== "object") return null;
  return data as ChargerSessionPreviewRpc;
}

export async function insertChargingSessionIntent(input: {
  chargerId: string;
  driverWallet: string;
  hostWallet: string;
  stage: ChargingSessionIntentStage;
}): Promise<{ id: string }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("charging_session_intents")
    .insert({
      charger_id: input.chargerId,
      driver_wallet: input.driverWallet,
      host_wallet: input.hostWallet,
      stage: input.stage,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function updateChargingSessionIntentStage(
  intentId: string,
  stage: ChargingSessionIntentStage,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("charging_session_intents")
    .update({
      stage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", intentId);
  if (error) throw error;
}

export async function updateAuthUserProfile(
  patch: Partial<
    Pick<
      UserProfileRow,
      | "display_name"
      | "vehicle_model"
      | "contact_method"
      | "age"
      | "role"
      | "onboarding_completed_at"
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
      | "display_name"
      | "vehicle_model"
      | "contact_method"
      | "age"
      | "role"
      | "onboarding_completed_at"
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

/**
 * Deletes the currently signed-in account and associated user-owned rows.
 * Uses a server API route backed by Supabase service role.
 */
export async function deleteCurrentAccount(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();
  if (sessionErr) throw sessionErr;
  if (!session?.access_token) throw new Error("Sign in again to delete your account.");

  // Preferred path: Supabase Edge Function (project-managed server runtime).
  const { error: edgeErr } = await supabase.functions.invoke("delete-account", {
    body: {},
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (!edgeErr) return;

  // Fallback path: local API route (for environments where Edge Function is not deployed yet).
  const response = await fetch("/api/account/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({}),
  });
  if (response.ok) return;

  let msg = edgeErr.message || "Could not delete account.";
  try {
    const body = (await response.json()) as { error?: string };
    if (body?.error) msg = body.error;
  } catch {
    // noop
  }
  throw new Error(msg);
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

/** Default map pin for chargers created from Profile (hosts can refine location on /host later). */
const PROFILE_CHARGER_DEFAULT_LAT = 40.7128;
const PROFILE_CHARGER_DEFAULT_LNG = -74.006;

export async function insertChargerForAuthOwner(input: {
  ownerId: string;
  title: string;
  plugType: ChargerType;
  pricePerKwh: number;
  lat?: number;
  lng?: number;
}): Promise<void> {
  if (!Number.isFinite(input.pricePerKwh) || input.pricePerKwh <= 0) {
    throw new Error("Price per kWh must be greater than zero.");
  }
  const lat =
    Number.isFinite(input.lat) && input.lat !== undefined
      ? input.lat
      : PROFILE_CHARGER_DEFAULT_LAT;
  const lng =
    Number.isFinite(input.lng) && input.lng !== undefined
      ? input.lng
      : PROFILE_CHARGER_DEFAULT_LNG;
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("chargers").insert({
    owner_id: input.ownerId,
    lat,
    lng,
    price_per_kwh: input.pricePerKwh,
    status: "active",
    title: input.title.trim(),
    label: input.plugType,
    plug_type: input.plugType,
    description: "Listed from profile — pin shown at NYC hub until you place the node on the map.",
    parking_instructions: "",
    charger_brand_slug: "other",
  });
  if (error) throw error;
}

export async function createInitialChargerForCurrentAuth(input: {
  title: string;
  plugType: ChargerType;
  pricePerKwh: number;
  lat?: number;
  lng?: number;
}): Promise<void> {
  if (!Number.isFinite(input.pricePerKwh) || input.pricePerKwh <= 0) {
    throw new Error("Price per kWh must be greater than zero.");
  }
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("You must be signed in to create a charger.");

  const { data: owner, error: ownerErr } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (ownerErr) throw ownerErr;
  if (!owner?.id) throw new Error("Profile not ready yet. Please try again.");

  await insertChargerForAuthOwner({
    ownerId: owner.id as string,
    title: input.title,
    plugType: input.plugType,
    pricePerKwh: input.pricePerKwh,
    lat: input.lat,
    lng: input.lng,
  });
}

export async function updateChargerListingFieldsForOwner(
  chargerId: string,
  ownerId: string,
  patch: {
    title?: string;
    plug_type?: string;
    label?: string;
    price_per_kwh?: number;
    status?: ChargerRow["status"];
  },
): Promise<void> {
  if (
    patch.price_per_kwh !== undefined &&
    (!Number.isFinite(patch.price_per_kwh) || patch.price_per_kwh <= 0)
  ) {
    throw new Error("Price per kWh must be greater than zero.");
  }
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("chargers")
    .update(patch)
    .eq("id", chargerId)
    .eq("owner_id", ownerId);
  if (error) throw error;
}

export async function completeGridParticipationOnboarding(
  role: UserRole,
  opts: { authUser: boolean; walletAddress?: string | null },
): Promise<void> {
  const at = new Date().toISOString();
  if (opts.authUser) {
    await updateAuthUserProfile({ role, onboarding_completed_at: at });
    return;
  }
  if (opts.walletAddress) {
    await updateWalletUserProfile(opts.walletAddress, {
      role,
      onboarding_completed_at: at,
    });
    return;
  }
  throw new Error("Sign in or connect a wallet to continue.");
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
