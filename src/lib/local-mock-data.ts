// Local mock seed data for offline and local testing

export interface MockAcademy {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  nextInvoiceNumber?: number;
  createdAt: string;
}

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  role?:
    "platform_admin" | "academy_admin" | "coach" | "athlete" | "accounting";
  academyId?: string;
  tokenIdentifier: string;
}

export interface MockAthlete {
  _id: string;
  academyId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  sport?: string;
  heightCm?: number;
  weightKg?: number;
  email?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  status: "active" | "inactive";
  createdBy?: string;
  createdAt: string;
}

export interface MockTeam {
  _id: string;
  academyId: string;
  name: string;
  sport?: string;
  createdBy?: string;
  createdAt: string;
}

export interface MockTeamMember {
  _id: string;
  teamId: string;
  athleteId: string;
  joinedAt: string;
}

export interface MockTrainingSession {
  _id: string;
  academyId: string;
  teamId: string;
  title: string;
  startsAt: string; // ISO 8601
  durationMinutes: number;
  location?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface MockAttendanceRecord {
  _id: string;
  sessionId: string;
  athleteId: string;
  status: "present" | "late" | "excused" | "absent";
  markedAt: string;
  markedBy: string;
}

export interface MockTrainingPlan {
  _id: string;
  academyId: string;
  athleteId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: "active" | "completed" | "archived";
  createdBy: string;
  createdAt: string;
}

export interface MockPlanItem {
  _id: string;
  planId: string;
  exercise: string;
  target?: string;
  order: number;
  completed: boolean;
  notes?: string;
  result?: string;
}

export interface MockAssessment {
  _id: string;
  academyId: string;
  athleteId: string;
  metric: string;
  value: number;
  unit: string;
  assessedOn: string;
  notes?: string;
  conductedBy: string;
  createdAt: string;
}

export interface MockAthleteFee {
  _id: string;
  academyId: string;
  athleteId: string;
  label: string;
  amountDue: number;
  currency: string;
  dueDate: string;
  status: "unpaid" | "partially_paid" | "paid" | "waived";
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MockFeePayment {
  _id: string;
  feeId: string;
  amountPaid: number;
  paidAt: string;
  recordedBy: string;
  notes?: string;
}

export interface MockInvoice {
  _id: string;
  academyId: string;
  athleteId?: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  note?: string;
  issuedAt: string;
  paidAt?: string;
  createdBy: string;
}

export interface MockInvite {
  _id: string;
  academyId: string;
  email: string;
  role: "academy_admin" | "coach" | "athlete" | "accounting";
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
}

// Generate dates relative to today for realistic schedule rendering
const now = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const todayStr = toDateStr(now);

const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const yesterdayStr = toDateStr(yesterday);

const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
const tomorrowStr = toDateStr(tomorrow);

const dayAfter = new Date(now);
dayAfter.setDate(now.getDate() + 2);
const dayAfterStr = toDateStr(dayAfter);

const threeDaysLater = new Date(now);
threeDaysLater.setDate(now.getDate() + 3);
const threeDaysLaterStr = toDateStr(threeDaysLater);

export const SEED_ACADEMIES: MockAcademy[] = [
  {
    _id: "acad_hercules",
    name: "Hercules Academy",
    slug: "hercules",
    status: "active",
    nextInvoiceNumber: 4,
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    _id: "acad_olympus",
    name: "Olympus Sports Institute",
    slug: "olympus",
    status: "active",
    nextInvoiceNumber: 1,
    createdAt: "2026-02-01T08:00:00.000Z",
  },
  {
    _id: "acad_titan",
    name: "Titan Track & Field",
    slug: "titan",
    status: "suspended",
    nextInvoiceNumber: 1,
    createdAt: "2026-03-15T08:00:00.000Z",
  },
];

export const SEED_USERS: MockUser[] = [
  {
    _id: "usr_admin",
    name: "Jane Sterling",
    email: "admin@hercules.com",
    role: "academy_admin",
    academyId: "acad_hercules",
    tokenIdentifier: "mock|user_admin",
  },
  {
    _id: "usr_coach",
    name: "Dave Miller",
    email: "dave@hercules.com",
    role: "coach",
    academyId: "acad_hercules",
    tokenIdentifier: "mock|user_coach",
  },
  {
    _id: "usr_athlete",
    name: "Marcus Vance",
    email: "marcus@hercules.com",
    role: "athlete",
    academyId: "acad_hercules",
    tokenIdentifier: "mock|user_athlete",
  },
  {
    _id: "usr_accounting",
    name: "Sarah Lin",
    email: "finance@hercules.com",
    role: "accounting",
    academyId: "acad_hercules",
    tokenIdentifier: "mock|user_accounting",
  },
  {
    _id: "usr_platform",
    name: "Alex Woods",
    email: "super@peakform.io",
    role: "platform_admin",
    tokenIdentifier: "mock|user_platform",
  },
  {
    _id: "usr_athlete_elena",
    name: "Elena Rostova",
    email: "elena@hercules.com",
    role: "athlete",
    academyId: "acad_hercules",
    tokenIdentifier: "mock|user_athlete_elena",
  },
];

export const SEED_ATHLETES: MockAthlete[] = [
  {
    _id: "ath_marcus",
    academyId: "acad_hercules",
    userId: "usr_athlete",
    firstName: "Marcus",
    lastName: "Vance",
    dateOfBirth: "2004-05-12",
    gender: "male",
    sport: "Track & Field",
    heightCm: 185,
    weightKg: 78,
    email: "marcus@hercules.com",
    phone: "+1-555-0191",
    guardianName: "Mary Vance",
    guardianPhone: "+1-555-0199",
    notes: "Elite 100m/200m sprinter. Preparing for regional championships.",
    status: "active",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    _id: "ath_elena",
    academyId: "acad_hercules",
    userId: "usr_athlete_elena",
    firstName: "Elena",
    lastName: "Rostova",
    dateOfBirth: "2006-03-22",
    gender: "female",
    sport: "Gymnastics",
    heightCm: 162,
    weightKg: 52,
    email: "elena@hercules.com",
    phone: "+1-555-0142",
    guardianName: "Igor Rostov",
    guardianPhone: "+1-555-0144",
    notes: "National junior champion on balance beam and vault.",
    status: "active",
    createdAt: "2026-01-20T11:00:00.000Z",
  },
  {
    _id: "ath_jamal",
    academyId: "acad_hercules",
    firstName: "Jamal",
    lastName: "Washington",
    dateOfBirth: "2005-09-18",
    gender: "male",
    sport: "Basketball",
    heightCm: 196,
    weightKg: 88,
    email: "jamal@hercules.com",
    phone: "+1-555-0181",
    guardianName: "Tanya Washington",
    guardianPhone: "+1-555-0182",
    notes: "Point guard with high vertical explosiveness.",
    status: "active",
    createdAt: "2026-02-01T09:30:00.000Z",
  },
  {
    _id: "ath_sophia",
    academyId: "acad_hercules",
    firstName: "Sophia",
    lastName: "Chen",
    dateOfBirth: "2007-11-04",
    gender: "female",
    sport: "Swimming",
    heightCm: 174,
    weightKg: 64,
    email: "sophia@hercules.com",
    phone: "+1-555-0162",
    guardianName: "David Chen",
    guardianPhone: "+1-555-0163",
    notes: "Freestyle sprinter focusing on flip turn velocity.",
    status: "active",
    createdAt: "2026-02-10T14:00:00.000Z",
  },
  {
    _id: "ath_liam",
    academyId: "acad_hercules",
    firstName: "Liam",
    lastName: "Gallagher",
    dateOfBirth: "2003-01-30",
    gender: "male",
    sport: "Track & Field",
    heightCm: 182,
    weightKg: 75,
    email: "liam@hercules.com",
    phone: "+1-555-0177",
    notes: "On medical hiatus recovery (hamstring strain).",
    status: "inactive",
    createdAt: "2026-02-15T15:00:00.000Z",
  },
];

export const SEED_TEAMS: MockTeam[] = [
  {
    _id: "team_sprint",
    academyId: "acad_hercules",
    name: "Sprint Elite",
    sport: "Track & Field",
    createdBy: "usr_coach",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    _id: "team_gymnastics",
    academyId: "acad_hercules",
    name: "Artistic Gymnastics A",
    sport: "Gymnastics",
    createdBy: "usr_admin",
    createdAt: "2026-01-16T10:00:00.000Z",
  },
  {
    _id: "team_aquatics",
    academyId: "acad_hercules",
    name: "Aquatics Performance",
    sport: "Swimming",
    createdBy: "usr_admin",
    createdAt: "2026-01-18T10:00:00.000Z",
  },
];

export const SEED_TEAM_MEMBERS: MockTeamMember[] = [
  {
    _id: "tm_1",
    teamId: "team_sprint",
    athleteId: "ath_marcus",
    joinedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    _id: "tm_2",
    teamId: "team_sprint",
    athleteId: "ath_liam",
    joinedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    _id: "tm_3",
    teamId: "team_gymnastics",
    athleteId: "ath_elena",
    joinedAt: "2026-01-20T11:00:00.000Z",
  },
  {
    _id: "tm_4",
    teamId: "team_aquatics",
    athleteId: "ath_sophia",
    joinedAt: "2026-02-10T14:00:00.000Z",
  },
];

export const SEED_TRAINING_SESSIONS: MockTrainingSession[] = [
  {
    _id: "sess_today_1",
    academyId: "acad_hercules",
    teamId: "team_sprint",
    title: "Max Velocity Sprints & Acceleration",
    startsAt: `${todayStr}T09:00:00.000Z`,
    durationMinutes: 90,
    location: "Main Track (Lanes 1-4)",
    notes: "Focus on first 30m drive phase and hip recovery angles.",
    createdBy: "usr_coach",
    createdAt: "2026-03-01T08:00:00.000Z",
  },
  {
    _id: "sess_today_2",
    academyId: "acad_hercules",
    teamId: "team_gymnastics",
    title: "Balance Beam Routine & Dismounts",
    startsAt: `${todayStr}T14:00:00.000Z`,
    durationMinutes: 90,
    location: "Gym Hall B",
    notes: "Choreography refinement and landing stabilization.",
    createdBy: "usr_admin",
    createdAt: "2026-03-01T08:30:00.000Z",
  },
  {
    _id: "sess_tomorrow_1",
    academyId: "acad_hercules",
    teamId: "team_sprint",
    title: "Sprint Mechanics & Block Starts",
    startsAt: `${tomorrowStr}T10:00:00.000Z`,
    durationMinutes: 75,
    location: "Main Track",
    notes: "Electronic timing gate measurements on 10m/20m splits.",
    createdBy: "usr_coach",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    _id: "sess_tomorrow_2",
    academyId: "acad_hercules",
    teamId: "team_aquatics",
    title: "Cardio & Threshold Intervals",
    startsAt: `${tomorrowStr}T16:00:00.000Z`,
    durationMinutes: 90,
    location: "Olympic Pool",
    notes: "10x100m on 1:30 interval pacing.",
    createdBy: "usr_admin",
    createdAt: "2026-03-01T09:30:00.000Z",
  },
  {
    _id: "sess_upcoming_1",
    academyId: "acad_hercules",
    teamId: "team_sprint",
    title: "Plyometrics & Power Development",
    startsAt: `${dayAfterStr}T09:30:00.000Z`,
    durationMinutes: 60,
    location: "Performance Weight Room",
    notes: "Box jumps, hex bar deadlifts, and medicine ball chest passes.",
    createdBy: "usr_coach",
    createdAt: "2026-03-02T10:00:00.000Z",
  },
  {
    _id: "sess_upcoming_2",
    academyId: "acad_hercules",
    teamId: "team_gymnastics",
    title: "Floor Exercise High-Impact Acro",
    startsAt: `${threeDaysLaterStr}T15:00:00.000Z`,
    durationMinutes: 120,
    location: "Main Gym",
    notes: "Full routine run-through with video analysis replay.",
    createdBy: "usr_admin",
    createdAt: "2026-03-02T10:30:00.000Z",
  },
  {
    _id: "sess_yesterday",
    academyId: "acad_hercules",
    teamId: "team_sprint",
    title: "Conditioning & Core Strength",
    startsAt: `${yesterdayStr}T10:00:00.000Z`,
    durationMinutes: 60,
    location: "Gym Hall A",
    notes: "Active mobility recovery session.",
    createdBy: "usr_coach",
    createdAt: "2026-02-28T08:00:00.000Z",
  },
];

export const SEED_ATTENDANCE: MockAttendanceRecord[] = [
  {
    _id: "att_1",
    sessionId: "sess_yesterday",
    athleteId: "ath_marcus",
    status: "present",
    markedAt: `${yesterdayStr}T10:05:00.000Z`,
    markedBy: "usr_coach",
  },
  {
    _id: "att_2",
    sessionId: "sess_yesterday",
    athleteId: "ath_liam",
    status: "absent",
    markedAt: `${yesterdayStr}T10:05:00.000Z`,
    markedBy: "usr_coach",
  },
];

export const SEED_TRAINING_PLANS: MockTrainingPlan[] = [
  {
    _id: "plan_marcus_olympic",
    academyId: "acad_hercules",
    athleteId: "ath_marcus",
    title: "Olympic Qualifiers Preparation 2026",
    description: "Periodized microcycle targeting sub-10.15s 100m sprint form.",
    startDate: "2026-08-01",
    endDate: "2026-10-31",
    status: "active",
    createdBy: "usr_coach",
    createdAt: "2026-08-01T08:00:00.000Z",
  },
];

export const SEED_PLAN_ITEMS: MockPlanItem[] = [
  {
    _id: "pitem_1",
    planId: "plan_marcus_olympic",
    exercise: "30m Flying Sprints",
    target: "Split under 3.12s",
    order: 1,
    completed: true,
    result: "3.08s (PB)",
    notes: "Clean transition out of bend.",
  },
  {
    _id: "pitem_2",
    planId: "plan_marcus_olympic",
    exercise: "Barbell Hip Thrust",
    target: "3 sets x 8 reps @ 160 kg",
    order: 2,
    completed: false,
    notes: "Ensure full hip extension at top lock.",
  },
  {
    _id: "pitem_3",
    planId: "plan_marcus_olympic",
    exercise: "Single-leg Bound Test",
    target: "Distance > 2.85m",
    order: 3,
    completed: false,
  },
];

export const SEED_ASSESSMENTS: MockAssessment[] = [
  {
    _id: "ass_1",
    academyId: "acad_hercules",
    athleteId: "ath_marcus",
    metric: "10m Acceleration Split",
    value: 1.72,
    unit: "s",
    assessedOn: "2026-09-02",
    notes: "Laser timed block start.",
    conductedBy: "Dave Miller",
    createdAt: "2026-09-02T11:00:00.000Z",
  },
  {
    _id: "ass_2",
    academyId: "acad_hercules",
    athleteId: "ath_marcus",
    metric: "Vertical Jump",
    value: 74,
    unit: "cm",
    assessedOn: "2026-08-20",
    notes: "Jump mat test with arms swing.",
    conductedBy: "Dave Miller",
    createdAt: "2026-08-20T10:00:00.000Z",
  },
  {
    _id: "ass_3",
    academyId: "acad_hercules",
    athleteId: "ath_elena",
    metric: "Vault Flight Time",
    value: 0.94,
    unit: "s",
    assessedOn: "2026-08-28",
    conductedBy: "Jane Sterling",
    createdAt: "2026-08-28T14:00:00.000Z",
  },
  {
    _id: "ass_4",
    academyId: "acad_hercules",
    athleteId: "ath_sophia",
    metric: "100m Free Time Trial",
    value: 54.8,
    unit: "s",
    assessedOn: "2026-08-30",
    conductedBy: "Jane Sterling",
    createdAt: "2026-08-30T16:00:00.000Z",
  },
];

export const SEED_FEES: MockAthleteFee[] = [
  {
    _id: "fee_1",
    academyId: "acad_hercules",
    athleteId: "ath_marcus",
    label: "Q3 Training & Coaching Fee",
    amountDue: 450,
    currency: "USD",
    dueDate: "2026-09-30",
    status: "partially_paid",
    notes: "$200 initial installment paid on Sept 1st.",
    createdBy: "usr_accounting",
    createdAt: "2026-08-20T09:00:00.000Z",
  },
  {
    _id: "fee_2",
    academyId: "acad_hercules",
    athleteId: "ath_elena",
    label: "Fall Equipment & Uniform Kit",
    amountDue: 180,
    currency: "USD",
    dueDate: "2026-09-15",
    status: "paid",
    createdBy: "usr_accounting",
    createdAt: "2026-08-22T09:00:00.000Z",
  },
  {
    _id: "fee_3",
    academyId: "acad_hercules",
    athleteId: "ath_jamal",
    label: "Annual Registration 2026",
    amountDue: 250,
    currency: "USD",
    dueDate: "2026-09-01",
    status: "unpaid",
    notes: "Reminder sent.",
    createdBy: "usr_accounting",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    _id: "fee_4",
    academyId: "acad_hercules",
    athleteId: "ath_sophia",
    label: "Competition Entry - Regional Open",
    amountDue: 120,
    currency: "USD",
    dueDate: "2026-10-10",
    status: "unpaid",
    createdBy: "usr_accounting",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
];

export const SEED_FEE_PAYMENTS: MockFeePayment[] = [
  {
    _id: "pay_1",
    feeId: "fee_1",
    amountPaid: 200,
    paidAt: "2026-09-01T14:30:00.000Z",
    recordedBy: "usr_accounting",
    notes: "First installment via card",
  },
  {
    _id: "pay_2",
    feeId: "fee_2",
    amountPaid: 180,
    paidAt: "2026-08-25T11:00:00.000Z",
    recordedBy: "usr_accounting",
    notes: "Full payment via bank transfer",
  },
];

export const SEED_INVOICES: MockInvoice[] = [
  {
    _id: "inv_1",
    academyId: "acad_hercules",
    athleteId: "ath_marcus",
    invoiceNumber: "INV-0001",
    description: "September Coaching & High-Performance Facility Access",
    amount: 450,
    currency: "USD",
    dueDate: "2026-09-30",
    status: "sent",
    issuedAt: "2026-09-01T09:00:00.000Z",
    createdBy: "usr_accounting",
    note: "Net-30 payment terms.",
  },
  {
    _id: "inv_2",
    academyId: "acad_hercules",
    athleteId: "ath_elena",
    invoiceNumber: "INV-0002",
    description: "Fall Competition Leotard & Travel Tracksuit",
    amount: 180,
    currency: "USD",
    dueDate: "2026-09-15",
    status: "paid",
    issuedAt: "2026-08-22T10:00:00.000Z",
    paidAt: "2026-08-25T11:00:00.000Z",
    createdBy: "usr_accounting",
  },
  {
    _id: "inv_3",
    academyId: "acad_hercules",
    athleteId: "ath_jamal",
    invoiceNumber: "INV-0003",
    description: "2026 Academy Membership Dues",
    amount: 250,
    currency: "USD",
    dueDate: "2026-09-15",
    status: "draft",
    issuedAt: "2026-09-02T15:00:00.000Z",
    createdBy: "usr_accounting",
  },
];

export const SEED_INVITES: MockInvite[] = [
  {
    _id: "inv_staff_1",
    academyId: "acad_hercules",
    email: "coach.pat@hercules.com",
    role: "coach",
    status: "pending",
    invitedBy: "usr_admin",
    expiresAt: "2026-09-30T23:59:59.000Z",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
];
