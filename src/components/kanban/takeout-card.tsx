"use client";

import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { ContentRenderer } from "#/components/takeout/content-renderer";
import type { Doc } from "../../../convex/_generated/dataModel";

interface TakeoutCardProps {
  takeout: Doc<"takeouts">;
  categories: Doc<"categories">[];
  onMove: (categoryId: string) => void;
  onDelete: () => void;
  onClick: () => void;
}

export function TakeoutCard({
  takeout,
  categories,
  onMove,
  onDelete,
  onClick,
}: TakeoutCardProps) {
  const otherCategories = categories.filter(
    (cat) => cat._id !== takeout.categoryId
  );

  return (
    <div
      className="group relative rounded-md border border-border bg-card p-3 transition-colors hover:border-foreground/20 cursor-pointer"
      onClick={onClick}
    >
      <div className="pr-8">
        <div className="text-sm">
          <ContentRenderer content={takeout.content} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(takeout.createdAt, { addSuffix: true })}
          </span>
          {takeout.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {takeout.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {otherCategories.map((category) => (
            <DropdownMenuItem
              key={category._id}
              onClick={(e) => {
                e.stopPropagation();
                onMove(category._id);
              }}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Move to {category.name}
            </DropdownMenuItem>
          ))}
          {otherCategories.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
