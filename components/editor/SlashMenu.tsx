"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code2,
  Quote,
  Minus,
  Text,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
}

const COMMANDS: SlashCommand[] = [
  {
    id: "h1",
    label: "Heading 1",
    description: "Large section heading",
    icon: <Heading1 className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).setNode("heading", { level: 1 }).run(),
  },
  {
    id: "h2",
    label: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).setNode("heading", { level: 2 }).run(),
  },
  {
    id: "h3",
    label: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).setNode("heading", { level: 3 }).run(),
  },
  {
    id: "text",
    label: "Paragraph",
    description: "Plain text paragraph",
    icon: <Text className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).setNode("paragraph").run(),
  },
  {
    id: "bullet",
    label: "Bullet List",
    description: "Unordered list",
    icon: <List className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).toggleBulletList().run(),
  },
  {
    id: "ordered",
    label: "Numbered List",
    description: "Ordered list",
    icon: <ListOrdered className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).toggleOrderedList().run(),
  },
  {
    id: "code",
    label: "Code Block",
    description: "Multiline code snippet",
    icon: <Code2 className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).toggleCodeBlock().run(),
  },
  {
    id: "quote",
    label: "Blockquote",
    description: "Highlighted quote",
    icon: <Quote className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).toggleBlockquote().run(),
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule",
    icon: <Minus className="w-4 h-4" />,
    action: (e) => e.chain().focus().deleteRange(e.state.selection).setHorizontalRule().run(),
  },
];

interface Props {
  editor: Editor;
  query: string;
  range: { from: number; to: number };
  onClose: () => void;
}

export function SlashMenu({ editor, query, range, onClose }: Props) {
  const [selected, setSelected] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => (s + 1) % filtered.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => (s - 1 + filtered.length) % filtered.length); }
      else if (e.key === "Enter") { e.preventDefault(); if (filtered[selected]) { filtered[selected].action(editor); onClose(); } }
      else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [filtered, selected, editor, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={ref}
      className="z-50 w-64 rounded-lg border border-border bg-popover shadow-lg overflow-hidden animate-fade-in"
    >
      <div className="px-3 py-2 border-b border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Commands</p>
      </div>
      <div className="p-1 max-h-72 overflow-y-auto">
        {filtered.map((cmd, i) => (
          <button
            key={cmd.id}
            onClick={() => { cmd.action(editor); onClose(); }}
            onMouseEnter={() => setSelected(i)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
              selected === i ? "bg-accent" : "hover:bg-accent/50"
            )}
          >
            <div className="w-8 h-8 rounded-md border border-border bg-background flex items-center justify-center shrink-0 text-muted-foreground">
              {cmd.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{cmd.label}</p>
              <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}