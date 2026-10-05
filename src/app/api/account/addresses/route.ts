import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCustomerSession } from "@/lib/customer/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Mobile number must be a 10-digit number."),
  addressLine1: z.string().trim().min(5, "Address Line 1 must be at least 5 characters."),
  addressLine2: z.string().trim().optional().nullable(),
  landmark: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required."),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Pincode must be a 6-digit PIN code."),
  label: z.enum(["Home", "Work", "Other"]).default("Home"),
  isDefault: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getCustomerSession(req);
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: session.customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ ok: true, addresses });
  } catch (error: any) {
    console.error("[/api/account/addresses GET] Error:", error);
    return NextResponse.json({ error: "Failed to load addresses." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession(req);
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid address data.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data = parsed.data;

    const newAddress = await prisma.$transaction(async (tx) => {
      // Check how many addresses customer currently has
      const count = await tx.address.count({
        where: { customerId: session.customerId },
      });

      // If first address, always make it default.
      // If user checked isDefault (or it's the first), unset existing default
      const willBeDefault = count === 0 ? true : Boolean(data.isDefault);

      if (willBeDefault && count > 0) {
        await tx.address.updateMany({
          where: { customerId: session.customerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          customerId: session.customerId,
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          landmark: data.landmark || null,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          label: data.label,
          country: "India",
          isDefault: willBeDefault,
        },
      });
    });

    return NextResponse.json({ ok: true, address: newAddress }, { status: 201 });
  } catch (error: any) {
    console.error("[/api/account/addresses POST] Error:", error);
    return NextResponse.json({ error: "Failed to create address." }, { status: 500 });
  }
}
