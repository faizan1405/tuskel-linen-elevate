import { NextResponse } from "next/server";
import { connectDb, CategoryModel, ProductModel } from "@/lib/db/models";

export async function GET() {
  try {
    await connectDb();
    const categories = await CategoryModel.find().sort({ name: 1 }).lean();
    const productCounts = await ProductModel.aggregate([
      { $group: { _id: "$fabric", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    productCounts.forEach((p: any) => { countMap[p._id] = p.count; });
    return NextResponse.json({
      categories: categories.map((c: any) => ({
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        parent: c.parent || null,
        image: c.image || "",
        active: c.active ?? true,
        productCount: c.productCount ?? countMap[c.slug] ?? 0,
      })),
    });
  } catch (error) {
    console.error("[admin/categories] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDb();
    const doc = await CategoryModel.create(body);
    return NextResponse.json({ category: doc.toObject() }, { status: 201 });
  } catch (error) {
    console.error("[admin/categories] POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
