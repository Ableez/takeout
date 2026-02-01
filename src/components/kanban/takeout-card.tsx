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
import { extractTodos } from "#/lib/parse-content";
import { cn } from "#/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { CSSProperties } from "react";

interface TakeoutCardProps {
  takeout: Doc<"takeouts">;
  categories: Doc<"categories">[];
  onMove: (categoryId: string) => void;
  onDelete: () => void;
  onClick: () => void;
  style?: CSSProperties;
}

export function TakeoutCard({
  takeout,
  categories,
  onMove,
  onDelete,
  onClick,
  style,
}: TakeoutCardProps) {
  const otherCategories = categories.filter(
    (cat) => cat._id !== takeout.categoryId
  );

  // Extract TODO progress
  const todoStats = extractTodos(takeout.content);
  const hasTodos = todoStats.total > 0;
  const progressPercentage = hasTodos 
    ? (todoStats.completed / todoStats.total) * 100 
    : 0;

  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-card p-4 overflow-hidden",
        "border-2 border-border/50 hover:border-primary/30",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200 ease-out",
        "cursor-pointer active:scale-[0.99]",
        "animate-in fade-in-0 slide-in-from-bottom-2"
      )}
      onClick={onClick}
      style={style}
    >
      {/* Subtle TODO progress indicator */}
      {hasTodos && (
        <div 
          className="absolute inset-0 bg-(--todo-progress) pointer-events-none"
          style={{ 
            width: `${progressPercentage}%`,
            transition: 'width 0.3s ease-out'
          }}
        />
      )}

      <div className="relative z-10 pr-8">
        <div className="text-sm leading-relaxed">
          <ContentRenderer content={takeout.content} />
        </div>
        <div className="mt-3 flex items-center gap-2.5 text-xs flex-wrap">
          <span className="rounded-full bg-accent px-2.5 py-1 font-medium text-accent-foreground">
            {formatDistanceToNow(takeout.createdAt, { addSuffix: true })}
          </span>
          {hasTodos && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
              {todoStats.completed}/{todoStats.total} done
            </span>
          )}
          {takeout.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {takeout.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-accent px-2.5 py-1 font-medium text-accent-foreground">
                  #{tag}
                </span>
              ))}
              {takeout.tags.length > 2 && (
                <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  +{takeout.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "absolute right-2 top-2 z-20",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "transition-opacity duration-150"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-xl">
          {otherCategories.map((category) => (
            <DropdownMenuItem
              key={category._id}
              onClick={(e) => {
                e.stopPropagation();
                onMove(category._id);
              }}
              className="rounded-lg"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              {category.name}
            </DropdownMenuItem>
          ))}
          {otherCategories.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive rounded-lg"
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
