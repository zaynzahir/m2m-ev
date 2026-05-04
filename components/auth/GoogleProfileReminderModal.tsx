"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useM2MProfile } from "@/hooks/useM2MProfile";
import { isLikelyFullName, parseContactMethod } from "@/lib/profile-contact";

export function GoogleProfileReminderModal() {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const { profile, loading } = useM2MProfile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !user || pathname.startsWith("/auth")) {
      setOpen(false);
      return;
    }
    const provider = (
      profile?.auth_provider ??
      user.app_metadata?.provider ??
      ""
    )
      .toString()
      .toLowerCase();
    if (provider !== "google") {
      setOpen(false);
      return;
    }

    const contact = parseContactMethod(profile?.contact_method ?? null);
    const missing =
      !profile?.display_name?.trim() ||
      !isLikelyFullName(profile.display_name) ||
      !contact.username.trim() ||
      !contact.phone.trim();

    const key = `m2m-google-profile-reminder:${user.id}`;
    if (!missing) {
      sessionStorage.removeItem(key);
      setOpen(false);
      return;
    }
    const alreadyDismissedInThisSession = sessionStorage.getItem(key) === "1";
    setOpen(!alreadyDismissedInThisSession);
  }, [loading, user, profile, pathname]);

  if (!open || !user) return null;

  const dismiss = () => {
    sessionStorage.setItem(`m2m-google-profile-reminder:${user.id}`, "1");
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050506] p-6 shadow-2xl">
        <h2 className="font-headline text-xl font-bold text-on-surface">
          Profile update reminder
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant">
          Your Google sign in is active. Please complete your profile details from
          Profile so hosts and drivers can coordinate sessions.
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            href="/profile"
            onClick={dismiss}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary-fixed"
          >
            Open Profile
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-on-surface-variant"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
