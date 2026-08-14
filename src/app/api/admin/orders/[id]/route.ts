import { NextResponse } from "next/server";
import { connectDb, OrderModel } from "@/lib/db/models";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { id } = await params;
    await connectDb();
    const doc = await OrderModel.findByIdAndUpdate(id, {
      ...body,
      updatedOn: new Date().toISOString().split("T")[0],
    }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order: { ...doc, id: String(doc._id) } });
  } catch (error) {
    console.error("[admin/orders/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
