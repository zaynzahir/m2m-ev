"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthQrModal } from "@/components/dashboard/AuthQrModal";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { toSafeToastError } from "@/lib/client-facing-error";
import { hasSupabasePublicConfig } from "@/lib/env/public";
import {
  fetchDashboardIdentity,
  fetchDriverDashboardMetrics,
  fetchHostDashboardMetrics,
} from "@/lib/supabase/client";
import type {
  ChargerRow,
  ChargingSessionReceiptRow,
  UserRole,
} from "@/lib/types/database";

function fmtSol(n: number) {
  return `${n.toFixed(4)} SOL`;
}

function fmtSessionId(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "None yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "None yet";
  return d.toLocaleString();
}

function shortWallet(address: string | null) {
  if (!address) return "Not connected";
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

function toSafeDashboardError(e: unknown): string {
  return toSafeToastError(e, "Failed to load dashboard. Please refresh once.");
}

function displayChargerOperationalStatus(c: ChargerRow): string {
  if (c.status === "charging") return "Energized";
  if (c.active_driver_wallet) return "Pending Auth";
  return "Idle";
}

function formatOutput(c: ChargerRow): string {
  const p = c.plug_type?.trim();
  if (!p) return "Level 2 (type TBD)";
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

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <GradientPanel>
      <div className="px-6 py-7 md:px-7 md:py-8">
        <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          {label}
        </p>
        <p className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-primary md:text-[1.75rem]">
          {value}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{subtitle}</p>
      </div>
    </GradientPanel>
  );
}

function ComingSoonCard({ title, detail }: { title: string; detail: string }) {
  return (
    <GradientPanel>
      <div className="px-6 py-7 md:px-7 md:py-8">
        <div className="flex items-center justify-between gap-3">
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            {title}
          </p>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
            Coming soon
          </span>
        </div>
        <p className="mt-3 font-headline text-xl font-extrabold tracking-tight text-on-surface-variant">
          Coming
        </p>
        <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{detail}</p>
      </div>
    </GradientPanel>
  );
}

