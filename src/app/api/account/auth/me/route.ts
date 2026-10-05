import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getCustomerSession(req);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.customerId,
        name: session.name,
        email: session.email,
        picture: session.picture,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
