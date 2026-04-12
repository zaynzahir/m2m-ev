import { MarketingShell } from "@/components/MarketingShell";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <MarketingShell>
      <div className="px-4 pb-24 pt-28">
        <UpdatePasswordForm />
      </div>
    </MarketingShell>
  );
}
