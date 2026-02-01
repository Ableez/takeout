"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
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
  const [expandedColumn, setExpandedColumn] = useState<Id<"categories"> | null>(null);

  const categories = useQuery(api.categories.listByProject, { projectId });
  const takeouts = useQuery(api.takeouts.listByProject, { projectId });

  const createTakeout = useMutation(api.takeouts.create);
  const updateTakeout = useMutation(api.takeouts.update);
  const moveTakeout = useMutation(api.takeouts.move);
  const deleteTakeout = useMutation(api.takeouts.remove);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

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
      toast.success("Added");
    } catch {
      toast.error("Failed to add");
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
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleMoveTakeout = async (takeoutId: string, categoryId: string) => {
    try {
      await moveTakeout({
        id: takeoutId as Id<"takeouts">,
        categoryId: categoryId as Id<"categories">,
      });
    } catch {
      toast.error("Failed to move");
    }
  };

  const handleDeleteTakeout = async (takeoutId: string) => {
    try {
      await deleteTakeout({ id: takeoutId as Id<"takeouts"> });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!categories || !takeouts) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
      </div>
    );
  }

  const getTakeoutsForCategory = (categoryId: Id<"categories">): Doc<"takeouts">[] =>
    takeouts
      .filter((t: Doc<"takeouts">) => t.categoryId === categoryId)
      .sort((a: Doc<"takeouts">, b: Doc<"takeouts">) => b.createdAt - a.createdAt);

  // Find the middle (active) category - "In progress"
  const activeCategory = categories.find((c: Doc<"categories">) => c.order === 1);

  // Auto-expand the active column on mount
  const getColumnState = (categoryId: Id<"categories">) => {
    if (expandedColumn) {
      return expandedColumn === categoryId ? "expanded" : "collapsed";
    }
    // Default: middle column expanded
    const cat = categories.find((c: Doc<"categories">) => c._id === categoryId);
    return cat?.order === 1 ? "expanded" : "collapsed";
  };

  const handleColumnClick = (categoryId: Id<"categories">) => {
    setExpandedColumn(categoryId);
  };

  // Mobile view with tabs
  const MobileBoard = () => (
    <Tabs 
      defaultValue={activeCategory?._id ?? categories[0]?._id} 
      className="flex h-[calc(100vh-4rem)] flex-col"
    >
      <TabsList className="mx-4 mt-4 grid h-12 w-auto rounded-2xl bg-muted/50 p-1" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
        {categories.map((category: Doc<"categories">) => (
          <TabsTrigger 
            key={category._id} 
            value={category._id} 
            className="text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl transition-all"
          >
            {category.name}
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary tabular-nums">
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
            state="expanded"
            onExpand={() => undefined}
          />
        </TabsContent>
      ))}
    </Tabs>
  );

  // Desktop view with collapsible columns
  const DesktopBoard = () => (
    <div className="flex h-[calc(100vh-4rem)] gap-3 p-4">
      {categories.map((category: Doc<"categories">) => {
        const state = getColumnState(category._id);
        return (
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
            state={state}
            onExpand={() => handleColumnClick(category._id)}
          />
        );
      })}
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