function SessionTable({
  sessions,
  roleLabel,
  emptyText,
}: {
  sessions: ChargingSessionReceiptRow[];
  roleLabel: string;
  emptyText: string;
}) {
  return (
    <GradientPanel>
      {sessions.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm leading-relaxed text-on-surface-variant md:px-10">
          {emptyText}
        </p>
      ) : (
        <>
          <div className="space-y-3 p-4 md:hidden">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs text-primary/90">{fmtSessionId(s.id)}</p>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 font-headline text-[10px] font-bold ${
                      ledgerStatusDisplay(s.status) === "Disputed"
                        ? "border-error/40 bg-error/10 text-error"
                        : "border-primary/20 bg-primary/10 text-primary"
                    }`}
                  >
                    {ledgerStatusDisplay(s.status)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {roleLabel}, settlement{" "}
                  <span className="font-mono font-bold text-primary">{fmtSol(s.amount_sol)}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
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
                <tr key={s.id} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-6 py-4 font-mono text-xs text-primary/90 md:px-8">
                    {fmtSessionId(s.id)}
                  </td>
                  <td className="px-6 py-4 font-headline text-xs font-semibold text-on-surface">
                    {roleLabel}
                  </td>
                  <td className="px-6 py-4 tabular-nums text-on-surface-variant">Not yet</td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">Not yet</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary">
                    {fmtSol(s.amount_sol)}
                  </td>
                  <td className="px-6 py-4 md:px-8">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 font-headline text-[11px] font-bold ${
                        ledgerStatusDisplay(s.status) === "Disputed"
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
        </>
      )}
    </GradientPanel>
  );
}

export default function DashboardPage() {
  const { session } = useAuth();
  const { connected, publicKey } = useWallet();
  const address = publicKey?.toBase58() ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("driver");
  const [walletDisplay, setWalletDisplay] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [hostChargers, setHostChargers] = useState<ChargerRow[]>([]);
  const [hostSessions, setHostSessions] = useState<ChargingSessionReceiptRow[]>([]);
  const [driverSessions, setDriverSessions] = useState<ChargingSessionReceiptRow[]>([]);
  const [totalHost, setTotalHost] = useState(0);
  const [totalDriver, setTotalDriver] = useState(0);
  const [hostSessionCount, setHostSessionCount] = useState(0);
  const [driverSessionCount, setDriverSessionCount] = useState(0);
  const [hostLastSessionAt, setHostLastSessionAt] = useState<string | null>(null);
  const [driverLastSessionAt, setDriverLastSessionAt] = useState<string | null>(null);
  const [activeListingsCount, setActiveListingsCount] = useState(0);

  const [qrModal, setQrModal] = useState<{ id: string; title: string } | null>(null);

  const closeQrModal = useCallback(() => setQrModal(null), []);

  const load = useCallback(async () => {
    if (!session?.user && !address) {
      setLoading(false);
      return;
    }
    if (!hasSupabasePublicConfig()) {
      setError("Unable to load dashboard data. Configuration is incomplete.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const identity = await fetchDashboardIdentity(address);
      const effectiveWallet = identity.walletAddress ?? address;
      setRole(identity.resolvedRole);
      setWalletDisplay(effectiveWallet);
      setEmailVerified(identity.emailVerified);
      setHasProfile(Boolean(identity.profile));

      if (!effectiveWallet) {
        setHostChargers([]);
        setHostSessions([]);
        setDriverSessions([]);
        setTotalHost(0);
        setTotalDriver(0);
        setHostSessionCount(0);
        setDriverSessionCount(0);
        setHostLastSessionAt(null);
        setDriverLastSessionAt(null);
        setActiveListingsCount(0);
        return;
      }

      if (identity.resolvedRole === "host") {
        const host = await fetchHostDashboardMetrics(effectiveWallet);
        setHostChargers(host.ownedChargers);
        setHostSessions(host.recentSessions);
        setTotalHost(host.totalEarnedSol);
        setHostSessionCount(host.completedSessions);
        setHostLastSessionAt(host.lastSessionAt);
        setActiveListingsCount(host.activeListings);

        setDriverSessions([]);
        setTotalDriver(0);
        setDriverSessionCount(0);
        setDriverLastSessionAt(null);
        return;
      }

      if (identity.resolvedRole === "both") {
        const [host, driver] = await Promise.all([
          fetchHostDashboardMetrics(effectiveWallet),
          fetchDriverDashboardMetrics(effectiveWallet),
        ]);

        setHostChargers(host.ownedChargers);
        setHostSessions(host.recentSessions);
        setTotalHost(host.totalEarnedSol);
        setHostSessionCount(host.completedSessions);
        setHostLastSessionAt(host.lastSessionAt);
        setActiveListingsCount(host.activeListings);

        setDriverSessions(driver.recentSessions);
        setTotalDriver(driver.totalSpentSol);
        setDriverSessionCount(driver.completedSessions);
        setDriverLastSessionAt(driver.lastSessionAt);
        return;
      }

      const driver = await fetchDriverDashboardMetrics(effectiveWallet);
      setDriverSessions(driver.recentSessions);
      setTotalDriver(driver.totalSpentSol);
      setDriverSessionCount(driver.completedSessions);
      setDriverLastSessionAt(driver.lastSessionAt);

      setHostChargers([]);
      setHostSessions([]);
      setTotalHost(0);
      setHostSessionCount(0);
      setHostLastSessionAt(null);
      setActiveListingsCount(0);
    } catch (e) {
      setError(toSafeDashboardError(e));
    } finally {
      setLoading(false);
    }
  }, [address, session?.user]);

  useEffect(() => {
    if (session?.user || address) {
      void load();
    } else {
      setLoading(false);
      setError(null);
      setHasProfile(false);
      setRole("driver");
      setWalletDisplay(address);
      setEmailVerified(false);
      setHostChargers([]);
      setHostSessions([]);
      setDriverSessions([]);
      setTotalHost(0);
      setTotalDriver(0);
      setHostSessionCount(0);
      setDriverSessionCount(0);
      setHostLastSessionAt(null);
      setDriverLastSessionAt(null);
      setActiveListingsCount(0);
    }
  }, [session?.user, address, load]);

  const showDriver = role === "driver" || role === "both";
  const showHost = role === "host" || role === "both";

  const identitySubtitle = useMemo(() => {
    if (role === "both") return "Driver and host view";
    if (role === "host") return "Host view";
    return "Driver view";
  }, [role]);

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-[#020203] pb-24 pt-24 sm:pb-28 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <header className="mb-8 border-b border-white/[0.07] pb-8 md:mb-12 md:pb-10">
            <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
              M2M Network
            </p>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl md:text-4xl">
              Node Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant sm:mt-4 sm:text-base">
              Role aware views of settlement metrics and your M2M activity. Telemetry from OEM and charger APIs will surface here as integrations go live.
            </p>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-on-surface-variant sm:text-sm">
              Support:{" "}
              <a
                href="mailto:info@m2m.energy"
                className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
              >
                info@m2m.energy
              </a>
            </p>
          </header>

          {loading ? (
            <p className="text-sm text-on-surface-variant">Loading dashboard data…</p>
          ) : error ? (
            <GradientPanel>
              <p className="px-8 py-10 text-center text-sm text-error">{error}</p>
            </GradientPanel>
          ) : (
            <div className="space-y-12 md:space-y-14">
              {!connected ? (
                <GradientPanel>
                  <div className="space-y-4 px-6 py-6 md:px-8">
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      Dashboard is available without wallet connection. Connect wallet when you want to start paid sessions and on chain settlement.
                    </p>
                    <div className="flex justify-start">
                      <WalletConnectButton variant="primary" />
                    </div>
                  </div>
                </GradientPanel>
              ) : null}
              <GradientPanel>
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 md:px-8">
                  <div>
                    <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                      Active identity
                    </p>
                    <p className="mt-2 font-headline text-xl font-bold text-on-surface">
                      {identitySubtitle}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Wallet: <span className="font-mono text-on-surface">{shortWallet(walletDisplay)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-surface">
                      Role {role}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        emailVerified
                          ? "bg-primary/20 text-primary"
                          : "bg-white/10 text-on-surface-variant"
                      }`}
                    >
                      {emailVerified ? "Email verified" : "Email unverified"}
                    </span>
                  </div>
                </div>
              </GradientPanel>

              {!hasProfile ? (
                <GradientPanel>
                  <div className="space-y-4 px-8 py-10 text-center">
                    <p className="text-sm text-on-surface-variant">
                      Your dashboard profile is not fully initialized yet.
                    </p>
                    <Link
                      href="/profile"
                      className="inline-flex rounded-xl bg-primary px-4 py-2.5 font-headline text-sm font-bold text-on-primary-fixed"
                    >
                      Complete profile
                    </Link>
                  </div>
                </GradientPanel>
              ) : null}

              <section>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                  {showDriver ? (
                    <MetricCard
                      label="Driver total spend"
                      value={fmtSol(totalDriver)}
                      subtitle={`Completed sessions: ${driverSessionCount}`}
                    />
                  ) : (
                    <ComingSoonCard
                      title="Driver spend"
                      detail="Appears when driver role is enabled for your account."
                    />
                  )}

                  {showHost ? (
                    <MetricCard
                      label="Host settled earnings"
                      value={fmtSol(totalHost)}
                      subtitle={`Active listings: ${activeListingsCount}`}
                    />
                  ) : (
                    <ComingSoonCard
                      title="Host earnings"
                      detail="Appears when host role is enabled for your account."
                    />
                  )}

                  <MetricCard
                    label="Last completed session"
                    value={fmtDate(showHost && !showDriver ? hostLastSessionAt : driverLastSessionAt)}
                    subtitle="Most recent settlement timestamp"
                  />
                </div>
              </section>

              <section>
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">
                    Upcoming metrics
                  </h2>
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                    Real data first roadmap
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                  <ComingSoonCard
                    title="Energy dispensed"
                    detail="kWh telemetry surfaces when oracle linked energy reports are attached to sessions."
                  />
                  <ComingSoonCard
                    title="Active escrow locks"
                    detail="Live lock state will be shown once escrow lifecycle events are indexed per wallet."
                  />
                  <ComingSoonCard
                    title="Utilization curve"
                    detail="Host utilization trend and peak windows will be introduced in a later dashboard phase."
                  />
                </div>
              </section>

              {showHost ? (
                <section>
                  <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">
                      Host operations
                    </h2>
                    <p className="text-xs text-on-surface-variant">Proof of Presence QR authorizes each session</p>
                  </div>
                  <GradientPanel>
                    {hostChargers.length === 0 ? (
                      <p className="px-6 py-10 text-sm text-on-surface-variant md:px-8">
                        No host chargers yet. Add a charger from Profile to activate host operations.
                      </p>
                    ) : (
                      <>
                        <div className="space-y-3 p-4 md:hidden">
                          {hostChargers.map((c) => {
                            const title = c.title ?? c.label ?? "Untitled node";
                            return (
                              <div
                                key={c.id}
                                className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                              >
                                <p className="font-headline text-sm font-bold text-on-surface">{title}</p>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                  {formatOutput(c)}, ${Number(c.price_per_kwh).toFixed(2)} per kWh
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-headline text-[10px] font-bold text-secondary/95">
                                    {displayChargerOperationalStatus(c)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQrModal({
                                        id: c.id,
                                        title,
                                      })
                                    }
                                    className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 font-headline text-[11px] font-bold text-on-primary-fixed shadow-[0_0_18px_rgba(52,254,160,0.3)]"
                                  >
                                    Show Auth QR
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="hidden overflow-x-auto md:block">
                          <table className="w-full min-w-[720px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/[0.08] text-on-surface-variant">
                              <th className="px-6 py-4 font-headline text-[10px] font-bold uppercase tracking-[0.15em] md:px-8">
                                Node title
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
                            {hostChargers.map((c) => {
                              const title = c.title ?? c.label ?? "Untitled node";
                              return (
                                <tr key={c.id} className="border-b border-white/[0.05] last:border-0">
                                  <td className="px-6 py-4 font-medium text-on-surface md:px-8">{title}</td>
                                  <td className="px-6 py-4 text-on-surface-variant">{formatOutput(c)}</td>
                                  <td className="px-6 py-4 tabular-nums text-on-surface">
                                    ${Number(c.price_per_kwh).toFixed(2)} per kWh
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-headline text-[11px] font-bold text-secondary/95">
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
                      </>
                    )}
                  </GradientPanel>
                </section>
              ) : null}

              {showDriver ? (
                <section>
                  <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">
                      Driver sessions
                    </h2>
                    <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary/90">
                      Ledger spending trail
                    </p>
                  </div>
                  <SessionTable
                    sessions={driverSessions}
                    roleLabel="Driver"
                    emptyText="No driver settlements yet. Completed charging sessions will appear here after reconciliation."
                  />
                </section>
              ) : null}

              {showHost ? (
                <section>
                  <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">
                      Host sessions
                    </h2>
                    <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary/90">
                      Ledger earnings trail
                    </p>
                  </div>
                  <SessionTable
                    sessions={hostSessions}
                    roleLabel="Host"
                    emptyText="No hosted settlements yet. Completed hosted sessions will appear here after reconciliation."
                  />
                </section>
              ) : null}
            </div>
          )}
        </div>
      </main>

      <AuthQrModal
        open={qrModal !== null}
        chargerId={qrModal?.id ?? ""}
        nodeTitle={qrModal?.title ?? ""}
        onClose={closeQrModal}
      />

      <Footer />
    </>
  );
}
