"use client";

import { useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";

interface SlashState {
  active: boolean;
  query: string;
  range: { from: number; to: number };
  position: { top: number; left: number };
}

const DEFAULT_STATE: SlashState = {
  active: false,
  query: "",
  range: { from: 0, to: 0 },
  position: { top: 0, left: 0 },
};

export function useSlashCommand() {
  const [slashState, setSlashState] = useState<SlashState>(DEFAULT_STATE);

  const handleSlashKeyUp = useCallback((editor: Editor) => {
    const { state } = editor;
    const { from } = state.selection;
    const textBefore = state.doc.textBetween(
      Math.max(0, from - 50),
      from,
      "\n"
    );

    const slashIndex = textBefore.lastIndexOf("/");

    if (slashIndex === -1) {
      setSlashState(DEFAULT_STATE);
      return;
    }

    const query = textBefore.slice(slashIndex + 1);

    // Close if space typed after slash
    if (query.includes(" ")) {
      setSlashState(DEFAULT_STATE);
      return;
    }

    const absoluteFrom = from - query.length - 1;

    // Get cursor position for menu placement
    const coords = editor.view.coordsAtPos(from);
    const editorRect = editor.view.dom.getBoundingClientRect();

    setSlashState({
      active: true,
      query,
      range: { from: absoluteFrom, to: from },
      position: {
        top: coords.bottom - editorRect.top + 8,
        left: coords.left - editorRect.left,
      },
    });
  }, []);

  const closeSlash = useCallback(() => {
    setSlashState(DEFAULT_STATE);
  }, []);

  return { slashState, handleSlashKeyUp, closeSlash };
}