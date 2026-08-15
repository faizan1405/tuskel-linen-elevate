import { NextResponse } from "next/server";
import { connectDb, OrderModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    await connectDb();
    const orders = await OrderModel.find().sort({ placedOn: -1 }).lean();
    return NextResponse.json({ orders: orders.map((o: any) => ({ ...o, id: String(o._id) })) });
  } catch (error) {
    console.error("[admin/orders] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
