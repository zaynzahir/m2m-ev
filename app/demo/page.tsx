"use client";

import { useCallback, useEffect, useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  fetchChargingSessions,
  recordOracleChargeComplete,
  type ChargingChargerRow,
} from "@/lib/supabase/client";
import { hasSupabasePublicConfig } from "@/lib/env/public";

export default function DemoOraclePage() {
  const [rows, setRows] = useState<ChargingChargerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hasSupabasePublicConfig()) {
      setLoading(false);
      setLoadError("Supabase env vars are not configured.");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchChargingSessions();
      setRows(data);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 5000);
  };

  const onSimulateComplete = async (id: string) => {
    setBusyId(id);
    try {
      await recordOracleChargeComplete(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      showToast(
        "Oracle Triggered: Escrow Funds Released to Host Wallet on Devnet.",
      );
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Could not complete oracle session.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-24 px-8 max-w-5xl mx-auto min-h-[70vh]">
        <p className="text-sm uppercase tracking-widest text-secondary font-headline mb-3">
          Internal demo
        </p>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          M2M Hardware Simulation Oracle
        </h1>
        <p className="text-on-surface-variant text-sm mb-10 max-w-2xl">
          Active charging sessions (status &quot;charging&quot;). Use the button to
          simulate the physical charger finishing, write a{" "}
          <code className="text-primary text-xs">charging_sessions</code>{" "}
          receipt (0.01 SOL), and set the charger back to available.
        </p>

        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <p className="p-8 text-on-surface-variant text-sm">Loading…</p>
          ) : loadError ? (
            <p className="p-8 text-error text-sm">{loadError}</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-on-surface-variant text-sm">
              No active charging sessions. Start a session from the map with a
              connected Devnet wallet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-on-surface-variant font-headline uppercase tracking-wide text-xs">
                    <th className="px-6 py-4">Charger title</th>
                    <th className="px-6 py-4">Owner wallet</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-4 font-medium text-on-surface">
                        {r.title ?? "None"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-on-surface-variant max-w-[200px] truncate">
                        {r.owner_wallet ?? "None"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-bold">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void onSimulateComplete(r.id)}
                          disabled={busyId !== null}
                          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-on-secondary-container shadow-[0_0_18px_rgba(185,132,255,0.35)] transition hover:brightness-110 disabled:opacity-50"
                        >
                          {busyId === r.id ? (
                            "Working…"
                          ) : (
                            <>
                              Simulate Hardware: Charge Complete
                              <span className="material-symbols-outlined text-base">
                                smart_toy
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-[200] w-[min(100%,28rem)] -translate-x-1/2 px-4">
          <div className="glass-card border border-secondary/40 rounded-xl px-5 py-4 text-center text-sm font-medium text-on-surface shadow-[0_0_30px_rgba(185,132,255,0.25)]">
            {toast}
          </div>
        </div>
      ) : null}
    </>
  );
}
