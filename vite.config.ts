import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import hercules from "@usehercules/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv, type UserConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  // A live (non-mock) production build without a backend URL would ship a
  // site that silently talks to localhost. Fail the build instead.
  if (
    command === "build" &&
    mode === "production" &&
    env.VITE_LOCAL_DEV !== "true" &&
    !env.VITE_CONVEX_URL?.startsWith("https://")
  ) {
    throw new Error(
      "Live build requires VITE_CONVEX_URL=https://<deployment>.convex.cloud (or set VITE_LOCAL_DEV=true for a mock demo build)",
    );
  }
  return config;
});

const config: UserConfig = {
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), tailwindcss(), hercules()],
  resolve: {
    alias: {
      "@/convex": path.resolve(import.meta.dirname, "./convex"),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) {
            return "vendor-recharts";
          }
          if (id.includes("node_modules/convex")) {
            return "vendor-convex";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
        },
      },
    },
  },
};
