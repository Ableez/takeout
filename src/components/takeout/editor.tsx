"use client";

import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "#/components/ui/drawer";
import { Textarea } from "#/components/ui/textarea";
import { extractTags } from "#/lib/parse-content";
import type { Id } from "../../../convex/_generated/dataModel";

interface TakeoutEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    content: string,
    tags: string[],
    mentions: Id<"takeouts">[]
  ) => void;
  initialContent?: string;
  initialTags?: string[];
}

export function TakeoutEditor({
  open,
  onOpenChange,
  onSubmit,
  initialContent = "",
  initialTags = [],
}: TakeoutEditorProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [open, initialContent]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    const tags = extractTags(content);
    // For now, mentions are parsed but not linked to actual takeout IDs
    // This could be enhanced with autocomplete in the future
    const mentions: Id<"takeouts">[] = [];

    onSubmit(content.trim(), tags, mentions);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>
              {initialContent ? "Edit takeout" : "Drop a thought"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pt-0">
            <Textarea
              placeholder="What's on your mind? Use #tags and @mentions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={6}
              className="resize-none"
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Cmd+Enter to save
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!content.trim()}>
                  {initialContent ? "Save" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
