import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
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
} from "lucide-react";

const isLocalDev = import.meta.env.VITE_LOCAL_DEV !== "false";

const QUICK_PERSONAS = [
  {
    id: "usr_admin",
    name: "Jane Sterling",
    role: "Academy Admin",
    desc: "Manage roster, teams, staff, fees, invoices & schedule",
    icon: ShieldCheck,
  },
  {
    id: "usr_coach",
    name: "Dave Miller",
    role: "Coach",
    desc: "Schedule sessions, log attendance, design training plans",
    icon: Timer,
  },
  {
    id: "usr_athlete",
    name: "Marcus Vance",
    role: "Athlete (Sprinter)",
    desc: "View personal schedule, training plans & fee invoices",
    icon: User,
  },
  {
    id: "usr_accounting",
    name: "Sarah Lin",
    role: "Accounting",
    desc: "Track membership dues, record partial payments & invoices",
    icon: DollarSign,
  },
  {
    id: "usr_platform",
    name: "Alex Woods",
    role: "Platform Admin",
    desc: "Super-admin overview of all academies and platform billing",
    icon: Crown,
  },
];

function LandingScreen() {
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
          The performance and biomechanics platform for sports academies. Manage
          staff, athletes, and assessments in one secure workspace.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
        <SignInButton size="lg" signInText="Sign in as Admin" />

        {isLocalDev && (
          <div className="mt-6 flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Quick Start with Demo Personas</span>
            </div>
            <div className="grid w-full gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_PERSONAS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => localMockStore.setPersona(p.id)}
                    className="flex flex-col items-start gap-1.5 rounded-xl border border-border/70 bg-card p-3.5 text-left transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="size-4" />
                      <span className="font-semibold text-xs text-foreground">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground/80 leading-snug">
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
