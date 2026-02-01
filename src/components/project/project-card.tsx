"use client";

import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

interface ProjectCardProps {
  project: Doc<"projects">;
  onDelete: (id: string) => void;
  index?: number;
}

export function ProjectCard({ project, onDelete, index = 0 }: ProjectCardProps) {
  return (
    <div 
      className={cn(
        "group relative rounded-2xl bg-card p-5 sm:p-6",
        "border-2 border-border/50 hover:border-primary/30",
        "shadow-sm hover:shadow-lg",
        "transition-all duration-200 ease-out",
        "active:scale-[0.99]",
        "animate-in fade-in-0 slide-in-from-bottom-3"
      )}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      <Link
        href={`/projects/${project._id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Open ${project.name}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold leading-tight truncate">{project.name}</h3>
          {project.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2">
            <div className="rounded-full bg-primary/10 px-3 py-1">
              <p className="text-xs font-semibold text-primary">
                {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "opacity-0 group-hover:opacity-100 focus:opacity-100",
                  "transition-opacity duration-150"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project._id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
