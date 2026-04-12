"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { AuthQrModal } from "@/components/dashboard/AuthQrModal";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { hasSupabasePublicConfig } from "@/lib/env/public";
import {
  fetchChargersOwnedByWallet,
  fetchLedgerSessionsForDriver,
  fetchLedgerSessionsForHost,
  sumDriverSpentSol,
  sumHostEarningsSol,
} from "@/lib/supabase/client";
import type {
  ChargerRow,
  ChargingSessionReceiptRow,
} from "@/lib/types/database";

function fmtSol(n: number) {
  return `${n.toFixed(4)} SOL`;
}

function fmtSessionId(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function displayChargerOperationalStatus(c: ChargerRow): string {
  if (c.status === "charging") return "Energized";
  if (c.active_driver_wallet) return "Pending Auth";
  return "Idle";
}

function formatOutput(c: ChargerRow): string {
  const p = c.plug_type?.trim();
  if (!p) return "Level 2 —";
  if (/level/i.test(p) || /v$/i.test(p)) return p;
  return `Level 2 ${p}`;
}

function ledgerStatusDisplay(raw: string): "Completed" | "Disputed" | string {
  const u = raw.toLowerCase();
  if (u.includes("dispute")) return "Disputed";
  if (u.includes("complete") || u === "settled" || u === "paid") return "Completed";
  return raw ? raw : "Completed";
}

function GradientPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-primary/35 via-secondary/15 to-secondary/30 p-[1px] shadow-[0_0_40px_rgba(52,254,160,0.06)] ${className}`}
    >
      <div className="h-full rounded-[15px] bg-[#050506]">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const address = publicKey?.toBase58() ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [owned, setOwned] = useState<ChargerRow[]>([]);
  const [hostSessions, setHostSessions] = useState<ChargingSessionReceiptRow[]>(
    [],
  );
  const [driverSessions, setDriverSessions] = useState<
    ChargingSessionReceiptRow[]
  >([]);
  const [totalHost, setTotalHost] = useState(0);
  const [totalDriver, setTotalDriver] = useState(0);

  const [qrModal, setQrModal] = useState<{ id: string; title: string } | null>(
    null,
  );

  const closeQrModal = useCallback(() => setQrModal(null), []);

  const load = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }
    if (!hasSupabasePublicConfig()) {
      setError("Unable to load node data. Configuration is incomplete.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const chargers = await fetchChargersOwnedByWallet(address);
      setOwned(chargers);
      const host = chargers.length > 0;
      setIsHost(host);

      if (host) {
        const [sum, sessions] = await Promise.all([
          sumHostEarningsSol(address),
          fetchLedgerSessionsForHost(address),
        ]);
        setTotalHost(sum);
        setHostSessions(sessions);
        setTotalDriver(0);
        setDriverSessions([]);
      } else {
        const [sum, sessions] = await Promise.all([
          sumDriverSpentSol(address),
          fetchLedgerSessionsForDriver(address),
        ]);
        setTotalDriver(sum);
        setDriverSessions(sessions);
        setTotalHost(0);
        setHostSessions([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (connected && address) {
      void load();
    } else {
      setLoading(false);
      setOwned([]);
      setIsHost(false);
      setHostSessions([]);
      setDriverSessions([]);
      setTotalHost(0);
      setTotalDriver(0);
      setError(null);
    }
  }, [connected, address, load]);

  const sessions = isHost ? hostSessions : driverSessions;
  const roleLabel = isHost ? "Host" : "Driver";

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-[#020203] pb-28 pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <header className="mb-10 border-b border-white/[0.07] pb-10 md:mb-12">
            <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
              M2M Network
            </p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
              Node Command Center
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-on-surface-variant sm:text-base">
              Real-time node telemetry, escrow settlements, and cryptographic
              session history.
            </p>
          </header>

          {!connected ? (
            <GradientPanel>
              <div className="space-y-6 px-8 py-12 text-center md:px-12">
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Connect your Solana wallet to access node metrics, charger
                  controls, and settlement history.
                </p>
                <div className="flex justify-center">
                  <WalletConnectButton variant="primary" />
                </div>
              </div>
            </GradientPanel>
          ) : loading ? (
            <p className="text-sm text-on-surface-variant">Loading node data…</p>
          ) : error ? (
            <GradientPanel>
              <p className="px-8 py-10 text-center text-sm text-error">
                {error}
              </p>
            </GradientPanel>
          ) : (
            <div className="space-y-12 md:space-y-14">
              <section>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                  <GradientPanel>
                    <div className="px-6 py-7 md:px-7 md:py-8">
                      <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        {isHost
                          ? "Total settled earnings"
                          : "Total session spend"}
                      </p>
                      <p className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-primary md:text-[1.75rem]">
                        {fmtSol(isHost ? totalHost : totalDriver)}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                        {isHost
                          ? "Accumulated revenue from verified sessions"
                          : "Accumulated SOL across verified sessions as driver"}
                      </p>
                    </div>
                  </GradientPanel>
                  <GradientPanel>
                    <div className="px-6 py-7 md:px-7 md:py-8">
                      <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Total energy dispensed
                      </p>
                      <p className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-primary md:text-[1.75rem]">
                        0.00 kWh
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                        Validated by Dual-Verification Oracle
                      </p>
                    </div>
                  </GradientPanel>
                  <GradientPanel>
                    <div className="px-6 py-7 md:px-7 md:py-8">
                      <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Active escrow locks
                      </p>
                      <p className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-primary md:text-[1.75rem]">
                        {fmtSol(0)}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                        Funds currently secured in smart contracts
                      </p>
                    </div>
                  </GradientPanel>
                </div>
              </section>

              {isHost ? (
                <section>
                  <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">
                      Your active chargers
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Proof of Presence QR authorizes each session
                    </p>
                  </div>
                  <GradientPanel>
                    {owned.length === 0 ? (
                      <p className="px-6 py-10 text-sm text-on-surface-variant md:px-8">
                        No chargers registered to this wallet. Add a node from the
                        host flow to appear here.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/[0.08] text-on-surface-variant">
                              <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em] md:px-8">
                                Node ID / title
                              </th>
                              <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em]">
                                Output
                              </th>
                              <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em]">
                                Rate
                              </th>
                              <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em]">
                                Status
                              </th>
                              <th className="px-6 py-4 text-right font-headline text-[10px] font-bold uppercase tracking-[0.15em] md:px-8">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {owned.map((c) => {
                              const title =
                                c.title ?? c.label ?? "Untitled node";
                              return (
                                <tr
                                  key={c.id}
                                  className="border-b border-white/[0.05] last:border-0"
                                >
                                  <td className="px-6 py-4 font-medium text-on-surface md:px-8">
                                    {title}
                                  </td>
                                  <td className="px-6 py-4 text-on-surface-variant">
                                    {formatOutput(c)}
                                  </td>
                                  <td className="px-6 py-4 tabular-nums text-on-surface">
                                    ${Number(c.price_per_kwh).toFixed(2)} / kWh
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-headline text-[11px] font-bold tabular-nums text-secondary/95">
                                      {displayChargerOperationalStatus(c)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right md:px-8">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setQrModal({
                                          id: c.id,
                                          title,
                                        })
                                      }
                                      className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 font-headline text-xs font-bold text-on-primary-fixed shadow-[0_0_22px_rgba(52,254,160,0.35)] transition-all hover:brightness-110 sm:text-[13px]"
                                    >
                                      Show Auth QR
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </GradientPanel>
                </section>
              ) : null}

              <section>
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">
                    Recent charging sessions
                  </h2>
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary/90">
                    Ledger · on-chain settlement trail
                  </p>
                </div>
                <GradientPanel>
                  {sessions.length === 0 ? (
                    <p className="px-6 py-12 text-center text-sm leading-relaxed text-on-surface-variant md:px-10">
                      No recent settlements. Completed sessions will appear here
                      upon Dual-Verification Oracle reconciliation and on-chain
                      finality.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-on-surface-variant">
                            <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em] md:px-8">
                              Session ID
                            </th>
                            <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em]">
                              Role
                            </th>
                            <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em]">
                              Energy (kWh)
                            </th>
                            <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em]">
                              Duration
                            </th>
                            <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em]">
                              Settlement (SOL)
                            </th>
                            <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em] md:px-8">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((s) => (
                            <tr
                              key={s.id}
                              className="border-b border-white/[0.05] last:border-0"
                            >
                              <td className="px-6 py-4 font-mono text-xs text-primary/90 md:px-8">
                                {fmtSessionId(s.id)}
                              </td>
                              <td className="px-6 py-4 font-headline text-xs font-semibold text-on-surface">
                                {roleLabel}
                              </td>
                              <td className="px-6 py-4 tabular-nums text-on-surface-variant">
                                —
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                                —
                              </td>
                              <td className="px-6 py-4 font-mono text-xs font-bold text-primary">
                                {fmtSol(s.amount_sol)}
                              </td>
                              <td className="px-6 py-4 md:px-8">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-0.5 font-headline text-[11px] font-bold ${
                                    ledgerStatusDisplay(s.status) ===
                                    "Disputed"
                                      ? "border-error/40 bg-error/10 text-error"
                                      : "border-primary/20 bg-primary/10 text-primary"
                                  }`}
                                >
                                  {ledgerStatusDisplay(s.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </GradientPanel>
                {sessions.length > 0 ? (
                  <p className="mt-4 text-[11px] leading-relaxed text-on-surface-variant">
                    Energy and duration columns populate when oracle telemetry is
                    bound to each receipt record.
                  </p>
                ) : null}
              </section>
            </div>
          )}
        </div>
      </main>

      <AuthQrModal
        open={qrModal !== null}
        nodeTitle={qrModal?.title ?? ""}
        onClose={closeQrModal}
      />

      <Footer />
    </>
  );
}
