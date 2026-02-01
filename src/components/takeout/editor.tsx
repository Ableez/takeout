"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "#/components/ui/button";
import {
  Drawer,
  DrawerContent,
} from "#/components/ui/drawer";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { extractTags } from "#/lib/parse-content";
import { Bold, Italic, Hash, AtSign, ListTodo, Sparkles } from "lucide-react";
import { cn } from "#/lib/utils";
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

interface CommandSuggestion {
  type: "todo" | "hashtag" | "mention";
  items: string[];
  position: number;
}

export function TakeoutEditor({
  open,
  onOpenChange,
  onSubmit,
  initialContent = "",
}: TakeoutEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [suggestion, setSuggestion] = useState<CommandSuggestion | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open, initialContent]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
    }
  }, [content]);

  // Detect slash commands, hashtags, and mentions
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const textBeforeCursor = content.slice(0, pos);
    const lastWord = textBeforeCursor.split(/\s/).pop() || "";

    // Slash command for TODO
    if (lastWord.startsWith("/")) {
      const query = lastWord.slice(1).toLowerCase();
      if ("todo".startsWith(query)) {
        setSuggestion({
          type: "todo",
          items: ["todo"],
          position: pos - lastWord.length,
        });
        return;
      }
    }

    // Hashtag suggestions
    if (lastWord.startsWith("#")) {
      const query = lastWord.slice(1);
      const existingTags = extractTags(content);
      const recentTags = ["work", "personal", "ideas", "urgent"].filter(
        tag => !existingTags.includes(tag) && tag.toLowerCase().includes(query.toLowerCase())
      );
      
      if (query.length > 0 || recentTags.length > 0) {
        setSuggestion({
          type: "hashtag",
          items: recentTags,
          position: pos - lastWord.length,
        });
        return;
      }
    }

    // Mention suggestions (placeholder)
    if (lastWord.startsWith("@")) {
      const query = lastWord.slice(1);
      const suggestions = ["task-123", "idea-456"].filter(
        item => item.toLowerCase().includes(query.toLowerCase())
      );
      
      if (suggestions.length > 0) {
        setSuggestion({
          type: "mention",
          items: suggestions,
          position: pos - lastWord.length,
        });
        return;
      }
    }

    setSuggestion(null);
  }, [content, cursorPosition]);

  const handleSuggestionSelect = (item: string) => {
    if (!suggestion || !textareaRef.current) return;

    const pos = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, pos);
    const lastWordStart = textBeforeCursor.lastIndexOf(
      suggestion.type === "todo" ? "/" : suggestion.type === "hashtag" ? "#" : "@"
    );
    
    let replacement = "";
    if (suggestion.type === "todo") {
      replacement = "[ ] ";
    } else if (suggestion.type === "hashtag") {
      replacement = `#${item} `;
    } else {
      replacement = `@${item} `;
    }

    const newContent = 
      content.slice(0, lastWordStart) + 
      replacement + 
      content.slice(pos);
    
    setContent(newContent);
    setSuggestion(null);

    // Set cursor position after replacement
    setTimeout(() => {
      const newPos = lastWordStart + replacement.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
      textareaRef.current?.focus();
    }, 0);
  };

  const applyFormatting = (format: "bold" | "italic") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);

    if (!selectedText) return;

    const wrapper = format === "bold" ? "**" : "*";
    const newText = `${wrapper}${selectedText}${wrapper}`;
    const newContent = content.slice(0, start) + newText + content.slice(end);

    setContent(newContent);
    
    setTimeout(() => {
      textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
      textarea.focus();
    }, 0);
  };

  const insertHashtag = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const newContent = content.slice(0, pos) + "#" + content.slice(pos);
    setContent(newContent);

    setTimeout(() => {
      textarea.setSelectionRange(pos + 1, pos + 1);
      textarea.focus();
    }, 0);
  };

  const insertMention = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const newContent = content.slice(0, pos) + "@" + content.slice(pos);
    setContent(newContent);

    setTimeout(() => {
      textarea.setSelectionRange(pos + 1, pos + 1);
      textarea.focus();
    }, 0);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    const tags = extractTags(content);
    const mentions: Id<"takeouts">[] = [];

    onSubmit(content.trim(), tags, mentions);
    setContent("");
    setSuggestion(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle suggestion selection
    if (suggestion && e.key === "Tab") {
      e.preventDefault();
      if (suggestion.items.length > 0) {
        handleSuggestionSelect(suggestion.items[0]);
      }
      return;
    }

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      if (suggestion) {
        setSuggestion(null);
      } else {
        onOpenChange(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="focus:outline-none">
        <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-4 sm:px-6">
          {/* Toolbar */}
          <div className="mb-4 flex items-center gap-1 border-b border-border pb-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormatting("bold")}
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormatting("italic")}
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-5 w-px bg-border" />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={insertHashtag}
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              <Hash className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={insertMention}
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              <AtSign className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListTodo className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Type /todo</span>
            </div>
          </div>

          {/* Editor */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
              className="w-full resize-none bg-transparent text-base leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none"
              rows={4}
            />

            {/* Suggestion Popover */}
            {suggestion && suggestion.items.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-border bg-popover p-1 shadow-lg">
                <div className="space-y-0.5">
                  {suggestion.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(item)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                      type="button"
                    >
                      {suggestion.type === "todo" && (
                        <ListTodo className="h-4 w-4 text-primary" />
                      )}
                      {suggestion.type === "hashtag" && (
                        <Hash className="h-4 w-4 text-primary" />
                      )}
                      {suggestion.type === "mention" && (
                        <AtSign className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-medium">
                        {suggestion.type === "hashtag" && "#"}
                        {suggestion.type === "mention" && "@"}
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-1 px-3 py-1.5 text-xs text-muted-foreground">
                  Press Tab to insert
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {content.length > 0 && (
                <>
                  <span>{content.length} characters</span>
                  {extractTags(content).length > 0 && (
                    <>
                      <span className="opacity-30">•</span>
                      <span>{extractTags(content).length} tags</span>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="default"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
                type="button"
              >
                Cancel
              </Button>
              <Button 
                size="default" 
                onClick={handleSubmit} 
                disabled={!content.trim()}
                className="min-w-[100px] flex-1 sm:flex-none"
                type="button"
              >
                <Sparkles className="h-4 w-4" />
                {initialContent ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
