"use client";

import { useSearchParams } from "next/navigation";

import { SignUpForm } from "@/components/auth/SignUpForm";

export function SignUpClient() {
  const sp = useSearchParams();
  const next = sp?.get("next") ?? "/profile";
  return <SignUpForm nextHref={next.startsWith("/") ? next : "/profile"} />;
}
