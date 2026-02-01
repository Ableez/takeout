"use client";

import { Plus, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { ScrollArea } from "#/components/ui/scroll-area";
import { TakeoutCard } from "./takeout-card";
import { cn } from "#/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface ColumnProps {
  category: Doc<"categories">;
  categories: Doc<"categories">[];
  takeouts: Doc<"takeouts">[];
  onAddTakeout: () => void;
  onMoveTakeout: (takeoutId: string, categoryId: string) => void;
  onDeleteTakeout: (takeoutId: string) => void;
  onEditTakeout: (takeout: Doc<"takeouts">) => void;
  onUpdateCategory: (name: string) => void;
  onDeleteCategory: () => void;
  state: "expanded" | "collapsed";
  onExpand: () => void;
}

export function Column({
  category,
  categories,
  takeouts,
  onAddTakeout,
  onMoveTakeout,
  onDeleteTakeout,
  onEditTakeout,
  onUpdateCategory,
  onDeleteCategory,
  state,
  onExpand,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);

  const handleSaveName = () => {
    if (editName.trim() && editName !== category.name) {
      onUpdateCategory(editName.trim());
    }
    setIsEditing(false);
  };

  const isCollapsed = state === "collapsed";

  // Collapsed view (desktop only)
  if (isCollapsed) {
    return (
      <button
        onClick={onExpand}
        className={cn(
          "group flex h-full w-14 flex-shrink-0 flex-col items-center rounded-2xl",
          "bg-muted/40 border-2 border-transparent hover:border-primary/30",
          "transition-all duration-300 ease-out cursor-pointer hover:shadow-sm"
        )}
      >
        <div className="flex h-12 w-full items-center justify-center border-b border-border/50">
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            {takeouts.length}
          </span>
        </div>
        <div className="flex flex-1 items-center py-4">
          <span 
            className="text-sm font-semibold text-muted-foreground whitespace-nowrap"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {category.name}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div 
      className={cn(
        "flex h-full flex-col rounded-2xl",
        "bg-muted/40 border-2 border-transparent",
        "transition-all duration-300 ease-out",
        "flex-1 min-w-0"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border/50 px-4">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") {
                setEditName(category.name);
                setIsEditing(false);
              }
            }}
            className="h-9 text-sm font-semibold bg-transparent border-none focus-visible:ring-1"
            autoFocus
          />
        ) : (
          <h3 className="text-sm font-bold truncate">
            {category.name}
            <span className="ml-2.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary tabular-nums">
              {takeouts.length}
            </span>
          </h3>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-primary"
            onClick={onAddTakeout}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add</span>
          </Button>

          {!category.isDefault && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="rounded-lg">
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive rounded-lg"
                  onClick={onDeleteCategory}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {takeouts.map((takeout, index) => (
            <TakeoutCard
              key={takeout._id}
              takeout={takeout}
              categories={categories}
              onMove={(categoryId) => onMoveTakeout(takeout._id, categoryId)}
              onDelete={() => onDeleteTakeout(takeout._id)}
              onClick={() => onEditTakeout(takeout)}
              style={{ 
                animationDelay: `${index * 30}ms`,
              }}
            />
          ))}
          {takeouts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-muted/50 p-4">
                <Plus className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">Empty</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
