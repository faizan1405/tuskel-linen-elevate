/**
 * Lightweight, standards-compliant session signing using Web Crypto API.
 * Runs in Edge Runtime, Node.js, and browser environments with zero external dependencies.
 */

interface SessionPayload {
  email: string;
  exp: number; // Unix timestamp in seconds
  iat: number; // Unix timestamp in seconds
}

const DEFAULT_EXPIRATION_SECONDS = 60 * 60 * 8; // 8 hours

function getAdminSessionSecret(): string {
  const envSecret = process.env["ADMIN_SESSION_SECRET"];
  if (envSecret) {
    return envSecret;
  }
  const envPassword = process.env["ADMIN_PASSWORD"];
  if (envPassword) {
    return `tuskel-session-${envPassword}`;
  }
  if (process.env["NODE_ENV"] === "production") {
    return "";
  }
  return "tuskel-dev-admin-session-secret-change-in-production";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function signString(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Creates a signed admin session token.
 */
export async function createAdminSessionToken(
  email: string,
  durationSeconds: number = DEFAULT_EXPIRATION_SECONDS
): Promise<string> {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or ADMIN_PASSWORD must be set in production.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + durationSeconds,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(payloadJson));
  const signature = await signString(payloadB64, secret);

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed admin session token.
 */
export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<{ valid: boolean; email?: string | undefined }> {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return { valid: false };
  }

  const secret = getAdminSessionSecret();
  if (!secret) {
    return { valid: false };
  }

  try {
    const expectedSig = await signString(payloadB64, secret);
    if (!timingSafeEqual(signature, expectedSig)) {
      return { valid: false };
    }

    const payloadBytes = base64UrlToBytes(payloadB64);
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const payload: SessionPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}
