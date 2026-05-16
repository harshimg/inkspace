"use client";

import { useState, useEffect } from "react";
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
    FolderPlus,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
    FileText,
    ChevronRight,
    Loader2,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Archive,
    Settings,
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

    const handleNewNote = async () => {
        setCreating(true);
        const { data } = await supabase
            .from("notes")
            .insert({ workspace_id: workspace.id, title: "Untitled", content: null, created_by: user.id })
            .select("id")
            .single();
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

    // Global Ctrl+K
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

    const initials = user.full_name
        ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user.email.slice(0, 2).toUpperCase();

    if (!sidebarOpen) {
        return (
            <div className="flex flex-col items-center py-3 px-2 h-full border-r border-border gap-2 w-12 shrink-0 bg-card">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleSidebar}>
                    <PanelLeftOpen className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setSearchOpen(true)}>
                    <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleNewNote} disabled={creating}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
                </Button>
                <SearchDialog notes={notes} workspaceId={workspace.id} open={searchOpen} onOpenChange={setSearchOpen} />
            </div>
        );
    }

    return (
        <>
            <SearchDialog notes={notes} workspaceId={workspace.id} open={searchOpen} onOpenChange={setSearchOpen} />

            <div className="flex flex-col h-full border-r border-border bg-card shrink-0 w-64 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
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

                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setSearchOpen(true)}>
                            <Search className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleNewNote} disabled={creating}>
                            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setCreatingFolder(true)}>
                            <FolderPlus className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={toggleSidebar}>
                            <PanelLeftClose className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Search bar */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="mx-3 mt-2 flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/60 hover:bg-muted transition-colors text-xs text-muted-foreground"
                >
                    <Search className="w-3 h-3" />
                    <span className="flex-1 text-left">Search notes...</span>
                    <kbd className="text-[10px] border border-border rounded px-1 font-mono">⌘K</kbd>
                </button>

                {/* Content */}
                <ScrollArea className="flex-1 px-2 py-2 mt-1">
                    {/* New folder input */}
                    {creatingFolder && (
                        <div className="flex items-center gap-1 px-2 py-1.5 mb-1">
                            <input
                                autoFocus
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onBlur={handleCreateFolder}
                                onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setCreatingFolder(false); }}
                                placeholder="Folder name..."
                                className="flex-1 text-xs bg-transparent outline-none border-b border-border placeholder:text-muted-foreground py-0.5"
                            />
                        </div>
                    )}

                    {/* Folders */}
                    {folders.length > 0 && (
                        <div className="mb-2 space-y-0.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Folders</p>
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
                        </div>
                    )}

                    {/* Root notes */}
                    {rootNotes.length > 0 && (
                        <div className="space-y-0.5">
                            {folders.length > 0 && (
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1 mt-2">Notes</p>
                            )}
                            {rootNotes.map((note) => (
                                <NoteItem
                                    key={note.id}
                                    note={note}
                                    workspaceId={workspace.id}
                                    isActive={note.id === activeNoteId}
                                    userId={user.id}
                                />
                            ))}
                        </div>
                    )}

                    {rootNotes.length === 0 && folders.length === 0 && (
                        <div className="px-2 py-8 text-center">
                            <p className="text-xs text-muted-foreground">No notes yet</p>
                            <button onClick={handleNewNote} className="text-xs text-foreground underline underline-offset-2 mt-1">
                                Create your first note
                            </button>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="border-t border-border px-3 py-2.5 flex items-center gap-2">
                    <Avatar className="w-6 h-6 shrink-0">
                        <AvatarImage src={user.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{user.full_name ?? user.email}</p>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </>
    );
}

function NoteItem({ note, workspaceId, isActive, userId }: { note: Note; workspaceId: string; isActive: boolean; userId: string }) {
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
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            )}
            onClick={() => router.push(`/workspace/${workspaceId}/${note.id}`)}
        >
            <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{note.title || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-0.5 rounded hover:bg-accent shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleArchive}>
                        <Archive className="w-3.5 h-3.5 mr-2" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}