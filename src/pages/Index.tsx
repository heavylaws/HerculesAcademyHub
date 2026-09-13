import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user.ts";
import { localMockStore } from "@/lib/local-mock-store.ts";
import PendingAccess from "./PendingAccess.tsx";
import Dashboard from "./Dashboard.tsx";
import AppLayout from "@/components/layout/app-layout.tsx";
import {
  Activity,
  ShieldCheck,
  Timer,
  User,
  DollarSign,
  Crown,
  ArrowRight,
  Mail,
  HeartPulse,
} from "lucide-react";

const isLocalDev = import.meta.env.VITE_LOCAL_DEV !== "false";

const TEST_USERS_BY_ROLE = [
  {
    id: "usr_admin",
    name: "Jane Sterling",
    email: "admin@hercules.com",
    role: "Academy Admin",
    roleBadge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    desc: "Full academy operations: athletes, rosters, schedule, staff permissions, fees & invoices",
    icon: ShieldCheck,
  },
  {
    id: "usr_coach",
    name: "Dave Miller",
    email: "dave@hercules.com",
    role: "Coach",
    roleBadge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    desc: "Team training: view assigned rosters, log session attendance, create plans",
    icon: Timer,
  },
  {
    id: "usr_athlete",
    name: "Marcus Vance",
    email: "marcus@hercules.com",
    role: "Athlete (Track & Field)",
    roleBadge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    desc: "Athlete portal: personal Sprint Elite schedule, $250 fee ledger & payment history",
    icon: User,
  },
  {
    id: "usr_guardian_mary",
    name: "Mary Vance",
    email: "mary.vance@gmail.com",
    role: "Parent / Guardian",
    roleBadge: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    desc: "Family portal: track Marcus's practice attendance, medical releases, and pay dues",
    icon: HeartPulse,
  },
  {
    id: "usr_athlete_elena",
    name: "Elena Rostova",
    email: "elena@hercules.com",
    role: "Athlete (Gymnastics)",
    roleBadge: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    desc: "Athlete portal: gymnastics team schedule, paid fees & training assessments",
    icon: User,
  },
  {
    id: "usr_accounting",
    name: "Sarah Lin",
    email: "finance@hercules.com",
    role: "Accounting",
    roleBadge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    desc: "Financial management: fee collections, record partial payments & issue invoices",
    icon: DollarSign,
  },
  {
    id: "usr_platform",
    name: "Alex Woods",
    email: "super@peakform.io",
    role: "Platform Admin",
    roleBadge: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    desc: "SaaS super-admin: oversee all 3 academies and cross-tenant currency billing",
    icon: Crown,
  },
];

function LandingScreen() {
  const [emailInput, setEmailInput] = useState("");

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const user = localMockStore.setPersonaByEmail(emailInput.trim());
    toast.success(
      `Signed in as ${user.name} (${user.role ? user.role.replace("_", " ") : "Pending Access"})`,
    );
    setEmailInput("");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Activity className="size-7" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-balance">
          PeakForm Athletics
        </h1>
        <p className="max-w-md text-muted-foreground text-balance">
          The performance and biomechanics platform for sports academies. Select
          a test user below to manually test any role:
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        {isLocalDev && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Select a Test User Account for Manual Testing</span>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEST_USERS_BY_ROLE.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Icon className="size-4 shrink-0" />
                          <span className="font-bold text-sm text-foreground">
                            {p.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${p.roleBadge}`}
                        >
                          {p.role}
                        </Badge>
                      </div>

                      <div className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded w-fit">
                        {p.email}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {p.desc}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        localMockStore.setPersona(p.id);
                        toast.success(`Signed in as ${p.name} (${p.role})`);
                      }}
                      className="w-full h-8 text-xs font-semibold gap-1.5 mt-2"
                    >
                      <span>Sign in as {p.name.split(" ")[0]}</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Manual Email Login Form */}
            <div className="flex flex-col items-center gap-2.5 w-full max-w-md pt-4 border-t mt-2">
              <span className="text-xs text-muted-foreground">
                Or test with any custom email address:
              </span>
              <form onSubmit={handleEmailLogin} className="flex gap-2 w-full">
                <Input
                  type="email"
                  placeholder="e.g. coach@hercules.com or new@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 text-xs shrink-0 gap-1.5"
                >
                  <Mail className="size-3.5" />
                  Sign In
                </Button>
              </form>
            </div>
          </div>
        )}

        {!isLocalDev && <SignInButton size="lg" signInText="Sign In" />}
      </div>
    </div>
  );
}

function IndexAuthenticated() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || user === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  if (!user || !user.role) {
    return <PendingAccess />;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

export default function Index() {
  return (
    <>
      <Unauthenticated>
        <LandingScreen />
      </Unauthenticated>
      <AuthLoading>
        <div className="flex min-h-svh items-center justify-center bg-background p-6">
          <Skeleton className="h-40 w-full max-w-md" />
        </div>
      </AuthLoading>
      <Authenticated>
        <IndexAuthenticated />
      </Authenticated>
    </>
  );
}
