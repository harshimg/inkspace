"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Note } from "@/lib/types/app.types";
import type { Json } from "@/lib/types/database.types";
import { AUTOSAVE_DELAY_MS } from "@/lib/constants";
import { Check, Loader2 } from "lucide-react";
import { BubbleToolbar } from "./BubbleToolbar";
import { SlashMenu } from "./SlashMenu";
import { useSlashCommand } from "./useSlashCommand";

interface Props {
  note: Note;
  workspaceId: string;
}

type SaveState = "idle" | "saving" | "saved";

export function NoteEditor({ note, workspaceId }: Props) {
  const [title, setTitle] = useState(note.title);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const { slashState, handleSlashKeyUp, closeSlash } = useSlashCommand();

  const save = useCallback(
    async (newTitle: string, content: Json | null) => {
      setSaveState("saving");
      await supabase
        .from("notes")
        .update({ title: newTitle || "Untitled", content, updated_at: new Date().toISOString() })
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
      Placeholder.configure({ placeholder: "Start writing, or type '/' for commands…" }),
      Typography,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline underline-offset-2 cursor-pointer" } }),
    ],
    content: (note.content as Json) ?? "",
    editorProps: {
      attributes: { class: "tiptap-editor min-h-[60vh] focus:outline-none" },
    },
    onUpdate: ({ editor }) => {
      scheduleSave(title, editor.getJSON() as Json);
      handleSlashKeyUp(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      handleSlashKeyUp(editor);
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
    if (e.key === "Enter") { e.preventDefault(); editor?.commands.focus("start"); }
  };

  // Word count
  const wordCount = editor
    ? editor.state.doc.textContent.split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0 h-12">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === "saving" && (
            <><Loader2 className="w-3 h-3 animate-spin" /><span>Saving…</span></>
          )}
          {saveState === "saved" && (
            <><Check className="w-3 h-3 text-green-500" /><span>Saved</span></>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-12" ref={editorWrapperRef}>
          <input
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            className="w-full text-4xl font-bold tracking-tight bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-6"
          />

          {editor && <BubbleToolbar editor={editor} />}

          <div className="relative">
            <EditorContent editor={editor} />

            {/* Slash menu */}
            {slashState.active && editor && (
              <div
                className="absolute z-50"
                style={{
                  top: slashState.position.top,
                  left: Math.max(0, slashState.position.left),
                }}
              >
                <SlashMenu
                  editor={editor}
                  query={slashState.query}
                  range={slashState.range}
                  onClose={closeSlash}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}