import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      data[key] = 0;
    }

    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ["cancelled", "returned"] },
      },
    });

    orders.forEach((o) => {
      const d = new Date(o.placedOn);
      const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      if (key in data) {
        data[key] = (data[key] ?? 0) + Number(o.total);
      }
    });

    const result = Object.entries(data).map(([month, revenue]) => ({ month, revenue }));
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[admin/monthly-revenue] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
  }
}
