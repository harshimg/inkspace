"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Pencil, Trash2, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Folder as FolderType, Note } from "@/lib/types/app.types";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  folder: FolderType;
  notes: Note[];
  workspaceId: string;
  activeNoteId: string | null;
  userId: string;
  depth?: number;
}

export function FolderItem({ folder, notes, workspaceId, activeNoteId, userId, depth = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(folder.name);
  const [hovering, setHovering] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const folderNotes = notes.filter((n) => n.folder_id === folder.id);

  const handleRename = async () => {
    if (!name.trim() || name === folder.name) { setRenaming(false); return; }
    await supabase.from("folders").update({ name: name.trim() }).eq("id", folder.id);
    setRenaming(false);
    router.refresh();
  };

  const handleDelete = async () => {
    await supabase.from("folders").delete().eq("id", folder.id);
    router.refresh();
  };

  const handleNewNote = async () => {
    const { data } = await supabase
      .from("notes")
      .insert({ workspace_id: workspaceId, folder_id: folder.id, title: "Untitled", created_by: userId })
      .select("id")
      .single();
    if (data) { setOpen(true); router.push(`/workspace/${workspaceId}/${data.id}`); router.refresh(); }
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
          depth > 0 && "ml-3"
        )}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform shrink-0", open && "rotate-90")} />
        {open ? <FolderOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}

        {renaming ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-xs bg-transparent outline-none border-b border-border"
          />
        ) : (
          <span className="flex-1 text-xs font-medium truncate">{folder.name}</span>
        )}

        {hovering && !renaming && (
          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleNewNote} className="p-0.5 rounded hover:bg-accent">
              <FilePlus className="w-3 h-3 text-muted-foreground" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-0.5 rounded hover:bg-accent">
                  <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => setRenaming(true)}>
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {open && (
        <div className="mt-0.5">
          {folderNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => router.push(`/workspace/${workspaceId}/${note.id}`)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ml-6",
                note.id === activeNoteId ? "bg-accent" : "hover:bg-accent/50"
              )}
            >
              <FileText className="w-3 h-3 shrink-0 text-muted-foreground" />
              <span className="text-xs truncate">{note.title || "Untitled"}</span>
            </button>
          ))}
          {folderNotes.length === 0 && (
            <p className="text-[11px] text-muted-foreground ml-9 py-1">Empty</p>
          )}
        </div>
      )}
    </div>
  );
}