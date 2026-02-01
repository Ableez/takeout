"use client";

import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import type { Doc } from "../../../convex/_generated/dataModel";

interface ProjectCardProps {
  project: Doc<"projects">;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
      <Link
        href={`/projects/${project._id}`}
        className="absolute inset-0 z-0"
        aria-label={`Open ${project.name}`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 pr-8">
          <h3 className="font-medium leading-none">{project.name}</h3>
          {project.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
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
  );
}
