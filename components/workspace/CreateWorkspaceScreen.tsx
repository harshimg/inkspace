"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Props {
  userId: string;
}

export function CreateWorkspaceScreen({ userId }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 48);

    const uniqueSlug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;

    const { data, error: err } = await supabase
  .from("workspaces")
  .insert({ name: name.trim(), slug: uniqueSlug, owner_id: userId })
  .select("id")
  .single();

console.log("INSERT RESULT:", { data, err });

if (err) {
  setError(`Error: ${err.message} (${err.code})`);
  setLoading(false);
  return;
}

    router.push(`/workspace/${data.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 animate-fade-in">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-sm font-bold font-mono">i</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">inkspace</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted-foreground">
            This is your personal knowledge base. You can rename it anytime.
          </p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="e.g. My Workspace, Research, Work..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
            maxLength={64}
            className="h-11"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="w-full h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workspace"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}