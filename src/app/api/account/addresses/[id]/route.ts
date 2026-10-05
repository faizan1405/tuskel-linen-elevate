import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCustomerSession } from "@/lib/customer/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").optional(),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Mobile number must be a 10-digit number.").optional(),
  addressLine1: z.string().trim().min(5, "Address Line 1 must be at least 5 characters.").optional(),
  addressLine2: z.string().trim().optional().nullable(),
  landmark: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2, "City is required.").optional(),
  state: z.string().trim().min(2, "State is required.").optional(),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Pincode must be a 6-digit PIN code.").optional(),
  label: z.enum(["Home", "Work", "Other"]).optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession(req);
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing address ID." }, { status: 400 });
    }

    // Verify address ownership
    const existing = await prisma.address.findFirst({
      where: {
        id,
        customerId: session.customerId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found or unauthorized." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateAddressSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid update data.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      // If setting as default, unset other defaults
      if (data.isDefault === true) {
        await tx.address.updateMany({
          where: {
            customerId: session.customerId,
            isDefault: true,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }

      // If user tries to set isDefault to false on the only address, preserve default
      let targetDefault = data.isDefault;
      if (data.isDefault === false && existing.isDefault) {
        const count = await tx.address.count({ where: { customerId: session.customerId } });
        if (count <= 1) {
          targetDefault = true; // cannot unset the only address as default
        }
      }

      return tx.address.update({
        where: { id },
        data: {
          ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.addressLine1 !== undefined ? { addressLine1: data.addressLine1 } : {}),
          ...(data.addressLine2 !== undefined ? { addressLine2: data.addressLine2 || null } : {}),
          ...(data.landmark !== undefined ? { landmark: data.landmark || null } : {}),
          ...(data.city !== undefined ? { city: data.city } : {}),
          ...(data.state !== undefined ? { state: data.state } : {}),
          ...(data.pincode !== undefined ? { pincode: data.pincode } : {}),
          ...(data.label !== undefined ? { label: data.label } : {}),
          ...(targetDefault !== undefined ? { isDefault: targetDefault } : {}),
        },
      });
    });

    return NextResponse.json({ ok: true, address: updated });
  } catch (error: any) {
    console.error("[/api/account/addresses/[id] PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update address." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession(req);
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing address ID." }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: {
        id,
        customerId: session.customerId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found or unauthorized." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id },
      });

      // PART 11: If deleted address was default, automatically assign another address as default
      if (existing.isDefault) {
        const nextDefault = await tx.address.findFirst({
          where: { customerId: session.customerId },
          orderBy: { updatedAt: "desc" },
        });

        if (nextDefault) {
          await tx.address.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({ ok: true, message: "Address deleted successfully." });
  } catch (error: any) {
    console.error("[/api/account/addresses/[id] DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
  }
}
