import type { Database } from "./database.types";

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
  notes: Note[];
}

export interface WorkspaceWithFolders extends Workspace {
  folders: FolderWithChildren[];
  rootNotes: Note[];
}

export type UserRole = "owner" | "editor" | "viewer";

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}