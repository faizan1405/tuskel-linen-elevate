import { NextRequest, NextResponse } from "next/server";
import { ADMIN_CREDENTIALS } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ ok: false as const, error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const expectedEmail = ADMIN_CREDENTIALS.email.toLowerCase();

    if (normalizedEmail === expectedEmail && password === ADMIN_CREDENTIALS.password) {
      const response = NextResponse.json({ ok: true as const });
      response.cookies.set("tuskel.admin.auth", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
      return response;
    }

    return NextResponse.json({ ok: false as const, error: "Invalid email or password." }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false as const, error: "Invalid request." }, { status: 400 });
  }
}
