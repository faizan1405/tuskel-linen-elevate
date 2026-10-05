import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyGoogleToken } from "@/lib/google-auth.server";
import { createCustomerSessionToken, CUSTOMER_COOKIE_NAME } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing or invalid token." }, { status: 400 });
    }

    const profile = await verifyGoogleToken({ data: { token } });
    if (!profile.email) {
      return NextResponse.json({ error: "Unable to verify email from Google." }, { status: 400 });
    }

    const email = profile.email.trim().toLowerCase();
    const name = profile.name?.trim() || email.split("@")[0] || "Valued Customer";
    const picture = profile.picture || null;
    const sub = profile.sub || null;

    // PART 3: Upsert customer using verified Google email
    // Preserve existing COD customer records (phone, orders, spent)
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customer.name ? customer.name : name,
          ...(sub ? { googleSub: sub } : {}),
          ...(picture ? { avatarUrl: picture } : {}),
        },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone: "",
          orders: 0,
          spent: 0,
          status: "active",
          googleSub: sub,
          avatarUrl: picture,
        },
      });
    }

    const sessionUser = {
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
      picture: customer.avatarUrl || picture,
    };

    const sessionToken = await createCustomerSessionToken(sessionUser);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        picture: customer.avatarUrl || picture,
      },
    });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set(CUSTOMER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("[/api/account/auth/google] Sign-in error:", error);
    return NextResponse.json(
      { error: error?.message || "Google authentication failed." },
      { status: 500 }
    );
  }
}
