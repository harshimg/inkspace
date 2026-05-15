import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace, Note, Folder } from "@/lib/types/app.types";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeNoteId: string | null;
  sidebarOpen: boolean;
  setActiveWorkspace: (id: string | null) => void;
  setActiveNote: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeNoteId: null,
      sidebarOpen: true,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      setActiveNote: (id) => set({ activeNoteId: id }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: "inkspace-workspace" }
  )
);