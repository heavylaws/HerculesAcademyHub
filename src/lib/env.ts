/**
 * Mock mode (localStorage-backed Convex client + persona auth) is opt-in.
 * Set VITE_LOCAL_DEV=true in .env.local for local development; any other
 * value (or unset) builds against live Convex + Hercules Auth.
 */
export const isLocalDev = import.meta.env.VITE_LOCAL_DEV === "true";
