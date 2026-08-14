import { NextResponse } from "next/server";
import { connectDb, ProductModel } from "@/lib/db/models";

const INTERNAL_FIELDS = new Set(["id", "_id", "__v", "createdAt", "updatedAt"]);

export async function PATCH(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const body = await _req.json();
    const { slug } = await params;
    // Strip internal fields that shouldn't be written to MongoDB
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (!INTERNAL_FIELDS.has(k) && !k.startsWith("_")) clean[k] = v;
    }
    await connectDb();
    const doc = await ProductModel.findOneAndUpdate({ slug }, { $set: clean }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product: doc });
  } catch (error) {
    console.error("[admin/products/[slug]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectDb();
    const result = await ProductModel.deleteOne({ slug });
    return NextResponse.json({ deleted: result.deletedCount > 0 });
  } catch (error) {
    console.error("[admin/products/[slug]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
