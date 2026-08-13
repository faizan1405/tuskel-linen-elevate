"use server";

import { cookies } from "next/headers";
import { ADMIN_CREDENTIALS } from "@/lib/env";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function adminLoginAction(formData: FormData) {
  const raw = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!raw.success) return { ok: false as const, error: "Invalid input." };

  const normalizedEmail = raw.data.email.trim().toLowerCase();
  const expectedEmail = (ADMIN_CREDENTIALS as { email: string; password: string }).email.toLowerCase();
  const expectedPassword = (ADMIN_CREDENTIALS as { password: string }).password;

  if (normalizedEmail === expectedEmail && raw.data.password === expectedPassword) {
    const cookieStore = await cookies();
    cookieStore.set("tuskel.admin.auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return { ok: true as const };
  }

  return { ok: false as const, error: "Invalid email or password." };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("tuskel.admin.auth");
  return { ok: true as const };
}

export async function adminCheckAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("tuskel.admin.auth");
  return { authenticated: authCookie?.value === "1" };
}
