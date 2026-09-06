import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { requireRole, requireUser } from "./lib/auth.ts";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Platform admin: create a new academy workspace. */
export const createAcademy = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["platform_admin"]);
    const baseSlug = slugify(args.name);
    if (!baseSlug) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid academy name",
      });
    }
    let slug = baseSlug;
    let suffix = 1;
    while (
      await ctx.db
        .query("academies")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }
    return await ctx.db.insert("academies", {
      name: args.name,
      slug,
      status: "active",
      createdBy: admin._id,
      createdAt: new Date().toISOString(),
    });
  },
});

/** Platform admin: list every academy on the platform. */
export const listAcademies = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["platform_admin"]);
    return await ctx.db.query("academies").order("desc").collect();
  },
});

/** Platform admin: toggle an academy's active/suspended status. */
export const setAcademyStatus = mutation({
  args: {
    academyId: v.id("academies"),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin"]);
    await ctx.db.patch("academies", args.academyId, { status: args.status });
    return null;
  },
});

/** Platform admin: permanently delete an academy and all its data. */
export const deleteAcademy = mutation({
  args: { academyId: v.id("academies") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin"]);
    const { academyId } = args;

    // Delete all athletes in the academy
    const athletes = await ctx.db
      .query("athletes")
      .withIndex("by_academy_and_status", (q) => q.eq("academyId", academyId))
      .collect();
    for (const athlete of athletes) {
      await ctx.db.delete("athletes", athlete._id);
    }

    // Delete teams and their sessions, attendance, memberships
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_academy", (q) => q.eq("academyId", academyId))
      .collect();
    for (const team of teams) {
      const members = await ctx.db
        .query("teamMembers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      for (const m of members) await ctx.db.delete("teamMembers", m._id);

      const sessions = await ctx.db
        .query("trainingSessions")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      for (const s of sessions) {
        const records = await ctx.db
          .query("attendanceRecords")
          .withIndex("by_session", (q) => q.eq("sessionId", s._id))
          .collect();
        for (const r of records)
          await ctx.db.delete("attendanceRecords", r._id);
        await ctx.db.delete("trainingSessions", s._id);
      }
      await ctx.db.delete("teams", team._id);
    }

    // Delete pending invites
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_academy", (q) => q.eq("academyId", academyId))
      .collect();
    for (const inv of invites) await ctx.db.delete("invites", inv._id);

    // Remove academy reference from staff users
    const staffUsers = await ctx.db
      .query("users")
      .withIndex("by_academy", (q) => q.eq("academyId", academyId))
      .collect();
    for (const u of staffUsers) {
      await ctx.db.patch("users", u._id, {
        academyId: undefined,
        role: undefined,
      });
    }

    // Delete the academy itself
    await ctx.db.delete("academies", academyId);
    return null;
  },
});

/** Returns the current user's own academy (any authenticated academy member). */
export const getMyAcademy = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!user.academyId) {
      return null;
    }
    return await ctx.db.get("academies", user.academyId);
  },
});
