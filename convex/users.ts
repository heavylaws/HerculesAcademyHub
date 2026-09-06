import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { requireUser } from "./lib/auth.ts";

/**
 * Called after Hercules Auth sync. Creates the user row if new, and:
 * - if this is the very first user in the system, promotes them to platform_admin
 * - if a pending invite exists for their email, accepts it (assigns role + academy)
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

    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      role: isFirstUser ? "platform_admin" : invite ? invite.role : undefined,
      academyId: invite ? invite.academyId : undefined,
    });

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
