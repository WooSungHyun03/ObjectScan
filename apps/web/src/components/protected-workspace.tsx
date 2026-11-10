import { redirect } from "next/navigation";
import { currentUser, adminClient } from "@/lib/supabase/server";
import { WorkspaceShell } from "./workspace-shell";
export async function ProtectedWorkspace({
  children,
  next = "/dashboard",
}: {
  children: React.ReactNode;
  next?: string;
}) {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const { data } = await adminClient()
    .from("profiles")
    .select("display_name,role")
    .eq("id", user.id)
    .maybeSingle();
  return (
    <WorkspaceShell
      user={{ email: user.email, name: data?.display_name }}
      admin={data?.role === "admin"}
    >
      {children}
    </WorkspaceShell>
  );
}
