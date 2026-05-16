"use client";

import type { Json } from "@/lib/types/database.types";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Note } from "@/lib/types/app.types";
import { AUTOSAVE_DELAY_MS } from "@/lib/constants";
import { Check, Loader2 } from "lucide-react";

interface Props {
  note: Note;
  workspaceId: string;
}

type SaveState = "idle" | "saving" | "saved";

export function NoteEditor({ note, workspaceId }: Props) {
  const [title, setTitle] = useState(note.title);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const save = useCallback(
  async (newTitle: string, content: Json | null) => {
    setSaveState("saving");
    await supabase
      .from("notes")
      .update({
        title: newTitle || "Untitled",
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", note.id);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
    router.refresh();
  },
  [note.id]
);

const scheduleSave = useCallback(
  (newTitle: string, content: Json | null) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(newTitle, content), AUTOSAVE_DELAY_MS);
  },
  [save]
);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
      Typography,
    ],
    content: (note.content as Record<string, unknown>) ?? "",
    editorProps: {
      attributes: { class: "tiptap-editor min-h-[60vh] focus:outline-none" },
    },
    onUpdate: ({ editor }) => {
  scheduleSave(title, editor.getJSON() as Json);
},
  });

  useEffect(() => {
  setTitle(note.title);
  if (editor && note.content) {
    editor.commands.setContent(
      note.content as Parameters<typeof editor.commands.setContent>[0]
    );
  }
}, [note.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setTitle(val);
  scheduleSave(val, editor?.getJSON() as Json ?? null);
};

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.commands.focus("start");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-end px-6 py-3 border-b border-border shrink-0 h-12">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === "saving" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving…</span>
            </>
          )}
          {saveState === "saved" && (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span>Saved</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <input
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            className="w-full text-4xl font-bold tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-6"
          />
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}