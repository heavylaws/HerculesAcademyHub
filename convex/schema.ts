import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { academies } from "./schema/academies.ts";
import { invites, userRoleValidator } from "./schema/invites.ts";
import { athletes, athleteGenderValidator } from "./schema/athletes.ts";
import { teams, teamMembers } from "./schema/teams.ts";
import {
  trainingSessions,
  attendanceRecords,
  attendanceStatusValidator,
} from "./schema/trainingSessions.ts";
import {
  trainingPlans,
  planItems,
  planStatusValidator,
} from "./schema/trainingPlans.ts";
import { assessments } from "./schema/assessments.ts";
import { videoAnalyses } from "./schema/videoAnalyses.ts";
import { athleteFees, feePayments, feeStatusValidator } from "./schema/fees.ts";
import { invoices, invoiceStatusValidator } from "./schema/invoices.ts";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(userRoleValidator),
    academyId: v.optional(v.id("academies")),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_academy", ["academyId"])
    .index("by_email", ["email"]),

  academies,
  invites,
  athletes,
  teams,
  teamMembers,
  trainingSessions,
  attendanceRecords,
  trainingPlans,
  planItems,
  assessments,
  videoAnalyses,
  athleteFees,
  feePayments,
  invoices,
});

export {
  userRoleValidator,
  athleteGenderValidator,
  attendanceStatusValidator,
  planStatusValidator,
  feeStatusValidator,
  invoiceStatusValidator,
};
