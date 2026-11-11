import { ProtectedWorkspace } from "@/components/protected-workspace";
import { ReconstructionWizard } from "@/components/reconstruction-wizard";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ProtectedWorkspace next="/create/scene">
      <ReconstructionWizard initialMode="scene" />
    </ProtectedWorkspace>
  );
}
