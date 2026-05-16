"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { useWorkspaceStore } from "@/store/workspace";
import type { Workspace, Note, Folder, AppUser } from "@/lib/types/app.types";
import { useEffect, useRef } from "react";

interface Props {
  workspace: Workspace;
  notes: Note[];
  folders: Folder[];
  user: AppUser;
  activeNoteId: string | null;
}

export function AppShell({ workspace, notes, folders, user, activeNoteId }: Props) {
  const { sidebarOpen, setActiveNote, setActiveWorkspace, setSidebarOpen } = useWorkspaceStore();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveWorkspace(workspace.id);
    setActiveNote(activeNoteId);
  }, [workspace.id, activeNoteId]);

  // Close sidebar on outside click (mobile/narrow behavior)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!sidebarOpen) return;
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div ref={sidebarRef}>
        <Sidebar
          workspace={workspace}
          notes={notes}
          folders={folders}
          user={user}
          activeNoteId={activeNoteId}
        />
      </div>
      <main className="flex-1 overflow-hidden">
        {activeNote ? (
          <NoteEditor note={activeNote} workspaceId={workspace.id} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 select-none">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">✦</span>
      </div>
      <h2 className="text-lg font-medium mb-1">No note selected</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Select a note from the sidebar or create a new one to get started.
      </p>
    </div>
  );
}