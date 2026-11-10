import { ProtectedWorkspace } from "@/components/protected-workspace";
import { ProjectDetail } from "@/components/project-detail";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ProtectedWorkspace next={`/projects/${id}`}>
      <ProjectDetail id={id} />
    </ProtectedWorkspace>
  );
}
