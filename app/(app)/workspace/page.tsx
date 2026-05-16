import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateWorkspaceScreen } from "@/components/workspace/CreateWorkspaceScreen";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (workspaces && workspaces.length > 0) {
    redirect(`/workspace/${workspaces[0].id}`);
  }

  return <CreateWorkspaceScreen userId={user.id} />;
}