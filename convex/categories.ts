import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return categories.sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const maxOrder = existing.reduce((max, cat) => Math.max(max, cat.order), -1);

    return await ctx.db.insert("categories", {
      projectId: args.projectId,
      name: args.name,
      order: maxOrder + 1,
      isDefault: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) return;

    // Move all takeouts to the first category or delete them
    const takeouts = await ctx.db
      .query("takeouts")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    const otherCategories = await ctx.db
      .query("categories")
      .withIndex("by_project", (q) => q.eq("projectId", category.projectId))
      .collect();

    const firstOther = otherCategories.find((c) => c._id !== args.id);

    if (firstOther) {
      for (const takeout of takeouts) {
        await ctx.db.patch(takeout._id, { categoryId: firstOther._id });
      }
    } else {
      for (const takeout of takeouts) {
        await ctx.db.delete(takeout._id);
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    projectId: v.id("projects"),
    categoryIds: v.array(v.id("categories")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.categoryIds.length; i++) {
      const id = args.categoryIds[i];
      if (id) {
        await ctx.db.patch(id, { order: i });
      }
    }
  },
});
