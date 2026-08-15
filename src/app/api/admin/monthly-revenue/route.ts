import { NextResponse } from "next/server";
import { connectDb, OrderModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    await connectDb();
    const now = new Date();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const data: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      data[key] = 0;
    }
    const orders = await OrderModel.find({
      status: { $nin: ["cancelled", "returned"] },
    }).lean();
    (orders as any[]).forEach((o: any) => {
      const d = new Date(o.placedOn);
      const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      if (key in data) data[key] += o.total;
    });
    const result = Object.entries(data).map(([month, revenue]) => ({ month, revenue }));
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[admin/monthly-revenue] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
  }
}
