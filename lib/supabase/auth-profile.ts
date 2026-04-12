import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserProfileRow } from "@/lib/types/database";

export async function fetchProfileForViewer(input: {
  authUserId?: string | null;
  walletAddress?: string | null;
}): Promise<UserProfileRow | null> {
  const supabase = getSupabaseBrowserClient();

  if (input.authUserId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", input.authUserId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as UserProfileRow;
  }

  if (input.walletAddress) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", input.walletAddress)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as UserProfileRow;
  }

  return null;
}
