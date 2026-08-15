import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function requireAdminAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("tuskel.admin.auth");
  if (authCookie?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // authorized
}
