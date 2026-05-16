"use client";

import { SignOutButton } from "@/components/shared/SignOutButton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/store/workspace";
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
  FilePlus, FolderPlus, LogOut, FileText,
  Loader2, Search, MoreHorizontal, Trash2,
  Archive, Settings, ChevronsUpDown, PanelLeft,
} from "lucide-react";
import type { Workspace, Note, Folder, AppUser } from "@/lib/types/app.types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { FolderItem } from "./FolderItem";
import { SearchDialog } from "@/components/shared/SearchDialog";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

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
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const rootNotes = notes.filter((n) => !n.folder_id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNewNote = async () => {
    setCreating(true);
    const { data } = await supabase
      .from("notes")
      .insert({ workspace_id: workspace.id, title: "Untitled", content: null, created_by: user.id })
      .select("id").single();
    if (data) { router.push(`/workspace/${workspace.id}/${data.id}`); router.refresh(); }
    setCreating(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) { setCreatingFolder(false); return; }
    await supabase.from("folders").insert({
      workspace_id: workspace.id,
      name: newFolderName.trim(),
      position: folders.length,
    });
    setNewFolderName("");
    setCreatingFolder(false);
    router.refresh();
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
      <div className="flex flex-col items-center py-4 px-2 h-full border-r border-border gap-3 w-14 shrink-0 bg-card">
        <button onClick={toggleSidebar} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <PanelLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setSearchOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <Search className="w-4 h-4" />
        </button>
        <button onClick={handleNewNote} disabled={creating} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
        </button>
        <SearchDialog notes={notes} workspaceId={workspace.id} open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    );
  }

  return (
    <>
      <SearchDialog notes={notes} workspaceId={workspace.id} open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="flex flex-col h-full border-r border-border bg-card shrink-0 w-60 select-none">

        {/* Workspace switcher — Vercel style */}
        <div className="px-3 pt-4 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors group">
                <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center shrink-0">
                  <span className="text-background text-[11px] font-bold font-mono">i</span>
                </div>
                <span className="text-sm font-medium truncate flex-1 text-left">{workspace.name}</span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5 mb-1">
                <p className="text-xs font-medium">{workspace.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="w-3.5 h-3.5 mr-2" /> Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions row */}
        <div className="px-3 pb-2 flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search</span>
            <kbd className="ml-auto text-[10px] border border-border rounded px-1 font-mono">⌘K</kbd>
          </button>
          <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-3 pb-2 flex items-center gap-1">
          <button
            onClick={handleNewNote}
            disabled={creating}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground text-xs w-full"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
            New note
          </button>
          <button
            onClick={() => setCreatingFolder(true)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mx-3 mb-2 h-px bg-border" />

        {/* Nav content */}
        <ScrollArea className="flex-1 px-2">
          <div className="py-1 space-y-0.5">

            {/* New folder input */}
            {creatingFolder && (
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                <FolderPlus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onBlur={handleCreateFolder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") setCreatingFolder(false);
                  }}
                  placeholder="Folder name..."
                  className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Folders */}
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                notes={notes}
                workspaceId={workspace.id}
                activeNoteId={activeNoteId}
                userId={user.id}
              />
            ))}

            {/* Section label if both exist */}
            {folders.length > 0 && rootNotes.length > 0 && (
              <div className="px-2 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notes</p>
              </div>
            )}

            {/* Root notes */}
            {rootNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                workspaceId={workspace.id}
                isActive={note.id === activeNoteId}
              />
            ))}

            {rootNotes.length === 0 && folders.length === 0 && !creatingFolder && (
              <div className="px-2 py-6 text-center">
                <p className="text-xs text-muted-foreground">No notes yet</p>
                <button onClick={handleNewNote} className="text-xs underline underline-offset-2 mt-1 text-muted-foreground hover:text-foreground">
                  Create your first note
                </button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="mx-3 mt-1 mb-1 h-px bg-border" />
        <div className="px-3 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 shrink-0">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-tight">{user.full_name ?? user.email}</p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">{user.full_name ? user.email : ""}</p>
            </div>
            <ThemeToggle />
          </div>
          <SignOutButton className="w-full px-2 py-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive" />
        </div>
      </div>
    </>
  );
}

function NoteItem({ note, workspaceId, isActive }: { note: Note; workspaceId: string; isActive: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("notes").delete().eq("id", note.id);
    if (isActive) router.push(`/workspace/${workspaceId}`);
    router.refresh();
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("notes").update({ is_archived: true }).eq("id", note.id);
    if (isActive) router.push(`/workspace/${workspaceId}`);
    router.refresh();
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
      )}
      onClick={() => router.push(`/workspace/${workspaceId}/${note.id}`)}
    >
      <FileText className="w-3.5 h-3.5 shrink-0" />
      <span className="text-xs truncate flex-1">{note.title || "Untitled"}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent transition-opacity shrink-0">
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="w-3.5 h-3.5 mr-2" /> Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}