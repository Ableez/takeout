import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  categories: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    order: v.number(),
    isDefault: v.boolean(),
  }).index("by_project", ["projectId"]),

  takeouts: defineTable({
    projectId: v.id("projects"),
    categoryId: v.id("categories"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    order: v.number(),
    tags: v.array(v.string()),
    mentions: v.array(v.id("takeouts")),
  })
    .index("by_project", ["projectId"])
    .index("by_category", ["categoryId"]),
});
