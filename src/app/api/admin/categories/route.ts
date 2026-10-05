import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatCategory } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const productCounts = await prisma.product.groupBy({
      by: ["fabric"],
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    productCounts.forEach((p) => {
      countMap[p.fabric] = p._count.id;
    });

    return NextResponse.json({
      categories: categories.map((c) => {
        let productCount = c.productCount;
        if (productCount === 0 && countMap[c.slug]) {
          productCount = countMap[c.slug] ?? 0;
        }
        return {
          ...formatCategory(c),
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
    const slug =
      body.slug?.trim() ||
      body.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const doc = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description ?? "",
        parent: body.parent ?? null,
        image: body.image ?? "",
        active: body.active ?? true,
      },
    });

    return NextResponse.json({ category: formatCategory(doc) }, { status: 201 });
  } catch (error) {
    console.error("[admin/categories] POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
