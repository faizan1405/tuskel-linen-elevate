import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatProduct } from "@/lib/db/formatters";
import { products as staticProducts, type Fabric } from "@/lib/products";

/**
 * GET /api/shop/products
 * Returns merged product list: static catalogue + MySQL products.
 * MySQL products override static ones with the same slug.
 * Supports ?fabric=, ?status=, ?sort=, ?q= query params.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fabricFilter = searchParams.get("fabric") as Fabric | "all" | null;
    const statusFilter = searchParams.get("status") || "active";
    const sort = searchParams.get("sort") || "newest";
    const query = searchParams.get("q") || "";

    // Fetch MySQL products
    const where: Record<string, unknown> = {};
    if (statusFilter !== "all") {
      where["status"] = statusFilter;
    }

    const docs = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const dbProducts = docs
      .map(formatProduct)
      .filter((p): p is NonNullable<typeof p> => p !== null);

    // Merge: static products are the base; DB products override by slug
    const staticMap = new Map<string, any>(staticProducts.map((p) => [p.slug, p]));
    const dbMap = new Map<string, any>(dbProducts.map((p) => [p.slug, p]));

    // Start with all static products, then override/add DB products
    const merged = new Map<string, any>(staticMap);
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
