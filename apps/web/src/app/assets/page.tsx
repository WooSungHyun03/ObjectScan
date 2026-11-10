import { ProtectedWorkspace } from "@/components/protected-workspace";
import { AssetLibrary } from "@/components/asset-library";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ProtectedWorkspace next="/assets">
      <AssetLibrary />
    </ProtectedWorkspace>
  );
}
