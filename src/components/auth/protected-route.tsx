import { Navigate } from "react-router-dom";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import AppLayout from "@/components/layout/app-layout.tsx";
import { useCurrentUser, type UserRole } from "@/hooks/use-current-user.ts";
import { Activity } from "lucide-react";

function SignInScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Activity className="size-7" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          PeakForm Athletics
        </h1>
      </div>
      <SignInButton size="lg" signInText="Sign in to continue" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Skeleton className="h-40 w-full max-w-md" />
    </div>
  );
}

/** Wraps a page that requires sign-in and one of the given roles. Renders inside AppLayout on success. */
export default function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: UserRole[];
}) {
  return (
    <>
      <Unauthenticated>
        <SignInScreen />
      </Unauthenticated>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>
      <Authenticated>
        <RoleGate allow={allow}>{children}</RoleGate>
      </Authenticated>
    </>
  );
}

function RoleGate({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: UserRole[];
}) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || user === undefined) {
    return <LoadingScreen />;
  }
  if (!user || !user.role || !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}
