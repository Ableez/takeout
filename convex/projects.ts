import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_CATEGORIES = [
  { name: "Later", order: 0, isDefault: true },
  { name: "In progress", order: 1, isDefault: true },
  { name: "Done", order: 2, isDefault: true },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });

    // Create default categories
    for (const category of DEFAULT_CATEGORIES) {
      await ctx.db.insert("categories", {
        projectId,
        name: category.name,
        order: category.order,
        isDefault: category.isDefault,
      });
    }

    return projectId;
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Delete all takeouts
    const takeouts = await ctx.db
      .query("takeouts")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const takeout of takeouts) {
      await ctx.db.delete(takeout._id);
    }

    // Delete all categories
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    // Delete project
    await ctx.db.delete(args.id);
  },
});
