"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileText, Search } from "lucide-react";
import type { Note } from "@/lib/types/app.types";
import { cn } from "@/lib/utils/cn";
import { formatDistanceToNow } from "date-fns";

interface Props {
  notes: Note[];
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ notes, workspaceId, open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  const filtered = query.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          (n.content_text ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : notes.slice(0, 8);

  useEffect(() => setSelected(0), [query]);
  useEffect(() => { if (!open) setQuery(""); }, [open]);

  const navigate = (note: Note) => {
    router.push(`/workspace/${workspaceId}/${note.id}`);
    onOpenChange(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && filtered[selected]) navigate(filtered[selected]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">Search notes</DialogTitle>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search notes..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No notes found</div>
          ) : (
            <div className="p-1.5">
              {filtered.map((note, i) => (
                <button
                  key={note.id}
                  onClick={() => navigate(note)}
                  onMouseEnter={() => setSelected(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                    selected === i ? "bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{note.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border px-4 py-2 flex items-center gap-4">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <kbd className="border border-border rounded px-1 font-mono">↑↓</kbd> navigate
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <kbd className="border border-border rounded px-1 font-mono">↵</kbd> open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}