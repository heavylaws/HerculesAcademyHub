import { useState, useEffect, useCallback } from "react";
import * as HerculesAuth from "@usehercules/auth/react";
import { localMockStore } from "@/lib/local-mock-store.ts";

const isLocalDev = import.meta.env.VITE_USE_EXTERNAL_AUTH !== "true";

export interface LocalAuthUser {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  profile?: {
    sub?: string;
    name?: string;
    email?: string;
  };
}

function useLocalAuth() {
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    return localMockStore.subscribeAuth(() => {
      setAuthTick((t) => t + 1);
    });
  }, []);

  void authTick;

  const currentUser = localMockStore.getCurrentUser();
  const isAuthenticated = localMockStore.isAuthenticated();

  const signin = useCallback(async () => {
    // Default to Super Admin Ahmad Baalbaki
    localMockStore.setPersona("usr_super_admin");
  }, []);

  const signinWithPassword = useCallback(
    async (email: string, password: string) => {
      const res = localMockStore.authenticateWithPassword(email, password);
      if (!res.success) {
        throw new Error(res.error || "Authentication failed");
      }
      return res.user;
    },
    [],
  );

  const signout = useCallback(async () => {
    localMockStore.setPersona(null);
  }, []);

  return {
    isAuthenticated,
    isLoading: false,
    error: null,
    user: currentUser
      ? {
          profile: {
            sub: currentUser.tokenIdentifier,
            name: currentUser.name,
            email: currentUser.email,
          },
        }
      : null,
    signin,
    signinWithPassword,
    signout,
    signinRedirect: signin,
    signoutRedirect: signout,
    removeUser: signout,
  };
}

function useLiveAuth() {
  return HerculesAuth.useAuth();
}

export function useAuth() {
  if (isLocalDev) {
    // isLocalDev is constant for the lifetime of the process, satisfying rules of hooks
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalAuth();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLiveAuth();
}

function useLocalUser(): LocalAuthUser {
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    return localMockStore.subscribeAuth(() => {
      setAuthTick((t) => t + 1);
    });
  }, []);

  void authTick;

  const currentUser = localMockStore.getCurrentUser();
  const isAuthenticated = localMockStore.isAuthenticated();

  return {
    id: currentUser?._id,
    name: currentUser?.name,
    email: currentUser?.email,
    isAuthenticated,
    isLoading: false,
    error: null,
    profile: currentUser
      ? {
          sub: currentUser.tokenIdentifier,
          name: currentUser.name,
          email: currentUser.email,
        }
      : undefined,
  };
}

function useLiveUser(): LocalAuthUser {
  return HerculesAuth.useUser() as LocalAuthUser;
}

export function useUser(): LocalAuthUser {
  if (isLocalDev) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLocalUser();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLiveUser();
}
