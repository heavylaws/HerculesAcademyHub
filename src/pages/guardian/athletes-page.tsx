import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import {
  UserRound,
  Shield,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  HeartPulse,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { useCurrentUser } from "@/hooks/use-current-user.ts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function GuardianAthletesPage() {
  const { user } = useCurrentUser();
  const allAthletesData = useQuery(api.athletes.listAthletes, {});
  const teamsData = useQuery(api.teams.listTeams);

  // Find athletes linked to this guardian
  const myAthletes = useMemo(() => {
    if (!user) return [];
    return (allAthletesData ?? []).filter((a) => {
      if (a.guardianUserId && a.guardianUserId === user._id) return true;
      if (
        a.guardianEmail &&
        user.email &&
        a.guardianEmail.toLowerCase() === user.email.toLowerCase()
      ) {
        return true;
      }
      if (
        a.guardianName &&
        user.name &&
        a.guardianName.toLowerCase() === user.name.toLowerCase()
      ) {
        return true;
      }
      return false;
    });
  }, [allAthletesData, user]);

  const teamMap = useMemo(() => {
    return new Map((teamsData ?? []).map((t) => [t._id, t.name]));
  }, [teamsData]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <HeartPulse className="size-6 text-primary" />
              Family & Guardian Portal
            </h1>
            <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Verified Guardian
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of your registered minor athletes, practice attendance, safety records, and academy dues.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link to="/finance/my-fees">
            <DollarSign className="size-3.5 text-emerald-500" />
            Manage Academy Fees
          </Link>
        </Button>
      </div>

      {/* Guardian Profile Quick Summary */}
      <Card className="bg-card/40 backdrop-blur-sm border-border">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0] ?? "G"}
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{user?.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="size-3" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="size-3" />
                  Guardian on file
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Emergency medical release & liability waiver on file for 2026</span>
          </div>
        </CardContent>
      </Card>

      {/* Linked Athletes List */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <UserRound className="size-4 text-primary" />
          Registered Athletes ({myAthletes.length})
        </h2>

        {myAthletes.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            <UserRound className="size-8 mx-auto mb-2 opacity-50" />
            No athletes linked to this guardian account yet. Please contact academy staff.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myAthletes.map((athlete) => (
              <Card key={athlete._id} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {athlete.firstName} {athlete.lastName}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                        <span>{athlete.sport ?? "Track & Field"}</span>
                        <span>•</span>
                        <span>DOB: {athlete.dateOfBirth ?? "2004-05-12"}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20 text-xs">
                      {athlete.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-xs">
                  {/* Stats highlights */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/30 border text-center">
                    <div>
                      <div className="text-muted-foreground text-[11px]">Attendance</div>
                      <div className="font-bold text-sm text-emerald-500">100%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">Enrolled</div>
                      <div className="font-bold text-sm text-foreground">Sprint Elite</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">Records</div>
                      <div className="font-bold text-sm text-amber-500">5 PBs</div>
                    </div>
                  </div>

                  {/* Coach & Practice Info */}
                  <div className="flex flex-col gap-1.5 text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Head Coach:</span>
                      <span className="font-medium text-foreground">Dave Miller (Track & Field)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Next Practice:</span>
                      <span className="font-medium text-foreground">Thu, Sep 10 · 4:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Check-In PIN:</span>
                      <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                        {athlete.checkInPin ?? "1024"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button asChild size="sm" className="flex-1 text-xs gap-1">
                      <Link to={`/athletes/${athlete._id}`}>
                        <Sparkles className="size-3.5" />
                        View Performance & PBs
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs gap-1">
                      <Link to="/finance/my-fees">
                        <DollarSign className="size-3.5 text-emerald-500" />
                        Pay Fees
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
