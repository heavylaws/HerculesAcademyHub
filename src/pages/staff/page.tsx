import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import {
  Mail,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useCurrentUser } from "@/hooks/use-current-user.ts";
import InviteStaffDialog from "./_components/invite-staff-dialog.tsx";

const ROLE_LABEL: Record<string, string> = {
  academy_admin: "Academy Admin",
  coach: "Coach",
  athlete: "Athlete",
};

export default function Staff() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "academy_admin";

  const members = useQuery(api.users.listAcademyMembers, {});
  const invites = useQuery(api.invites.listInvites, isAdmin ? {} : "skip");
  const cancelInvite = useMutation(api.invites.cancelInvite);
  const [inviteOpen, setInviteOpen] = useState(false);

  const pendingInvites = invites?.filter((i) => i.status === "pending") ?? [];

  const handleCancelInvite = async (inviteId: Id<"invites">) => {
    try {
      await cancelInvite({ inviteId });
      toast.success("Invite cancelled");
    } catch (error) {
      toast.error(
        error instanceof ConvexError
          ? String((error.data as { message?: string }).message)
          : "Failed to cancel invite",
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Staff
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Invite and manage the coaches and athletes in your academy."
              : "Everyone in your academy."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" />
            Invite staff
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members === undefined ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>No members yet</EmptyTitle>
                <EmptyDescription>
                  {isAdmin
                    ? "Invite your first coach or athlete to get started."
                    : "Your academy has no other members yet."}
                </EmptyDescription>
              </EmptyHeader>
              {isAdmin && (
                <EmptyContent>
                  <Button size="sm" onClick={() => setInviteOpen(true)}>
                    <UserPlus className="size-4" />
                    Invite staff
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">
                        {member.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          {member.role === "academy_admin" ? (
                            <ShieldCheck className="size-2.5" />
                          ) : (
                            <UserRound className="size-2.5" />
                          )}
                          {member.role ? ROLE_LABEL[member.role] : "Unassigned"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending invites</CardTitle>
          </CardHeader>
          <CardContent>
            {invites === undefined ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pendingInvites.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Mail />
                  </EmptyMedia>
                  <EmptyTitle>No pending invites</EmptyTitle>
                  <EmptyDescription>
                    Invites you send will appear here until they're accepted.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((invite) => (
                      <TableRow key={invite._id}>
                        <TableCell className="font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ROLE_LABEL[invite.role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleCancelInvite(invite._id)}
                              >
                                <X className="size-4" />
                                Cancel invite
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <InviteStaffDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      )}
    </div>
  );
}
