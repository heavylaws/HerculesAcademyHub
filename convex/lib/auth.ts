import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server.js";
import type { Doc } from "../_generated/dataModel.d.ts";

/** Fetches the current authenticated user's row, throwing if not signed in or not onboarded. */
export async function requireUser(ctx: QueryCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "You must be signed in",
    });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "User record not found",
    });
  }
  return user;
}

/** Fetches the current user and ensures they hold one of the allowed roles. */
export async function requireRole(
  ctx: QueryCtx,
  allowed: Array<Doc<"users">["role"]>,
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (!user.role || !allowed.includes(user.role)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
  return user;
}

/** Fetches the current user and ensures they belong to the given academy (or are platform admin). */
export async function requireAcademyMember(
  ctx: QueryCtx,
  academyId: Doc<"users">["academyId"],
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role === "platform_admin") {
    return user;
  }
  if (!user.academyId || user.academyId !== academyId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "You do not have access to this academy",
    });
  }
  return user;
}
