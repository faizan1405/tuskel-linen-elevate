import { NextResponse } from "next/server";
import { connectDb, ProductModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET(req: Request) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    await connectDb();
    const docs = await ProductModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      products: docs.map((d: any) => ({
        id: String(d._id),
        slug: d.slug,
        name: d.name,
        fabric: d.fabric,
        fabricLabel: d.fabricLabel,
        colorName: d.colorName,
        colorSlug: d.colorSlug,
        swatch: d.swatch,
        mrp: d.mrp,
        price: d.price,
        images: d.images,
        sizes: d.sizes,
        summary: d.summary,
        details: d.details,
        care: d.care,
        fit: d.fit,
        modelNote: d.modelNote,
        newArrival: d.newArrival,
        bestSeller: d.bestSeller,
        popularity: d.popularity,
        addedOn: d.addedOn,
        _stock: d._stock ?? 0,
        _status: d._status ?? "draft",
      })),
    });
  } catch (error) {
    console.error("[admin/products] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const body = await req.json();
    await connectDb();

    // Generate slug from name if not provided — the schema requires a unique slug
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const doc = await ProductModel.create(body);
    const product = doc.toObject();
    return NextResponse.json({
      products: [product],
    }, { status: 201 });
  } catch (error) {
    console.error("[admin/products] POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
