import { NextResponse } from "next/server";
import { connectDb, ProductModel } from "@/lib/db/models";
import { products as staticProducts, byFabric, type Fabric } from "@/lib/products";

/**
 * GET /api/shop/products
 * Returns merged product list: static catalogue + MongoDB products.
 * DB products override static ones with the same slug.
 * Supports ?fabric=, ?status=, ?sort=, ?q= query params.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fabricFilter = searchParams.get("fabric") as Fabric | "all" | null;
    const statusFilter = searchParams.get("status") || "active";
    const sort = searchParams.get("sort") || "newest";
    const query = searchParams.get("q") || "";

    // Fetch DB products
    await connectDb();
    const dbQuery: Record<string, unknown> = {};
    if (statusFilter !== "all") {
      dbQuery["_status"] = statusFilter;
    }
    const docs = await ProductModel.find(dbQuery).sort({ createdAt: -1 }).lean();

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

    // Merge: static products are the base; DB products override by slug
    const staticMap = new Map(staticProducts.map((p) => [p.slug, p]));
    const dbMap = new Map(dbProducts.map((p) => [p.slug, p]));

    // Start with all static products, then override/add DB products
    const merged = new Map(staticMap);
    for (const [slug, dbP] of dbMap) {
      merged.set(slug, dbP);
    }
    let products = Array.from(merged.values());

    // Filter by fabric
    if (fabricFilter && fabricFilter !== "all") {
      products = products.filter((p) => p.fabric === fabricFilter);
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.colorName.toLowerCase().includes(q) ||
        p.fabricLabel.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q)
      );
    }

    // Sort
    products = sortProducts(products, sort);

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error("[/api/shop/products] GET error:", error);
    // Fall back to static products on DB error
    let products = [...staticProducts];
    const { searchParams } = new URL(req.url);
    const fabricFilter = searchParams.get("fabric");
    const sort = searchParams.get("sort") || "newest";
    const query = searchParams.get("q") || "";
    if (fabricFilter && fabricFilter !== "all") {
      products = products.filter((p) => p.fabric === fabricFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.colorName.toLowerCase().includes(q)
      );
    }
    products = sortProducts(products, sort);
    return NextResponse.json({ products, total: products.length });
  }
}

function sortProducts(products: any[], sort: string): any[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "popularity":
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case "newest":
    default:
      return sorted.sort((a, b) => (b.addedOn || "").localeCompare(a.addedOn || ""));
  }
}
