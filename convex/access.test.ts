import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.ts";
import { modules } from "./test.setup.ts";
import { api } from "./_generated/api.js";
import type { Id } from "./_generated/dataModel.d.ts";
import { onboardUser } from "./lib/onboarding.ts";

type T = ReturnType<typeof convexTest>;

const now = new Date().toISOString();

/** Convex Auth identities carry "<userId>|<sessionId>" as the subject. */
function as(t: T, userId: Id<"users">) {
  return t.withIdentity({ subject: `${userId}|session` });
}

async function seed(t: T) {
  return await t.run(async (ctx) => {
    const staffId = await ctx.db.insert("users", {
      email: "admin@academy.test",
      emailVerificationTime: 1,
      role: "academy_admin",
    });
    const academyId = await ctx.db.insert("academies", {
      name: "Academy",
      slug: "academy",
      status: "active",
      createdAt: now,
    });
    const otherAcademyId = await ctx.db.insert("academies", {
      name: "Other",
      slug: "other",
      status: "active",
      createdAt: now,
    });
    await ctx.db.patch("users", staffId, { academyId });
    const athlete = (first: string, extra: object = {}) =>
      ctx.db.insert("athletes", {
        academyId,
        firstName: first,
        lastName: "Test",
        status: "active",
        createdBy: staffId,
        createdAt: now,
        ...extra,
      });
    const childId = await athlete("Child", {
      guardianEmail: "parent@family.test",
    });
    const otherChildId = await athlete("Other");
    const selfId = await athlete("Self", { email: "self@athlete.test" });
    for (const athleteId of [childId, otherChildId, selfId]) {
      await ctx.db.insert("athleteFees", {
        academyId,
        athleteId,
        label: "Dues",
        amountDue: 100,
        currency: "USD",
        dueDate: "2026-12-01",
        status: "unpaid",
        createdBy: staffId,
        createdAt: now,
      });
    }
    return {
      staffId,
      academyId,
      otherAcademyId,
      childId,
      otherChildId,
      selfId,
    };
  });
}

async function newUser(t: T, email: string, verified: boolean) {
  return await t.run((ctx) =>
    ctx.db.insert("users", {
      email,
      ...(verified ? { emailVerificationTime: Date.now() } : {}),
    }),
  );
}

describe("onboarding", () => {
  beforeEach(() => {
    process.env.PLATFORM_ADMIN_EMAILS = "owner@platform.test";
  });
  afterEach(() => {
    delete process.env.PLATFORM_ADMIN_EMAILS;
  });

  it("gives no role until the email is verified", async () => {
    const t = convexTest(schema, modules);
    const { childId } = await seed(t);
    const userId = await newUser(t, "parent@family.test", false);
    await t.run((ctx) => onboardUser(ctx, userId));
    const before = await t.run((ctx) => ctx.db.get("users", userId));
    expect(before?.role).toBeUndefined();

    await t.run((ctx) =>
      ctx.db.patch("users", userId, { emailVerificationTime: Date.now() }),
    );
    await t.run((ctx) => onboardUser(ctx, userId));
    const after = await t.run((ctx) => ctx.db.get("users", userId));
    expect(after?.role).toBe("guardian");
    const child = await t.run((ctx) => ctx.db.get("athletes", childId));
    expect(child?.guardianUserId).toBe(userId);
  });

  it("makes PLATFORM_ADMIN_EMAILS platform admins, and nobody else", async () => {
    const t = convexTest(schema, modules);
    await seed(t);
    const owner = await newUser(t, "owner@platform.test", true);
    const stranger = await newUser(t, "stranger@nowhere.test", true);
    await t.run((ctx) => onboardUser(ctx, owner));
    await t.run((ctx) => onboardUser(ctx, stranger));
    const [o, s] = await t.run(async (ctx) => [
      await ctx.db.get("users", owner),
      await ctx.db.get("users", stranger),
    ]);
    expect(o?.role).toBe("platform_admin");
    expect(s?.role).toBeUndefined();
  });

  it("links an athlete account to its athlete record", async () => {
    const t = convexTest(schema, modules);
    const { selfId } = await seed(t);
    const userId = await newUser(t, "self@athlete.test", true);
    await as(t, userId).mutation(api.users.updateCurrentUser, {});
    const user = await t.run((ctx) => ctx.db.get("users", userId));
    expect(user?.role).toBe("athlete");
    const self = await t.run((ctx) => ctx.db.get("athletes", selfId));
    expect(self?.userId).toBe(userId);
  });

  it("keeps an invite pending for an unverified account with that email", async () => {
    const t = convexTest(schema, modules);
    const { staffId, academyId } = await seed(t);
    const squatter = await newUser(t, "coach@academy.test", false);
    await as(t, staffId).mutation(api.invites.createInvite, {
      academyId,
      email: "coach@academy.test",
      role: "coach",
    });
    const user = await t.run((ctx) => ctx.db.get("users", squatter));
    expect(user?.role).toBeUndefined();
  });
});

