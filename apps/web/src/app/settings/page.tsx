import { ProtectedWorkspace } from "@/components/protected-workspace";
import { SettingsPanel } from "@/components/account-panels";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ProtectedWorkspace next="/settings">
      <SettingsPanel />
    </ProtectedWorkspace>
  );
}
