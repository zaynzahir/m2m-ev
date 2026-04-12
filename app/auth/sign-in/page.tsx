import { Suspense } from "react";

import { MarketingShell } from "@/components/MarketingShell";

import { SignInClient } from "./SignInClient";

export default function SignInPage() {
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
          <SignInClient />
        </Suspense>
      </div>
    </MarketingShell>
  );
}
