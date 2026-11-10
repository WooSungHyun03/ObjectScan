import { ProtectedWorkspace } from "@/components/protected-workspace";
import { BillingPanel } from "@/components/account-panels";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ProtectedWorkspace next="/billing">
      <BillingPanel />
    </ProtectedWorkspace>
  );
}
