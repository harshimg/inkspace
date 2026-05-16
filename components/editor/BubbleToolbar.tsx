"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Code, Heading1, Heading2, Heading3, Link, Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LinkDialog } from "./LinkDialog";

interface Props {
  editor: Editor;
}

function ToolbarButton({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}

export function BubbleToolbar({ editor }: Props) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [linkOpen, setLinkOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateToolbar = () => {
      if (linkOpen) return;
      const { empty } = editor.state.selection;
      if (empty || editor.isActive("codeBlock")) {
        setVisible(false);
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) { setVisible(false); return; }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0) { setVisible(false); return; }

      const toolbarWidth = toolbarRef.current?.offsetWidth ?? 320;
      const toolbarHeight = toolbarRef.current?.offsetHeight ?? 40;

      // Fixed position relative to viewport
      let left = rect.left + rect.width / 2 - toolbarWidth / 2;
      let top = rect.top - toolbarHeight - 10 + window.scrollY;

      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8));
      if (top < 8) top = rect.bottom + 10 + window.scrollY;

      setPosition({ top, left });
      setVisible(true);
    };

    editor.on("selectionUpdate", updateToolbar);
    editor.on("transaction", updateToolbar);

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("transaction", updateToolbar);
    };
  }, [editor, linkOpen]);

  const currentUrl = editor.getAttributes("link").href as string | undefined;

  if (!visible) return null;

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed z-100 animate-fade-in"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg border border-border bg-popover shadow-xl">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code">
            <Code className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-0.5" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1">
            <Heading1 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">
            <Heading2 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">
            <Heading3 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-0.5" />
          <ToolbarButton onClick={() => setLinkOpen(true)} active={editor.isActive("link")} title="Link">
            <Link className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>
      </div>

      <LinkDialog
        open={linkOpen}
        initialUrl={currentUrl}
        onConfirm={(url) => { editor.chain().focus().setLink({ href: url }).run(); setLinkOpen(false); }}
        onRemove={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}
        onClose={() => setLinkOpen(false)}
      />
    </>
  );
}