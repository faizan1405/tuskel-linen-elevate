import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().url().startsWith("mongodb"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

/**
 * Server-only env. Uses import.meta.env directly (non-NEXT_PUBLIC_ prefixed)
 * so Next.js never leaks secrets to the client bundle.
 * Import this only from server functions, API routes, or server modules.
 */
function getEnv() {
  const raw = {
    MONGODB_URI: process.env["MONGODB_URI"],
    CLOUDINARY_CLOUD_NAME: process.env["CLOUDINARY_CLOUD_NAME"],
    CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"],
    CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"],
    GOOGLE_CLIENT_SECRET: process.env["GOOGLE_CLIENT_SECRET"],
  };

  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const missing = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Missing or invalid env vars (server-only): ${missing.join(", ")}`);
  }

  return result.data;
}

export const ENV = getEnv();

/**
 * Client-safe env vars. NEXT_PUBLIC_ prefixed vars are injected by Next.js into the
 * client bundle. Never put secrets here — only public identifiers like OAuth
 * client IDs.
 */
export const CLIENT_ENV = {
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] || process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"],
} as const;

if (!CLIENT_ENV.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
}
