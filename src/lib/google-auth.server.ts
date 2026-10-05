"use server";

/**
 * Server-only: Google ID token verification via google-auth-library.
 * Uses GOOGLE_CLIENT_SECRET (never exposed to client).
 */
import { OAuth2Client } from "google-auth-library";
import { ENV } from "./env";

let client: OAuth2Client | null = null;

function getClient(audience: string): OAuth2Client {
  if (!client) {
    const clientSecret = (process.env["GOOGLE_CLIENT_SECRET"] || ENV.GOOGLE_CLIENT_SECRET || "")
      .trim()
      .replace(/^["']|["']$/g, "");
    client = new OAuth2Client({
      clientId: audience,
      clientSecret,
    });
  }
  return client;
}

export async function verifyGoogleToken({ data }: { data: { token: string } }) {
  if (!data?.token || typeof data.token !== "string") {
    throw new Error("Invalid or missing Google ID token");
  }

  const audience = (process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] || process.env["GOOGLE_CLIENT_ID"] || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  if (!audience) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured on the server");
  }

  const oauth2Client = getClient(audience);
  const ticket = await oauth2Client.verifyIdToken({
    idToken: data.token,
    audience,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.name) {
    throw new Error("Invalid Google token payload");
  }
  return {
    name: payload.name,
    email: payload.email,
    picture: payload.picture ?? null,
    sub: payload.sub,
  };
}