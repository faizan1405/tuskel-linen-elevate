import { NextResponse } from "next/server";
import { connectDb, CategoryModel, ProductModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    await connectDb();
    const categories = await CategoryModel.find().sort({ name: 1 }).lean();
    const counts = await ProductModel.aggregate([
      { $group: { _id: "$fabric", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    counts.forEach((p: any) => { countMap[p._id] = p.count; });

    return NextResponse.json({
      categories: categories.map((c: any) => {
        const nameLower = c.name.toLowerCase();
        const fabricMap: Record<string, string[]> = {
          "pure-linen": ["pure linen", "pure-linen"],
          "linen-blend": ["linen blend", "linen-blend"],
        };
        let productCount = c.productCount ?? 0;
        if (productCount === 0) {
          for (const [fabric, keywords] of Object.entries(fabricMap)) {
            if (keywords.some(kw => nameLower.includes(kw))) {
              productCount = countMap[fabric] ?? 0;
              break;
            }
          }
        }
        return {
          id: String(c._id),
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          parent: c.parent || null,
          image: c.image || "",
          active: c.active ?? true,
          productCount,
        };
      }),
    });
  } catch (error) {
    console.error("[admin/categories] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
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
