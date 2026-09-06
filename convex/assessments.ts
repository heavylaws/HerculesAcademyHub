import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { requireAcademyMember, requireRole } from "./lib/auth.ts";
import type { Doc } from "./_generated/dataModel.d.ts";

/** Trainer records a new assessment data point for an athlete. */
export const recordAssessment = mutation({
  args: {
    athleteId: v.id("athletes"),
    metric: v.string(),
    value: v.number(),
    unit: v.optional(v.string()),
    assessedOn: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["academy_admin", "coach"]);
    const athlete = await ctx.db.get("athletes", args.athleteId);
    if (!athlete) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Athlete not found",
      });
    }
    await requireAcademyMember(ctx, athlete.academyId);
    if (!args.metric.trim()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Metric name is required",
      });
    }
    return await ctx.db.insert("assessments", {
      academyId: athlete.academyId,
      athleteId: args.athleteId,
      metric: args.metric.trim(),
      value: args.value,
      unit: args.unit,
      assessedOn: args.assessedOn,
      notes: args.notes,
      createdBy: user._id,
      createdAt: new Date().toISOString(),
    });
  },
});

/** Delete a single assessment record. */
export const deleteAssessment = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["academy_admin", "coach"]);
    const record = await ctx.db.get("assessments", args.assessmentId);
    if (!record) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Assessment not found",
      });
    }
    await requireAcademyMember(ctx, record.academyId);
    await ctx.db.delete("assessments", args.assessmentId);
    return null;
  },
});

/**
 * Returns all assessments for an athlete, grouped by metric.
 * Each metric entry contains the sorted data points for charting.
 */
export const listAssessmentsForAthlete = query({
  args: { athleteId: v.id("athletes") },
  handler: async (
    ctx,
    args,
  ): Promise<
    Array<{
      metric: string;
      unit: string | undefined;
      points: Array<{
        _id: string;
        assessedOn: string;
        value: number;
        notes: string | undefined;
      }>;
    }>
  > => {
    const athlete = await ctx.db.get("athletes", args.athleteId);
    if (!athlete) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Athlete not found",
      });
    }
    await requireAcademyMember(ctx, athlete.academyId);

    const records = await ctx.db
      .query("assessments")
      .withIndex("by_athlete_and_assessedOn", (q) =>
        q.eq("athleteId", args.athleteId),
      )
      .order("asc")
      .collect();

    // Group by metric
    const byMetric = new Map<
      string,
      { unit: string | undefined; points: Doc<"assessments">[] }
    >();
    for (const r of records) {
      const entry = byMetric.get(r.metric);
      if (entry) {
        entry.points.push(r);
        // prefer the most recent unit if provided
        if (r.unit) entry.unit = r.unit;
      } else {
        byMetric.set(r.metric, { unit: r.unit, points: [r] });
      }
    }

    return Array.from(byMetric.entries()).map(([metric, { unit, points }]) => ({
      metric,
      unit,
      points: points.map((p) => ({
        _id: p._id,
        assessedOn: p.assessedOn,
        value: p.value,
        notes: p.notes,
      })),
    }));
  },
});
