"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  initialUrl?: string;
  onConfirm: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function LinkDialog({ open, initialUrl, onConfirm, onRemove, onClose }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");

  useEffect(() => {
    if (open) setUrl(initialUrl ?? "");
  }, [open, initialUrl]);

  const handleConfirm = () => {
    if (!url.trim()) return;
    const href = url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
    onConfirm(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Insert link</DialogTitle>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Link className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">Insert link</span>
        </div>

        <div className="px-4 py-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">URL</label>
            <Input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="h-9"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!url.trim()}
              className="flex-1 h-8"
            >
              Apply
            </Button>
            {initialUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRemove}
                className="h-8 px-3 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-8 px-3"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}