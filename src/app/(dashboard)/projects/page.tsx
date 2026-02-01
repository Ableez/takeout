"use client";

import { useMutation, useQuery } from "convex/react";
import { FolderKanban } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "#/components/layout/header";
import { ProjectCard } from "#/components/project/project-card";
import { ProjectForm } from "#/components/project/project-form";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export default function ProjectsPage() {
  const [showNewProject, setShowNewProject] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const projects = useQuery(api.projects.list);
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
      toast.success("Project created");
    } catch {
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject({ id: id as Id<"projects"> });
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <>
      <Header onNewProject={() => setShowNewProject(true)} />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {projects === undefined ? (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 sm:h-32 animate-pulse rounded-lg border border-border bg-muted"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-medium">Nothing here. Shocking.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first project to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {projects.map((project: Doc<"projects">) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
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
