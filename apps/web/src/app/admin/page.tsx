import { ProtectedWorkspace } from "@/components/protected-workspace";
import { AdminPanel } from "@/components/admin-panel";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ProtectedWorkspace next="/admin">
      <AdminPanel />
    </ProtectedWorkspace>
  );
}
