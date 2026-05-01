import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server auth is not configured." },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  if (!token) {
    return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await admin.auth.getUser(token);
  if (userErr || !user) {
    return NextResponse.json({ error: "Invalid auth token." }, { status: 401 });
  }

  const { data: profile, error: profileErr } = await admin
    .from("users")
    .select("id,wallet_address")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (profileErr) {
    return NextResponse.json(
      { error: "Could not load account profile." },
      { status: 500 },
    );
  }

  if (profile?.id) {
    const { error: locationsErr } = await admin
      .from("driver_locations")
      .delete()
      .eq("user_id", profile.id);
    if (locationsErr) {
      return NextResponse.json(
        { error: "Could not delete driver location rows." },
        { status: 500 },
      );
    }

    const { error: chargersErr } = await admin
      .from("chargers")
      .delete()
      .eq("owner_id", profile.id);
    if (chargersErr) {
      return NextResponse.json(
        { error: "Could not delete charger listings." },
        { status: 500 },
      );
    }

    const wallet = profile.wallet_address;
    if (wallet) {
      const { error: intentsByDriverErr } = await admin
        .from("charging_session_intents")
        .delete()
        .eq("driver_wallet", wallet);
      if (intentsByDriverErr) {
        return NextResponse.json(
          { error: "Could not delete charging session intents." },
          { status: 500 },
        );
      }
      const { error: intentsByHostErr } = await admin
        .from("charging_session_intents")
        .delete()
        .eq("host_wallet", wallet);
      if (intentsByHostErr) {
        return NextResponse.json(
          { error: "Could not delete host intents." },
          { status: 500 },
        );
      }
    }

    const { error: userRowErr } = await admin
      .from("users")
      .delete()
      .eq("auth_user_id", user.id);
    if (userRowErr) {
      return NextResponse.json(
        { error: "Could not delete profile row." },
        { status: 500 },
      );
    }
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
  if (deleteErr) {
    return NextResponse.json(
      { error: "Could not delete auth user." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
