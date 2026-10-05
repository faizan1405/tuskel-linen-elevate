import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/admin/session";

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("tuskel.admin.auth");
  const authResult = await verifyAdminSessionToken(authCookie?.value);
  return NextResponse.json({ authenticated: authResult.valid });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("tuskel.admin.auth");
  return NextResponse.json({ ok: true as const });
}
