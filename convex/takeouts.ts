import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("takeouts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const takeouts = await ctx.db
      .query("takeouts")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return takeouts.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { id: v.id("takeouts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    mentions: v.optional(v.array(v.id("takeouts"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("takeouts")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const maxOrder = existing.reduce((max, t) => Math.max(max, t.order), -1);
    const now = Date.now();

    return await ctx.db.insert("takeouts", {
      projectId: args.projectId,
      categoryId: args.categoryId,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1,
      tags: args.tags ?? [],
      mentions: args.mentions ?? [],
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("takeouts"),
    content: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    tags: v.optional(v.array(v.string())),
    mentions: v.optional(v.array(v.id("takeouts"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const move = mutation({
  args: {
    id: v.id("takeouts"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      categoryId: args.categoryId,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("takeouts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    takeoutIds: v.array(v.id("takeouts")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.takeoutIds.length; i++) {
      const id = args.takeoutIds[i];
      if (id) {
        await ctx.db.patch(id, { order: i });
      }
    }
  },
});
