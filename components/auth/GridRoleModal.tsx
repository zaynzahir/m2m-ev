"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { completeGridParticipationOnboarding } from "@/lib/supabase/client";
import type { UserProfileRow, UserRole } from "@/lib/types/database";

const OPTIONS: {
  role: UserRole;
  title: string;
  subtitle: string;
}[] = [
  {
    role: "driver",
    title: "Driver",
    subtitle: "I need to charge",
  },
  {
    role: "host",
    title: "Host",
    subtitle: "I have a charger",
  },
  {
    role: "both",
    title: "Both",
    subtitle: "Drive and host on the grid",
  },
];

type GridRoleModalProps = {
  profile: UserProfileRow;
  onCompleted: () => void;
};

export function GridRoleModal({ profile, onCompleted }: GridRoleModalProps) {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [selected, setSelected] = useState<UserRole>(profile.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await completeGridParticipationOnboarding(selected, {
        authUser: Boolean(user),
        walletAddress: publicKey?.toBase58() ?? null,
      });
      onCompleted();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save your choice.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grid-role-title"
    >
      <div className="relative w-full max-w-lg rounded-[1.5rem] border border-white/10 bg-[#000000] p-6 shadow-[0_0_80px_rgba(52,254,160,0.08)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#34fea0]/10 blur-3xl" />
        <p className="text-center text-xs font-headline font-bold uppercase tracking-[0.2em] text-[#34fea0]">
          Welcome to M2M
        </p>
        <h2
          id="grid-role-title"
          className="mt-2 text-center font-headline text-2xl font-extrabold text-on-surface sm:text-3xl"
        >
          How will you participate in the grid?
        </h2>
        <p className="mt-2 text-center text-sm text-on-surface-variant">
          Choose how you will use the network. You can change this later in
          Profile.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-1">
          {OPTIONS.map((opt) => {
            const active = selected === opt.role;
            return (
              <button
                key={opt.role}
                type="button"
                onClick={() => setSelected(opt.role)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-[#34fea0]/60 bg-[#34fea0]/[0.07] shadow-[0_0_24px_rgba(52,254,160,0.12)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <p className="font-headline text-lg font-bold text-on-surface">
                  {opt.title}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {opt.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-4 text-center text-sm text-error">{error}</p>
        ) : null}

        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave()}
          className="mt-8 w-full rounded-xl bg-[#34fea0] py-3.5 font-headline text-sm font-bold text-black shadow-[0_0_24px_rgba(52,254,160,0.25)] transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
