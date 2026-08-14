import { NextResponse } from "next/server";
import { connectDb, OrderModel } from "@/lib/db/models";

export async function GET() {
  try {
    await connectDb();
    const orders = await OrderModel.find().sort({ placedOn: -1 }).lean();
    return NextResponse.json({ orders: orders.map((o: any) => ({ ...o, id: String(o._id) })) });
  } catch (error) {
    console.error("[admin/orders] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
