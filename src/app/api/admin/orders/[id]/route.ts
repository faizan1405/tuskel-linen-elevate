import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatOrder } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id } = await params;
    const doc = await prisma.order.update({
      where: { id },
      data: {
        ...body,
        updatedOn: new Date().toISOString().split("T")[0],
      },
      include: { items: true },
    });
    return NextResponse.json({ order: formatOrder(doc) });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.error("[admin/orders/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
