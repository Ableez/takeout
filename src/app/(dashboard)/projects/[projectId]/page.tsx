"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Shuffle } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Button } from "#/components/ui/button";
import { Board } from "#/components/kanban/board";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const project = useQuery(api.projects.get, {
    id: projectId as Id<"projects">,
  });

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Project not found. Awkward.</p>
        <Button asChild variant="outline">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold leading-none">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectId}/review`}>
              <Shuffle className="mr-2 h-4 w-4" />
              Review
            </Link>
          </Button>
        </div>
      </header>

      <Board projectId={projectId as Id<"projects">} />
    </div>
  );
}
