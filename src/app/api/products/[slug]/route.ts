import { NextResponse } from "next/server";
import { connectDb, ProductModel } from "@/lib/db/models";

/**
 * GET /api/products/[slug]
 * Returns a single product by slug, checking both static catalogue and MongoDB.
 * Static products are the "base" catalogue; DB products override/expand.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Try MongoDB first (admin-created products take precedence)
    await connectDb();
    const doc = await ProductModel.findOne({ slug, status: { $ne: "archived" } }).lean();

    if (doc) {
      return NextResponse.json({
        product: {
          id: String(doc._id),
          slug: doc.slug,
          name: doc.name,
          fabric: doc.fabric,
          fabricLabel: doc.fabricLabel,
          colorName: doc.colorName,
          colorSlug: doc.colorSlug,
          swatch: doc.swatch,
          mrp: doc.mrp,
          price: doc.price,
          images: doc.images,
          sizes: doc.sizes,
          summary: doc.summary,
          details: doc.details,
          care: doc.care,
          fit: doc.fit,
          modelNote: doc.modelNote,
          newArrival: doc.newArrival,
          bestSeller: doc.bestSeller,
          popularity: doc.popularity,
          addedOn: doc.addedOn,
          _stock: doc._stock ?? 0,
          _status: doc._status ?? "active",
        },
      });
    }

    // Fall back to static catalogue
    const { products } = await import("@/lib/products");
    const staticProduct = products.find((p) => p.slug === slug);

    if (staticProduct) {
      return NextResponse.json({ product: staticProduct });
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (error) {
    console.error("[/api/products/[slug]] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
