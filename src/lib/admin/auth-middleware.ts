import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "./session";

export async function requireAdminAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("tuskel.admin.auth");
  if (!authCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await verifyAdminSessionToken(authCookie.value);
  if (!result.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // authorized
}

