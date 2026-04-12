"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ensureAuthProfileRow, getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing sign in…");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.getSession();
        await ensureAuthProfileRow();
        if (!cancelled) router.replace("/profile");
      } catch {
        if (!cancelled) {
          setMessage("Could not complete sign in. Try again from the sign in page.");
          router.replace("/auth/sign-in");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24">
      <p className="text-sm text-on-surface-variant" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
