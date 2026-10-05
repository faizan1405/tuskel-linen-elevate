import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatProduct } from "@/lib/db/formatters";

/**
 * GET /api/products/[slug]
 * Returns a single product by slug, checking both MySQL and static catalogue.
 * MySQL products override/expand the static catalogue.
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

    // Try MySQL first (admin-created products take precedence)
    const doc = await prisma.product.findFirst({
      where: {
        slug,
        status: { not: "archived" },
      },
    });

    if (doc) {
      return NextResponse.json({ product: formatProduct(doc) });
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
