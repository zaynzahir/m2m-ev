export type UserRole = "driver" | "host" | "both";

export type ChargerStatus =
  | "active"
  | "inactive"
  | "offline"
  | "charging"
  | "available";

export type UserProfileRow = {
  id: string;
  wallet_address: string | null;
  auth_user_id: string | null;
  role: UserRole;
  display_name: string | null;
  vehicle_model: string | null;
  contact_method: string | null;
  email: string | null;
  /** e.g. email, google, apple; wallet-only profiles may use `wallet`. */
  auth_provider: string | null;
  /** ISO timestamp when email was confirmed (mirrors Supabase Auth). */
  email_verified_at: string | null;
  /** Set after the grid participation (Driver / Host / Both) modal is completed. */
  onboarding_completed_at?: string | null;
  created_at: string;
};

export type ChargerRow = {
  id: string;
  owner_id: string | null;
  lat: number;
  lng: number;
  price_per_kwh: number;
  status: ChargerStatus;
  label: string | null;
  description: string | null;
  title: string | null;
  plug_type: string | null;
  parking_instructions: string | null;
  active_driver_wallet: string | null;
  charger_brand_slug: string | null;
  created_at: string;
};

/** Live driver position for map (see `migration_phase13_driver_locations.sql`). */
export type DriverLocationRow = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  accuracy_m: number | null;
  updated_at: string;
};

export type ChargingSessionReceiptRow = {
  id: string;
  charger_id: string | null;
  driver_wallet: string;
  host_wallet: string;
  amount_sol: number;
  status: string;
  created_at: string;
};

/** Row for /demo oracle table: one active charging listing. */
export type ChargingChargerRow = {
  id: string;
  title: string | null;
  owner_wallet: string | null;
  status: ChargerStatus;
};
