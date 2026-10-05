import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
});

/**
 * Server-only env. Uses process.env directly (non-NEXT_PUBLIC_ prefixed)
 * so Next.js never leaks secrets to the client bundle.
 * Import this only from server functions, API routes, or server modules.
 */
function getEnv() {
  const raw = {
    DATABASE_URL: process.env["DATABASE_URL"] || "",
    GOOGLE_CLIENT_SECRET: process.env["GOOGLE_CLIENT_SECRET"] || "",
  };

  const missing = Object.entries(raw)
    .filter(([_, val]) => !val)
    .map(([key]) => key);

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(`[env] Warning: Missing server-only env vars: ${missing.join(", ")}`);
  }

  return raw;
}

export const ENV = getEnv();

const isProd = process.env.NODE_ENV === "production";

/**
 * Server-only admin credentials. NEVER exposed to the client bundle.
 * In production, ADMIN_PASSWORD must be configured in environment variables.
 * Hardcoded fallbacks are only permitted for local development.
 */
export const ADMIN_CREDENTIALS: { email: string; password: string } = {
  email: (process.env["ADMIN_EMAIL"] || (isProd ? "" : "admin@tuskel.com")).trim().toLowerCase(),
  password: process.env["ADMIN_PASSWORD"] || (isProd ? "" : "Tuskel@2026"),
};

/**
 * Client-safe env vars. NEXT_PUBLIC_ prefixed vars are injected by Next.js into the
 * client bundle. Never put secrets here — only public identifiers like OAuth
 * client IDs.
 */
export const CLIENT_ENV = {
  // @ts-expect-error Next.js requires dot notation for inline replacement
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
} as const;

if (!CLIENT_ENV.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  if (process.env.NODE_ENV === "development") {
    console.info("[env] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured — Google Sign-In disabled.");
  }
}
