import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatProduct } from "@/lib/db/formatters";

/**
 * GET /api/products/[slug]
 * Returns a single active product by slug from MySQL only.
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

    const doc = await prisma.product.findFirst({
      where: {
        slug,
        status: { not: "archived" },
      },
    });

    if (doc) {
      return NextResponse.json({ product: formatProduct(doc) });
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  } catch (error) {
    console.error("[/api/products/[slug]] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
