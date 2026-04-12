import { MarketingShell } from "@/components/MarketingShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <MarketingShell>
      <div className="px-4 pb-24 pt-28">
        <ForgotPasswordForm />
      </div>
    </MarketingShell>
  );
}
