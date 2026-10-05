import { cookies } from "next/headers";

/**
 * Lightweight, standards-compliant customer session signing using Web Crypto API.
 * Completely separate from admin session.
 */

export interface CustomerSessionPayload {
  customerId: string;
  email: string;
  name: string;
  picture?: string | null;
  iat: number;
  exp: number;
}

export interface CustomerSessionUser {
  customerId: string;
  email: string;
  name: string;
  picture?: string | null | undefined;
}

export const CUSTOMER_COOKIE_NAME = "tuskel.customer.auth";
const DEFAULT_CUSTOMER_EXPIRATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getCustomerSessionSecret(): string {
  const envSecret = process.env["CUSTOMER_SESSION_SECRET"];
  if (envSecret) {
    return envSecret;
  }
  const adminSecret = process.env["ADMIN_SESSION_SECRET"] || process.env["ADMIN_PASSWORD"];
  if (adminSecret) {
    return `tuskel-customer-salt-${adminSecret}`;
  }
  if (process.env["NODE_ENV"] === "production") {
    // In production, fallback to a consistent server-derived salt if unset
    return "tuskel-prod-customer-fallback-secret-key-32chars";
  }
  return "tuskel-dev-customer-session-secret-change-in-production";
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
 * Creates a signed customer session token.
 */
export async function createCustomerSessionToken(
  user: CustomerSessionUser,
  durationSeconds: number = DEFAULT_CUSTOMER_EXPIRATION_SECONDS
): Promise<string> {
  const secret = getCustomerSessionSecret();
  const now = Math.floor(Date.now() / 1000);

  const payload: CustomerSessionPayload = {
    customerId: user.customerId,
    email: user.email.trim().toLowerCase(),
    name: user.name.trim(),
    picture: user.picture || null,
    iat: now,
    exp: now + durationSeconds,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(payloadJson));
  const signature = await signString(payloadB64, secret);

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed customer session token.
 */
export async function verifyCustomerSessionToken(
  token: string | undefined | null
): Promise<{ valid: boolean; session?: CustomerSessionUser }> {
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

  const secret = getCustomerSessionSecret();
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
    const payload: CustomerSessionPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now) {
      return { valid: false };
    }

    if (!payload.customerId || !payload.email) {
      return { valid: false };
    }

    return {
      valid: true,
      session: {
        customerId: payload.customerId,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Resolves verified customer session from incoming request or next/headers cookies.
 */
export async function getCustomerSession(
  req?: Request
): Promise<CustomerSessionUser | null> {
  let token: string | undefined;

  if (req) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|; )${CUSTOMER_COOKIE_NAME}=([^;]*)`));
    if (match?.[1]) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    try {
      const cookieJar = await cookies();
      token = cookieJar.get(CUSTOMER_COOKIE_NAME)?.value;
    } catch {
      // Not in Next.js Server Component or request context
    }
  }

  if (!token) return null;

  const res = await verifyCustomerSessionToken(token);
  if (!res.valid || !res.session) return null;

  return res.session;
}
