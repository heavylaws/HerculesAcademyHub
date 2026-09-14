import { HerculesAuthProvider } from "@usehercules/auth/react";

const isLocalDev = import.meta.env.VITE_USE_EXTERNAL_AUTH !== "true";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isLocalDev) {
    return <>{children}</>;
  }

  const authority = import.meta.env.VITE_HERCULES_OIDC_AUTHORITY;
  const client_id = import.meta.env.VITE_HERCULES_OIDC_CLIENT_ID;

  return (
    <HerculesAuthProvider
      authority={authority!}
      client_id={client_id!}
      userManagerSettings={{
        authority,
        client_id,
        prompt: import.meta.env.VITE_HERCULES_OIDC_PROMPT ?? "select_account",
        response_type:
          import.meta.env.VITE_HERCULES_OIDC_RESPONSE_TYPE ?? "code",
        scope:
          import.meta.env.VITE_HERCULES_OIDC_SCOPE ??
          "openid profile email offline_access",
        redirect_uri:
          import.meta.env.VITE_HERCULES_OIDC_REDIRECT_URI ??
          `${window.location.origin}/auth/callback`,
      }}
    >
      {children}
    </HerculesAuthProvider>
  );
}