describe("athlete data access", () => {
  async function guardianSetup() {
    const t = convexTest(schema, modules);
    const ids = await seed(t);
    const guardianId = await newUser(t, "parent@family.test", true);
    await t.run((ctx) => onboardUser(ctx, guardianId));
    return { t, ...ids, guardianId };
  }

  it("guardians only see their own children", async () => {
    const { t, guardianId, childId, otherChildId } = await guardianSetup();
    const g = as(t, guardianId);

    const list = await g.query(api.athletes.listAthletes, {});
    expect(list.map((a) => a._id)).toEqual([childId]);

    const mine = await g.query(api.athletes.listMyAthletes, {});
    expect(mine.map((a) => a._id)).toEqual([childId]);

    await expect(
      g.query(api.fees.listFeesForAthlete, { athleteId: childId }),
    ).resolves.toHaveLength(1);
    await expect(
      g.query(api.athletes.getAthlete, { athleteId: otherChildId }),
    ).rejects.toThrow();
    await expect(
      g.query(api.fees.listFeesForAthlete, { athleteId: otherChildId }),
    ).rejects.toThrow();
  });

  it("athletes cannot read another athlete's fees", async () => {
    const t = convexTest(schema, modules);
    const { selfId, otherChildId } = await seed(t);
    const userId = await newUser(t, "self@athlete.test", true);
    await t.run((ctx) => onboardUser(ctx, userId));
    const a = as(t, userId);
    await expect(
      a.query(api.fees.listFeesForAthlete, { athleteId: selfId }),
    ).resolves.toHaveLength(1);
    await expect(
      a.query(api.fees.listFeesForAthlete, { athleteId: otherChildId }),
    ).rejects.toThrow();
  });

  it("staff cannot read athletes of another academy", async () => {
    const t = convexTest(schema, modules);
    const { otherAcademyId, childId } = await seed(t);
    const outsider = await t.run((ctx) =>
      ctx.db.insert("users", {
        email: "coach@other.test",
        emailVerificationTime: 1,
        role: "coach",
        academyId: otherAcademyId,
      }),
    );
    await expect(
      as(t, outsider).query(api.fees.listFeesForAthlete, {
        athleteId: childId,
      }),
    ).rejects.toThrow();
  });

  it("unauthenticated callers are rejected", async () => {
    const t = convexTest(schema, modules);
    const { childId } = await seed(t);
    await expect(
      t.query(api.athletes.getAthlete, { athleteId: childId }),
    ).rejects.toThrow();
  });
});

describe("platform admin", () => {
  it("can work inside an academy and survives its deletion", async () => {
    const t = convexTest(schema, modules);
    const { academyId } = await seed(t);
    const adminId = await t.run((ctx) =>
      ctx.db.insert("users", {
        email: "owner@platform.test",
        emailVerificationTime: 1,
        role: "platform_admin",
      }),
    );
    const admin = as(t, adminId);

    await admin.mutation(api.academies.setActiveAcademy, { academyId });
    await admin.mutation(api.athletes.createAthlete, {
      firstName: "New",
      lastName: "Athlete",
    });
    const list = await admin.query(api.athletes.listAthletes, {});
    expect(list.some((a) => a.firstName === "New")).toBe(true);

    await admin.mutation(api.academies.deleteAcademy, { academyId });
    const after = await t.run((ctx) => ctx.db.get("users", adminId));
    expect(after?.role).toBe("platform_admin");
    expect(after?.academyId).toBeUndefined();
  });

  it("non-admins cannot switch academy", async () => {
    const t = convexTest(schema, modules);
    const { staffId, otherAcademyId } = await seed(t);
    await expect(
      as(t, staffId).mutation(api.academies.setActiveAcademy, {
        academyId: otherAcademyId,
      }),
    ).rejects.toThrow();
  });
});
