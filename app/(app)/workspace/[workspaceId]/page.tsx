import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceDetailPage({ params }: Props) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (!workspace) redirect("/workspace");

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  return (
    <AppShell
      workspace={workspace}
      notes={notes ?? []}
      folders={folders ?? []}
      user={{ id: user.id, email: user.email!, full_name: user.user_metadata?.full_name ?? null, avatar_url: user.user_metadata?.avatar_url ?? null }}
      activeNoteId={null}
    />
  );
}