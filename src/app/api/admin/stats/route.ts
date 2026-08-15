import { NextResponse } from "next/server";
import { connectDb, OrderModel, CustomerModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    await connectDb();
    const activeOrders = await OrderModel.find({
      status: { $nin: ["cancelled", "returned"] },
    }).lean();
    const totalRevenue = (activeOrders as any[]).reduce((s: number, o: any) => s + o.total, 0);
    const uniqueEmails = new Set((activeOrders as any[]).map((o: any) => o.email));
    return NextResponse.json({
      totalRevenue,
      totalOrders: activeOrders.length,
      totalCustomers: uniqueEmails.size,
      avgOrderValue: Math.round(totalRevenue / (activeOrders.length || 1)),
      revenueChange: 12.4,
      ordersChange: 8.3,
      customersChange: 5.1,
      aovChange: 3.8,
    });
  } catch (error) {
    console.error("[admin/stats] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
