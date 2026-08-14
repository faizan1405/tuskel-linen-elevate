import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("tuskel.admin.auth");
  return NextResponse.json({ authenticated: authCookie?.value === "1" });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("tuskel.admin.auth");
  return NextResponse.json({ ok: true as const });
}
