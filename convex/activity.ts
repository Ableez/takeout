import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get activity data for a specific project
 * Returns daily activity counts for the last 6 months
 */
export const getProjectActivity = query({
  args: { projectId: v.id("projects") },
  returns: v.array(
    v.object({
      date: v.string(),
      count: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const takeouts = await ctx.db
      .query("takeouts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get last 6 months of data
    const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
    
    // Group takeouts by date
    const activityMap = new Map<string, number>();
    
    for (const takeout of takeouts) {
      if (takeout.createdAt >= sixMonthsAgo) {
        const date = new Date(takeout.createdAt);
        const dateKey = date.toISOString().split("T")[0];
        activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
      }
    }

    // Generate complete date range (last 180 days)
    const result = [];
    const today = new Date();
    
    for (let i = 179; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      
      result.push({
        date: dateKey,
        count: activityMap.get(dateKey) || 0,
      });
    }

    return result;
  },
});

/**
 * Get activity data for the current user across all projects
 * Returns daily activity counts for the last 6 months
 */
export const getUserActivity = query({
  args: {},
  returns: v.array(
    v.object({
      date: v.string(),
      count: v.number(),
    })
  ),
  handler: async (ctx, args) => {
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

    // Get all user's projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const projectIds = projects.map((p) => p._id);

    // Get all takeouts from all projects
    const allTakeouts = [];
    for (const projectId of projectIds) {
      const takeouts = await ctx.db
        .query("takeouts")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect();
      allTakeouts.push(...takeouts);
    }

    // Get last 6 months of data
    const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
    
    // Group takeouts by date
    const activityMap = new Map<string, number>();
    
    for (const takeout of allTakeouts) {
      if (takeout.createdAt >= sixMonthsAgo) {
        const date = new Date(takeout.createdAt);
        const dateKey = date.toISOString().split("T")[0];
        activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
      }
    }

    // Generate complete date range (last 180 days)
    const result = [];
    const today = new Date();
    
    for (let i = 179; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      
      result.push({
        date: dateKey,
        count: activityMap.get(dateKey) || 0,
      });
    }

    return result;
  },
});

/**
 * Get activity statistics for a project
 */
export const getProjectStats = query({
  args: { projectId: v.id("projects") },
  returns: v.object({
    totalTakeouts: v.number(),
    thisWeek: v.number(),
    thisMonth: v.number(),
    streak: v.number(),
  }),
  handler: async (ctx, args) => {
    const takeouts = await ctx.db
      .query("takeouts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const thisWeek = takeouts.filter((t) => t.createdAt >= weekAgo).length;
    const thisMonth = takeouts.filter((t) => t.createdAt >= monthAgo).length;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeDates = new Set<string>();
    for (const takeout of takeouts) {
      const date = new Date(takeout.createdAt);
      date.setHours(0, 0, 0, 0);
      activeDates.add(date.toISOString().split("T")[0]);
    }

    // Check consecutive days backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];
      
      if (activeDates.has(dateKey)) {
        streak++;
      } else if (i > 0) {
        // Allow today to be empty, but break on first empty day after
        break;
      }
    }

    return {
      totalTakeouts: takeouts.length,
      thisWeek,
      thisMonth,
      streak,
    };
  },
});

/**
 * Get activity statistics for the current user
 */
export const getUserStats = query({
  args: {},
  returns: v.object({
    totalTakeouts: v.number(),
    thisWeek: v.number(),
    thisMonth: v.number(),
    streak: v.number(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalTakeouts: 0,
        thisWeek: 0,
        thisMonth: 0,
        streak: 0,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return {
        totalTakeouts: 0,
        thisWeek: 0,
        thisMonth: 0,
        streak: 0,
      };
    }

    // Get all user's projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const projectIds = projects.map((p) => p._id);

    // Get all takeouts from all projects
    const allTakeouts = [];
    for (const projectId of projectIds) {
      const takeouts = await ctx.db
        .query("takeouts")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect();
      allTakeouts.push(...takeouts);
    }

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const thisWeek = allTakeouts.filter((t) => t.createdAt >= weekAgo).length;
    const thisMonth = allTakeouts.filter((t) => t.createdAt >= monthAgo).length;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeDates = new Set<string>();
    for (const takeout of allTakeouts) {
      const date = new Date(takeout.createdAt);
      date.setHours(0, 0, 0, 0);
      activeDates.add(date.toISOString().split("T")[0]);
    }

    // Check consecutive days backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];
      
      if (activeDates.has(dateKey)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalTakeouts: allTakeouts.length,
      thisWeek,
      thisMonth,
      streak,
    };
  },
});
