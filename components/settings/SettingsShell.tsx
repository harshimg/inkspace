"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  ArrowLeft,
  User,
  Building2,
  Trash2,
  Check,
  Loader2,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import type { AppUser, Workspace } from "@/lib/types/app.types";
import { cn } from "@/lib/utils/cn";

type Section = "profile" | "workspace" | "danger";

interface Props {
  user: AppUser;
  workspaces: Workspace[];
}

export function SettingsShell({ user, workspaces }: Props) {
  const [section, setSection] = useState<Section>("profile");
  const router = useRouter();
  const supabase = createClient();

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  const nav = [
    { id: "profile" as Section, label: "Profile", icon: User },
    { id: "workspace" as Section, label: "Workspace", icon: Building2 },
    { id: "danger" as Section, label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="px-4 py-4 border-b border-border">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="px-3 py-4 flex-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Settings
          </p>
          <nav className="space-y-0.5">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors text-left",
                  section === id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  id === "danger" && section !== "danger" && "text-destructive/70 hover:text-destructive"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-border px-3 py-3 flex items-center gap-2">
          <Avatar className="w-6 h-6 shrink-0">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <p className="text-xs truncate flex-1 text-muted-foreground">{user.email}</p>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-12">
          {section === "profile" && <ProfileSection user={user} initials={initials} />}
          {section === "workspace" && <WorkspaceSection workspaces={workspaces} />}
          {section === "danger" && <DangerSection workspaces={workspaces} userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Section ───────────────────────────────────────────────
function ProfileSection({ user, initials }: { user: AppUser; initials: string }) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal account information.</p>
      </div>
      <Separator />

      <div className="flex items-center gap-5">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar_url ?? undefined} />
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.full_name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Avatar synced from your OAuth provider
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Full name</label>
          <Input value={user.full_name ?? ""} disabled className="max-w-sm" />
          <p className="text-xs text-muted-foreground">Managed by your OAuth provider (GitHub / Google).</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input value={user.email} disabled className="max-w-sm" />
        </div>
      </div>
    </div>
  );
}

// ─── Workspace Section ─────────────────────────────────────────────
function WorkspaceSection({ workspaces }: { workspaces: Workspace[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [names, setNames] = useState<Record<string, string>>(
    Object.fromEntries(workspaces.map((w) => [w.id, w.name]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const handleRename = async (id: string) => {
    const name = names[id]?.trim();
    if (!name) return;
    setSaving(id);
    await supabase.from("workspaces").update({ name }).eq("id", id);
    setSaving(null);
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspaces.</p>
      </div>
      <Separator />

      <div className="space-y-6">
        {workspaces.map((ws) => (
          <div key={ws.id} className="space-y-3 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center shrink-0">
                <span className="text-background text-[10px] font-bold font-mono">i</span>
              </div>
              <span className="text-sm font-medium">{ws.name}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Workspace name</label>
              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  value={names[ws.id] ?? ws.name}
                  onChange={(e) => setNames((p) => ({ ...p, [ws.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(ws.id)}
                  maxLength={64}
                />
                <Button
                  size="sm"
                  onClick={() => handleRename(ws.id)}
                  disabled={saving === ws.id || names[ws.id] === ws.name}
                  className="shrink-0"
                >
                  {saving === ws.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : saved === ws.id ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Workspace ID</label>
              <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1.5 rounded">{ws.id}</p>
            </div>
          </div>
        ))}

        {workspaces.length === 0 && (
          <p className="text-sm text-muted-foreground">No workspaces found.</p>
        )}
      </div>
    </div>
  );
}

// ─── Danger Zone ───────────────────────────────────────────────────
function DangerSection({ workspaces, userId }: { workspaces: Workspace[]; userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetWs, setTargetWs] = useState<Workspace | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleDeleteWorkspace = async () => {
    if (!targetWs || confirmText !== targetWs.name) return;
    setDeleting(true);
    await supabase.from("workspaces").delete().eq("id", targetWs.id);
    setDeleting(false);
    setConfirmOpen(false);
    router.push("/workspace");
    router.refresh();
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-destructive">Danger Zone</h1>
        <p className="text-sm text-muted-foreground mt-1">Irreversible actions. Proceed with caution.</p>
      </div>
      <Separator />

      {/* Sign out */}
      <div className="flex items-start justify-between p-4 rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium">Sign out</p>
          <p className="text-xs text-muted-foreground mt-0.5">Sign out of your inkspace account.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={signingOut}
          className="shrink-0"
        >
          {signingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign out</>}
        </Button>
      </div>

      {/* Delete workspaces */}
      {workspaces.map((ws) => (
        <div key={ws.id} className="flex items-start justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <div>
            <p className="text-sm font-medium">Delete "{ws.name}"</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete this workspace and all its notes. This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => { setTargetWs(ws); setConfirmText(""); setConfirmOpen(true); }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
          </Button>
        </div>
      ))}

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Delete workspace
          </DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">"{targetWs?.name}"</span> and all notes inside it.
            This action cannot be undone.
          </DialogDescription>

          <div className="space-y-2 mt-2">
            <label className="text-sm text-muted-foreground">
              Type <span className="font-mono font-semibold text-foreground">{targetWs?.name}</span> to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={targetWs?.name}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 mt-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={confirmText !== targetWs?.name || deleting}
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
              Delete workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}