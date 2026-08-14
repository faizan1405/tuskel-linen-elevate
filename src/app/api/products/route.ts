import { NextResponse } from "next/server";
import { connectDb, ProductModel } from "@/lib/db/models";

/**
 * GET /api/products
 * Returns all products (static + DB). DB products override static ones with the same slug.
 * For admin use (includes drafts). For public, pass ?status=active.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "active";

    await connectDb();
    let query: Record<string, unknown> = {};
    if (statusFilter !== "all") {
      query["_status"] = statusFilter;
    }

    const docs = await ProductModel.find(query).sort({ createdAt: -1 }).lean();
    const dbProducts = docs.map((d: any) => ({
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
      _status: d._status ?? "active",
    }));

    return NextResponse.json({ products: dbProducts });
  } catch (error) {
    console.error("[/api/products] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Creates a new product (admin only — protected by API route).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDb();
    const doc = await ProductModel.create(body);
    return NextResponse.json({ product: doc.toObject() }, { status: 201 });
  } catch (error) {
    console.error("[/api/products] POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
