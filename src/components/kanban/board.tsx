"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Column } from "./column";
import { TakeoutEditor } from "#/components/takeout/editor";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface BoardProps {
  projectId: Id<"projects">;
}

export function Board({ projectId }: BoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | null>(null);
  const [editingTakeout, setEditingTakeout] = useState<Doc<"takeouts"> | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = useQuery(api.categories.listByProject, { projectId });
  const takeouts = useQuery(api.takeouts.listByProject, { projectId });

  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

  const createTakeout = useMutation(api.takeouts.create);
  const updateTakeout = useMutation(api.takeouts.update);
  const moveTakeout = useMutation(api.takeouts.move);
  const deleteTakeout = useMutation(api.takeouts.remove);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ projectId, name: newCategoryName.trim() });
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleCreateTakeout = async (
    content: string,
    tags: string[],
    mentions: Id<"takeouts">[]
  ) => {
    if (!selectedCategory) return;
    try {
      await createTakeout({
        projectId,
        categoryId: selectedCategory,
        content,
        tags,
        mentions,
      });
      setSelectedCategory(null);
      toast.success("Takeout added");
    } catch {
      toast.error("Failed to add takeout");
    }
  };

  const handleUpdateTakeout = async (
    content: string,
    tags: string[],
    mentions: Id<"takeouts">[]
  ) => {
    if (!editingTakeout) return;
    try {
      await updateTakeout({
        id: editingTakeout._id,
        content,
        tags,
        mentions,
      });
      setEditingTakeout(null);
      toast.success("Takeout updated");
    } catch {
      toast.error("Failed to update takeout");
    }
  };

  const handleMoveTakeout = async (takeoutId: string, categoryId: string) => {
    try {
      await moveTakeout({
        id: takeoutId as Id<"takeouts">,
        categoryId: categoryId as Id<"categories">,
      });
    } catch {
      toast.error("Failed to move takeout");
    }
  };

  const handleDeleteTakeout = async (takeoutId: string) => {
    try {
      await deleteTakeout({ id: takeoutId as Id<"takeouts"> });
      toast.success("Takeout deleted");
    } catch {
      toast.error("Failed to delete takeout");
    }
  };

  if (!categories || !takeouts) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-x-auto p-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-full w-80 flex-shrink-0 animate-pulse rounded-lg border border-border bg-muted/30 md:w-full"
          />
        ))}
      </div>
    );
  }

  const getTakeoutsForCategory = (categoryId: Id<"categories">): Doc<"takeouts">[] =>
    (takeouts as Doc<"takeouts">[])
      .filter((t) => t.categoryId === categoryId)
      .sort((a, b) => b.createdAt - a.createdAt);

  // Mobile view with tabs
  const MobileBoard = () => (
    <Tabs defaultValue={categories[0]?._id} className="flex h-[calc(100vh-8rem)] flex-col">
      <TabsList className="mx-4 mt-2 grid w-auto" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
        {categories.map((category: Doc<"categories">) => (
          <TabsTrigger key={category._id} value={category._id} className="text-xs">
            {category.name}
            <span className="ml-1 text-muted-foreground">
              {getTakeoutsForCategory(category._id).length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category: Doc<"categories">) => (
        <TabsContent
          key={category._id}
          value={category._id}
          className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
        >
          <Column
            category={category}
            categories={categories}
            takeouts={getTakeoutsForCategory(category._id)}
            onAddTakeout={() => setSelectedCategory(category._id)}
            onMoveTakeout={handleMoveTakeout}
            onDeleteTakeout={handleDeleteTakeout}
            onEditTakeout={setEditingTakeout}
            onUpdateCategory={(name) => updateCategory({ id: category._id, name })}
            onDeleteCategory={() => deleteCategory({ id: category._id })}
          />
        </TabsContent>
      ))}
    </Tabs>
  );

  // Desktop view with columns
  const DesktopBoard = () => (
    <div className="flex h-[calc(100vh-8rem)] gap-4 p-4">
      <div className="grid grid-cols-3 gap-4 w-full">
        {categories.map((category: Doc<"categories">) => (
          <Column
            key={category._id}
            category={category}
            categories={categories}
            takeouts={getTakeoutsForCategory(category._id)}
            onAddTakeout={() => setSelectedCategory(category._id)}
            onMoveTakeout={handleMoveTakeout}
            onDeleteTakeout={handleDeleteTakeout}
            onEditTakeout={setEditingTakeout}
            onUpdateCategory={(name) => updateCategory({ id: category._id, name })}
            onDeleteCategory={() => deleteCategory({ id: category._id })}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <MobileBoard />
      </div>

      {/* Desktop: Columns */}
      <div className="hidden md:block">
        <DesktopBoard />
      </div>

      {/* New Takeout Editor */}
      <TakeoutEditor
        open={selectedCategory !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCategory(null);
        }}
        onSubmit={handleCreateTakeout}
      />

      {/* Edit Takeout Editor */}
      <TakeoutEditor
        open={editingTakeout !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTakeout(null);
        }}
        onSubmit={handleUpdateTakeout}
        initialContent={editingTakeout?.content}
        initialTags={editingTakeout?.tags}
      />
    </>
  );
}
