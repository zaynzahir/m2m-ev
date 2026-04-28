import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getM2MTokenMint, toTokenBaseUnits } from "@/lib/payments/token-config";

type ChargingSessionRow = {
  id: string;
  host_wallet: string;
  created_at: string;
};

type RewardBucket = {
  hostWallet: string;
  sessionCount: number;
  share: number;
  amountUi: number;
  amountBaseUnits: bigint;
};

export const runtime = "nodejs";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAILY_REWARD_POOL_UI = 250;

function parseOracleKeypair(raw: string): Keypair {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("ORACLE_KEYPAIR_JSON must be a JSON array of bytes.");
    }
    return Keypair.fromSecretKey(Uint8Array.from(parsed));
  } catch (error) {
    throw new Error(
      `Invalid ORACLE_KEYPAIR_JSON. ${
        error instanceof Error ? error.message : ""
      }`.trim(),
    );
  }
}

function requireBearerCronSecret(req: Request): string | null {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return "Missing CRON_SECRET env.";

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : req.headers.get("x-cron-secret")?.trim();

  if (!token || token !== expected) return "Unauthorized.";
  return null;
}

function computeBuckets(
  sessions: ChargingSessionRow[],
  mintDecimals: number,
  poolAmountUi: number,
): RewardBucket[] {
  const byHost = new Map<string, number>();

  for (const session of sessions) {
    const host = session.host_wallet?.trim();
    if (!host) continue;
    byHost.set(host, (byHost.get(host) ?? 0) + 1);
  }

  const totalSessions = Array.from(byHost.values()).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (totalSessions === 0) return [];

  const buckets: RewardBucket[] = [];
  for (const [hostWallet, sessionCount] of byHost.entries()) {
    const share = sessionCount / totalSessions;
    const amountUi = poolAmountUi * share;
    const amountBaseUnits = toTokenBaseUnits(amountUi, mintDecimals);

    if (amountBaseUnits <= BigInt(0)) continue;

    buckets.push({
      hostWallet,
      sessionCount,
      share,
      amountUi,
      amountBaseUnits,
    });
  }

  return buckets.sort((a, b) => b.sessionCount - a.sessionCount);
}

export async function POST(req: Request) {
  try {
    const authError = requireBearerCronSecret(req);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const rpcUrl = process.env.SOLANA_RPC_URL?.trim();
    const oracleKeypairRaw = process.env.ORACLE_KEYPAIR_JSON?.trim();

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase service-role configuration." },
        { status: 500 },
      );
    }

    if (!rpcUrl || !oracleKeypairRaw) {
      return NextResponse.json(
        { error: "Missing SOLANA_RPC_URL or ORACLE_KEYPAIR_JSON." },
        { status: 500 },
      );
    }

    const poolAmountUi = Number(
      process.env.M2M_DAILY_REWARD_POOL_UI ?? DEFAULT_DAILY_REWARD_POOL_UI,
    );
    if (!Number.isFinite(poolAmountUi) || poolAmountUi <= 0) {
      return NextResponse.json(
        { error: "M2M_DAILY_REWARD_POOL_UI must be a positive number." },
        { status: 500 },
      );
    }

    const now = Date.now();
    const sinceIso = new Date(now - ONE_DAY_MS).toISOString();

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: sessions, error: sessionsError } = await supabase
      .from("charging_sessions")
      .select("id,host_wallet,created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true });

    if (sessionsError) {
      return NextResponse.json(
        { error: `Failed to read sessions: ${sessionsError.message}` },
        { status: 500 },
      );
    }

    const connection = new Connection(rpcUrl, "confirmed");
    const treasurySigner = parseOracleKeypair(oracleKeypairRaw);
    const m2mMint = getM2MTokenMint();
    const mintInfo = await getMint(connection, m2mMint, "confirmed");

    const buckets = computeBuckets(
      (sessions ?? []) as ChargingSessionRow[],
      mintInfo.decimals,
      poolAmountUi,
    );

    if (buckets.length === 0) {
      return NextResponse.json({
        ok: true,
        since: sinceIso,
        totalSessions: (sessions ?? []).length,
        rewardedHosts: 0,
        transfers: [],
        note: "No eligible sessions in last 24h.",
      });
    }

    const treasuryAta = await getAssociatedTokenAddress(
      m2mMint,
      treasurySigner.publicKey,
      false,
    );

    const treasuryAccount = await getAccount(connection, treasuryAta, "confirmed");

    const dryRunHeader = req.headers.get("x-dry-run")?.toLowerCase() === "true";
    const url = new URL(req.url);
    const dryRunQuery = url.searchParams.get("dryRun") === "1";
    const dryRun = dryRunHeader || dryRunQuery;

    const transfers: Array<{
      hostWallet: string;
      sessionCount: number;
      share: number;
      amountUi: number;
      amountBaseUnits: string;
      signature: string | null;
      skipped: boolean;
      reason?: string;
    }> = [];

    let totalDistributed = BigInt(0);

    for (const bucket of buckets) {
      totalDistributed += bucket.amountBaseUnits;
      if (totalDistributed > treasuryAccount.amount) {
        transfers.push({
          hostWallet: bucket.hostWallet,
          sessionCount: bucket.sessionCount,
          share: bucket.share,
          amountUi: bucket.amountUi,
          amountBaseUnits: bucket.amountBaseUnits.toString(),
          signature: null,
          skipped: true,
          reason: "Insufficient treasury token balance.",
        });
        continue;
      }

      let hostOwner: PublicKey;
      try {
        hostOwner = new PublicKey(bucket.hostWallet);
      } catch {
        transfers.push({
          hostWallet: bucket.hostWallet,
          sessionCount: bucket.sessionCount,
          share: bucket.share,
          amountUi: bucket.amountUi,
          amountBaseUnits: bucket.amountBaseUnits.toString(),
          signature: null,
          skipped: true,
          reason: "Invalid host wallet address.",
        });
        continue;
      }

      const hostAta = await getAssociatedTokenAddress(m2mMint, hostOwner, false);

      const tx = new Transaction();
      const hostAtaAccount = await connection.getAccountInfo(hostAta, "confirmed");
      if (!hostAtaAccount) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            treasurySigner.publicKey,
            hostAta,
            hostOwner,
            m2mMint,
          ),
        );
      }

      tx.add(
        createTransferInstruction(
          treasuryAta,
          hostAta,
          treasurySigner.publicKey,
          bucket.amountBaseUnits,
        ),
      );

      if (dryRun) {
        transfers.push({
          hostWallet: bucket.hostWallet,
          sessionCount: bucket.sessionCount,
          share: bucket.share,
          amountUi: bucket.amountUi,
          amountBaseUnits: bucket.amountBaseUnits.toString(),
          signature: null,
          skipped: false,
        });
        continue;
      }

      const signature = await sendAndConfirmTransaction(
        connection,
        tx,
        [treasurySigner],
        {
          commitment: "confirmed",
        },
      );

      transfers.push({
        hostWallet: bucket.hostWallet,
        sessionCount: bucket.sessionCount,
        share: bucket.share,
        amountUi: bucket.amountUi,
        amountBaseUnits: bucket.amountBaseUnits.toString(),
        signature,
        skipped: false,
      });
    }

    return NextResponse.json({
      ok: true,
      dryRun,
      since: sinceIso,
      totalSessions: (sessions ?? []).length,
      rewardedHosts: buckets.length,
      mint: m2mMint.toBase58(),
      treasury: treasurySigner.publicKey.toBase58(),
      dailyPoolUi: poolAmountUi,
      transfers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Epoch rewards job failed.",
      },
      { status: 500 },
    );
  }
}
