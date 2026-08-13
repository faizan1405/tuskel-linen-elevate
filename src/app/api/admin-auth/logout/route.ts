import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true as const });
  response.cookies.delete("tuskel.admin.auth");
  return response;
}
