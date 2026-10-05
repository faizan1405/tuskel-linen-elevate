import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatOrder } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const orders = await prisma.order.findMany({
      orderBy: { placedOn: "desc" },
      include: { items: true },
    });
    return NextResponse.json({ orders: orders.map(formatOrder) });
  } catch (error) {
    console.error("[admin/orders] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
