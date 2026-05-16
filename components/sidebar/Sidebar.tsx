"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/store/workspace";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FilePlus,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Settings,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { Workspace, Note, Folder, AppUser } from "@/lib/types/app.types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";

interface Props {
  workspace: Workspace;
  notes: Note[];
  folders: Folder[];
  user: AppUser;
  activeNoteId: string | null;
}

export function Sidebar({ workspace, notes, folders, user, activeNoteId }: Props) {
  const { sidebarOpen, toggleSidebar } = useWorkspaceStore();
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleNewNote = async () => {
    setCreating(true);
    const { data, error } = await supabase
      .from("notes")
      .insert({
        workspace_id: workspace.id,
        title: "Untitled",
        content: null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (data) {
      router.push(`/workspace/${workspace.id}/${data.id}`);
      router.refresh();
    }
    setCreating(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center py-3 px-2 h-full border-r border-border gap-2 w-12 shrink-0">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleSidebar}>
          <PanelLeftOpen className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleNewNote} disabled={creating}>
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-border bg-card shrink-0 w-64 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-accent transition-colors min-w-0 flex-1">
              <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center shrink-0">
                <span className="text-background text-[10px] font-bold font-mono">i</span>
              </div>
              <span className="text-sm font-medium truncate">{workspace.name}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleNewNote} disabled={creating}>
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={toggleSidebar}>
            <PanelLeftClose className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1 px-2 py-2">
        {notes.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <p className="text-xs text-muted-foreground">No notes yet</p>
            <button
              onClick={handleNewNote}
              className="text-xs text-foreground underline underline-offset-2 mt-1 hover:text-muted-foreground"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                workspaceId={workspace.id}
                isActive={note.id === activeNoteId}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 shrink-0">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{user.full_name ?? user.email}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteItem({
  note,
  workspaceId,
  isActive,
}: {
  note: Note;
  workspaceId: string;
  isActive: boolean;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/workspace/${workspaceId}/${note.id}`)}
      className={cn(
        "w-full flex items-start gap-2 px-2 py-2 rounded-md text-left transition-colors group",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-foreground"
      )}
    >
      <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{note.title || "Untitled"}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}