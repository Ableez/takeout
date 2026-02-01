"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Shuffle, Activity } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { Button } from "#/components/ui/button";
import { Board } from "#/components/kanban/board";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet";
import { ActivityHeatmap } from "#/components/activity/activity-heatmap";
import { ActivityStats } from "#/components/activity/activity-stats";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const [showActivity, setShowActivity] = useState(false);
  
  const project = useQuery(api.projects.get, {
    id: projectId as Id<"projects">,
  });
  
  const activityData = useQuery(api.activity.getProjectActivity, {
    projectId: projectId as Id<"projects">,
  });
  
  const stats = useQuery(api.activity.getProjectStats, {
    projectId: projectId as Id<"projects">,
  });

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 animate-in fade-in-0">
        <p className="text-muted-foreground">Not found</p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/80">
        <div className="flex h-16 items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button 
              asChild 
              variant="ghost" 
              size="icon-sm" 
              className="shrink-0"
            >
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate">
                {project.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Sheet open={showActivity} onOpenChange={setShowActivity}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="default"
                  className="gap-2"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">Project Activity</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {stats && <ActivityStats stats={stats} />}
                  {activityData && (
                    <div className="rounded-2xl border-2 border-border/50 bg-card p-6 shadow-sm">
                      <h3 className="text-sm font-semibold mb-4">Activity Map</h3>
                      <ActivityHeatmap data={activityData} />
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              asChild 
              variant="ghost"
              size="default"
              className="gap-2"
            >
              <Link href={`/projects/${projectId}/review`}>
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Review</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Board projectId={projectId as Id<"projects">} />
    </div>
  );
}
