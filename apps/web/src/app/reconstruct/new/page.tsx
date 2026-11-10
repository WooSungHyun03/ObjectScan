import { ProtectedWorkspace } from "@/components/protected-workspace";
import { ReconstructionWizard } from "@/components/reconstruction-wizard";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; project?: string }>;
}) {
  const q = await searchParams,
    mode = q.mode === "scene" ? "scene" : "object";
  return (
    <ProtectedWorkspace
      next={`/reconstruct/new?mode=${mode}${q.project ? `&project=${encodeURIComponent(q.project)}` : ""}`}
    >
      <ReconstructionWizard
        key={`${mode}:${q.project ?? "new"}`}
        initialMode={mode}
        initialProject={q.project}
      />
    </ProtectedWorkspace>
  );
}
