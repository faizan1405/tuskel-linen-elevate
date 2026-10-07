import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatProduct } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import { normalizeImageUrls } from "@/lib/images";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const docs = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      products: docs.map(formatProduct),
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

    const slug =
      body.slug?.trim() ||
      body.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const rawSku = body.sku !== undefined && body.sku !== null ? String(body.sku).trim() : null;
    const sku = rawSku && rawSku.length > 0 ? rawSku : null;

    const doc = await prisma.product.create({
      data: {
        slug,
        sku,
        name: body.name,
        fabric: body.fabric,
        fabricLabel: body.fabricLabel,
        colorName: body.colorName,
        colorSlug: body.colorSlug,
        swatch: body.swatch,
        mrp: Number(body.mrp),
        price: Number(body.price),
        images: normalizeImageUrls(body.images),
        sizes: Array.isArray(body.sizes) ? body.sizes : ["S", "M", "L", "XL", "2XL", "3XL"],
        summary: body.summary ?? "",
        details: Array.isArray(body.details) ? body.details : [],
        care: Array.isArray(body.care) ? body.care : [],
        fit: body.fit ?? "",
        modelNote: body.modelNote ?? "",
        newArrival: Boolean(body.newArrival),
        bestSeller: Boolean(body.bestSeller),
        popularity: Number(body.popularity ?? 0),
        addedOn: body.addedOn ?? "",
        stock: Number(body._stock ?? body.stock ?? 0),
        status: body._status ?? body.status ?? "draft",
      },
    });

    const formatted = formatProduct(doc);
    return NextResponse.json({
      products: [formatted],
      product: formatted,
    }, { status: 201 });
  } catch (error) {
    console.error("[admin/products] POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
