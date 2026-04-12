import { Suspense } from "react";

import { MarketingShell } from "@/components/MarketingShell";

import { SignUpClient } from "./SignUpClient";

export default function SignUpPage() {
  return (
    <MarketingShell>
      <div className="px-4 pb-24 pt-28">
        <Suspense
          fallback={
            <div className="py-20 text-center text-sm text-on-surface-variant">
              Loading…
            </div>
          }
        >
          <SignUpClient />
        </Suspense>
      </div>
    </MarketingShell>
  );
}
