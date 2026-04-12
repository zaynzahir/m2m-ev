"use client";

import { useSearchParams } from "next/navigation";

import { SignInForm } from "@/components/auth/SignInForm";

export function SignInClient() {
  const sp = useSearchParams();
  const next = sp?.get("next") ?? "/profile";
  return <SignInForm nextHref={next.startsWith("/") ? next : "/profile"} />;
}
