import { redirect, notFound } from "next/navigation";
import { currentUser } from "@/lib/supabase/server";
import { ownerProject } from "@/lib/server/guards";
import { MeshEditor } from "@/components/editor/mesh-editor";
import { z } from "zod";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  if (!user)
    redirect(`/login?next=${encodeURIComponent(`/projects/${id}/edit`)}`);
  try {
    await ownerProject(z.uuid().parse(id), user.id);
  } catch {
    notFound();
  }
  return <MeshEditor projectId={id} />;
}
