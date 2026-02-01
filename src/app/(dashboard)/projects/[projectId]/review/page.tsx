"use client";

import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { ReviewDeck } from "#/components/review/review-deck";
import { api } from "../../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../../convex/_generated/dataModel";

interface ReviewPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const project = useQuery(api.projects.get, {
    id: projectId as Id<"projects">,
  });
  const categoriesData = useQuery(api.categories.listByProject, {
    projectId: projectId as Id<"projects">,
  });
  const takeoutsData = useQuery(api.takeouts.listByProject, {
    projectId: projectId as Id<"projects">,
  });

  if (project === undefined || categoriesData === undefined || takeoutsData === undefined) {
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

  const categories = categoriesData as Doc<"categories">[];
  const takeouts = takeoutsData as Doc<"takeouts">[];

  // Filter takeouts by selected category, or show "In progress" by default
  const defaultCategory = categories.find(
    (c) => c.name === "In progress" || c.order === 1
  );
  const activeCategory = selectedCategory
    ? categories.find((c) => c._id === selectedCategory)
    : defaultCategory;

  const filteredTakeouts = takeouts.filter(
    (t) => t.categoryId === (activeCategory?._id ?? "")
  );

  const handleComplete = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Sort this mess</h1>
          </div>

          <Select
            value={selectedCategory ?? activeCategory?._id}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name} ({takeouts.filter((t) => t.categoryId === category._id).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <ReviewDeck
          takeouts={filteredTakeouts}
          categories={categories}
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
}
