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
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);

  const handleSaveName = () => {
    if (editName.trim() && editName !== category.name) {
      onUpdateCategory(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-muted/30 md:min-w-0">
      {/* Header - hidden on mobile since tabs show the name */}
      <div className="hidden md:flex items-center justify-between border-b border-border px-3 py-2">
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
            className="h-7 text-sm font-medium"
            autoFocus
          />
        ) : (
          <h3 className="text-sm font-medium">
            {category.name}
            <span className="ml-2 text-muted-foreground">
              {takeouts.length}
            </span>
          </h3>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onAddTakeout}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add takeout</span>
          </Button>

          {!category.isDefault && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
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

      {/* Mobile: Add button at top */}
      <div className="flex items-center justify-end p-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTakeout}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 pb-2 md:p-2">
        <div className="space-y-2">
          {takeouts.map((takeout) => (
            <TakeoutCard
              key={takeout._id}
              takeout={takeout}
              categories={categories}
              onMove={(categoryId) => onMoveTakeout(takeout._id, categoryId)}
              onDelete={() => onDeleteTakeout(takeout._id)}
              onClick={() => onEditTakeout(takeout)}
            />
          ))}
          {takeouts.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Empty. How peaceful.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
