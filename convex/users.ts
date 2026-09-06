import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { requireRole, requireUser } from "./lib/auth.ts";
import { userRoleValidator } from "./schema.ts";

/**
 * Called after Hercules Auth sync. Creates the user row if new, and:
 * - if this is the very first user in the system, promotes them to platform_admin
 * - if a pending invite exists for their email, accepts it (assigns role + academy)
 * - if an athlete record matches their email, assigns athlete role and links athlete record
 * Must never take arguments; relied on by the auth callback.
 */
export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (existing !== null) {
      // If user is already registered, check if an unlinked athlete matches their email
      if (existing.email && existing.academyId) {
        const athlete = await ctx.db
          .query("athletes")
          .withIndex("by_academy_and_email", (q) =>
            q.eq("academyId", existing.academyId!).eq("email", existing.email),
          )
          .first();
        if (athlete && !athlete.userId) {
          await ctx.db.patch("athletes", athlete._id, { userId: existing._id });
        }
      }
      return existing._id;
    }

    // Determine if this is the first-ever user (platform bootstrap).
    const anyUser = await ctx.db.query("users").first();
    const isFirstUser = anyUser === null;

    // Check for a pending invite matching this email.
    const email = identity.email;
    const invite = email
      ? await ctx.db
          .query("invites")
          .withIndex("by_email_and_status", (q) =>
            q.eq("email", email).eq("status", "pending"),
          )
          .first()
      : null;

    // Check if an athlete record with this email already exists
    const athleteRecord = email
      ? await ctx.db
          .query("athletes")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first()
      : null;

    const assignedRole = isFirstUser
      ? "platform_admin"
      : invite
        ? invite.role
        : athleteRecord
          ? "athlete"
          : undefined;

    const assignedAcademyId = invite
      ? invite.academyId
      : athleteRecord
        ? athleteRecord.academyId
        : undefined;

    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      role: assignedRole,
      academyId: assignedAcademyId,
    });

    if (athleteRecord && !athleteRecord.userId) {
      await ctx.db.patch("athletes", athleteRecord._id, { userId });
    }

    if (invite) {
      await ctx.db.patch("invites", invite._id, {
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      });
    }

    return userId;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    return user;
  },
});

/** Lists staff members (coach/athlete/academy_admin) for the current user's academy. */
export const listAcademyMembers = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!user.academyId) {
      return [];
    }
    return await ctx.db
      .query("users")
      .withIndex("by_academy", (q) => q.eq("academyId", user.academyId))
      .collect();
  },
});

/**
 * Academy admin: update a staff member's role within their academy.
 */
export const updateMemberRole = mutation({
  args: {
    targetUserId: v.id("users"),
    newRole: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["academy_admin"]);
    if (!caller.academyId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "No academy" });
    }

    const targetUser = await ctx.db.get("users", args.targetUserId);
    if (!targetUser || targetUser.academyId !== caller.academyId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found in your academy",
      });
    }

    if (args.newRole === "platform_admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Cannot assign platform admin role",
      });
    }

    await ctx.db.patch("users", args.targetUserId, {
      role: args.newRole,
    });

    return null;
  },
});

/**
 * Academy admin: remove a member from their academy.
 */
export const removeAcademyMember = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const caller = await requireRole(ctx, ["academy_admin"]);
    if (!caller.academyId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "No academy" });
    }

    if (args.targetUserId === caller._id) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "You cannot remove yourself from the academy",
      });
    }

    const targetUser = await ctx.db.get("users", args.targetUserId);
    if (!targetUser || targetUser.academyId !== caller.academyId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found in your academy",
      });
    }

    // Unlink any athletes linked to this user
    const linkedAthletes = await ctx.db
      .query("athletes")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .collect();
    for (const athlete of linkedAthletes) {
      await ctx.db.patch("athletes", athlete._id, { userId: undefined });
    }

    await ctx.db.patch("users", args.targetUserId, {
      role: undefined,
      academyId: undefined,
    });

    return null;
  },
});
