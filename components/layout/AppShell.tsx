"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { useWorkspaceStore } from "@/store/workspace";
import type { Workspace, Note, Folder, AppUser } from "@/lib/types/app.types";
import { useEffect } from "react";

interface Props {
  workspace: Workspace;
  notes: Note[];
  folders: Folder[];
  user: AppUser;
  activeNoteId: string | null;
}

export function AppShell({ workspace, notes, folders, user, activeNoteId }: Props) {
  const { sidebarOpen, setActiveNote, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    setActiveWorkspace(workspace.id);
    setActiveNote(activeNoteId);
  }, [workspace.id, activeNoteId]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        workspace={workspace}
        notes={notes}
        folders={folders}
        user={user}
        activeNoteId={activeNoteId}
      />
      <main
        className="flex-1 overflow-hidden transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? "0" : "0" }}
      >
        {activeNote ? (
          <NoteEditor note={activeNote} workspaceId={workspace.id} />
        ) : (
          <EmptyState workspaceId={workspace.id} />
        )}
      </main>
    </div>
  );
}

function EmptyState({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 select-none">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">✦</span>
      </div>
      <h2 className="text-lg font-medium text-foreground mb-1">No note selected</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Select a note from the sidebar or create a new one to get started.
      </p>
    </div>
  );
}