"use client";

import { useMutation, useQuery } from "convex/react";
import { FolderKanban, Activity } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "#/components/layout/header";
import { ProjectCard } from "#/components/project/project-card";
import { ProjectForm } from "#/components/project/project-form";
import { ActivityHeatmap } from "#/components/activity/activity-heatmap";
import { ActivityStats } from "#/components/activity/activity-stats";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export default function ProjectsPage() {
  const [showNewProject, setShowNewProject] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const projects = useQuery(api.projects.list);
  const activityData = useQuery(api.activity.getUserActivity);
  const stats = useQuery(api.activity.getUserStats);
  const createProject = useMutation(api.projects.create);
  const deleteProject = useMutation(api.projects.remove);

  const handleCreateProject = async (data: {
    name: string;
    description?: string;
  }) => {
    setIsCreating(true);
    try {
      await createProject(data);
      setShowNewProject(false);
      toast.success("Created");
    } catch {
      toast.error("Failed");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject({ id: id as Id<"projects"> });
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <>
      <Header onNewProject={() => setShowNewProject(true)} />

      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
        {/* User Activity Section */}
        {stats && activityData && (
          <div className="mb-8 space-y-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Your Activity</h2>
            </div>
            <ActivityStats stats={stats} />
            <div className="rounded-2xl border-2 border-border/50 bg-card p-6 shadow-sm">
              <ActivityHeatmap data={activityData} />
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Projects</h2>
          {projects === undefined ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-muted/50"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl bg-primary/10 p-6 shadow-sm">
                <FolderKanban className="h-10 w-10 text-primary" />
              </div>
              <p className="mt-6 text-base font-medium text-muted-foreground">
                No projects yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                Create your first project to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project: Doc<"projects">, index: number) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={handleDeleteProject}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProjectForm
        open={showNewProject}
        onOpenChange={setShowNewProject}
        onSubmit={handleCreateProject}
        isLoading={isCreating}
      />
    </>
  );
}
