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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
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

  const categories = categoriesData;
  const takeouts = takeoutsData;

  // Filter takeouts by selected category, or show "In progress" by default
  const defaultCategory = categories.find(
    (c: Doc<"categories">) => c.name === "In progress" || c.order === 1
  );
  const activeCategory = selectedCategory
    ? categories.find((c: Doc<"categories">) => c._id === selectedCategory)
    : defaultCategory;

  const filteredTakeouts = takeouts.filter(
    (t: Doc<"takeouts">) => t.categoryId === (activeCategory?._id ?? "")
  );

  const handleComplete = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-base font-semibold">Review</h1>
          </div>

          <Select
            value={selectedCategory ?? activeCategory?._id}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: Doc<"categories">) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name} ({takeouts.filter((t: Doc<"takeouts">) => t.categoryId === category._id).length})
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
