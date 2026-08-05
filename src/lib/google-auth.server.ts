"use server";

/**
 * Server-only: Google ID token verification via google-auth-library.
 * Uses GOOGLE_CLIENT_SECRET (never exposed to client).
 */
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "./env";

let client: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!client) {
    client = new OAuth2Client(ENV.GOOGLE_CLIENT_SECRET);
  }
  return client;
}

export async function verifyGoogleToken({ data }: { data: { token: string } }) {
  const audience = process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] || "";
  const oauth2Client = getClient();
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