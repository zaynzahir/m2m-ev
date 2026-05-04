// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: Json): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, {
      error:
        "Edge Function secret missing. Set SUPABASE_SERVICE_ROLE_KEY for delete-account.",
    });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  if (!token) return json(401, { error: "Missing auth token." });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await admin.auth.getUser(token);
  if (userErr || !user) return json(401, { error: "Invalid auth token." });

  const { data: profile, error: profileErr } = await admin
    .from("users")
    .select("id,wallet_address")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (profileErr) return json(500, { error: "Could not load account profile." });

  if (profile?.id) {
    const { error: locationsErr } = await admin
      .from("driver_locations")
      .delete()
      .eq("user_id", profile.id);
    if (locationsErr) return json(500, { error: "Could not delete driver location rows." });

    const { error: chargersErr } = await admin
      .from("chargers")
      .delete()
      .eq("owner_id", profile.id);
    if (chargersErr) return json(500, { error: "Could not delete charger listings." });

    const wallet = profile.wallet_address;
    if (wallet) {
      const { error: intentsByDriverErr } = await admin
        .from("charging_session_intents")
        .delete()
        .eq("driver_wallet", wallet);
      if (intentsByDriverErr) return json(500, { error: "Could not delete charging session intents." });

      const { error: intentsByHostErr } = await admin
        .from("charging_session_intents")
        .delete()
        .eq("host_wallet", wallet);
      if (intentsByHostErr) return json(500, { error: "Could not delete host intents." });
    }

    const { error: userRowErr } = await admin
      .from("users")
      .delete()
      .eq("auth_user_id", user.id);
    if (userRowErr) return json(500, { error: "Could not delete profile row." });
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
  if (deleteErr) return json(500, { error: "Could not delete auth user." });

  return json(200, { ok: true });
});
