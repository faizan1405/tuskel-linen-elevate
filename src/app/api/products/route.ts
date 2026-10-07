import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatProduct } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import { normalizeImageUrls } from "@/lib/images";
import { ensureProductSchema } from "@/lib/db/ensure-schema";

/**
 * GET /api/products
 * Returns products from MySQL.
 * For admin use (includes drafts). For public, pass ?status=active.
 */
export async function GET(req: Request) {
  try {
    await ensureProductSchema();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "active";

    const where: Record<string, unknown> = {};
    if (statusFilter !== "all") {
      where["status"] = statusFilter;
    }

    const docs = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products: docs.map(formatProduct) });
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
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    await ensureProductSchema();
    const body = await req.json();

    const slug =
      body.slug?.trim() ||
      body.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const rawSku = body.sku !== undefined && body.sku !== null ? String(body.sku).trim() : null;
    const sku = rawSku && rawSku.length > 0 ? rawSku : null;

    const productPayload = {
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
    };

    let doc;
    try {
      doc = await prisma.product.create({
        data: productPayload,
      });
    } catch (createErr: any) {
      const errMsg = String(createErr?.message || "");
      if (errMsg.includes("sku") && (errMsg.includes("does not exist") || errMsg.includes("Unknown column"))) {
        console.warn("[/api/products] Missing 'sku' column caught on create. Re-ensuring schema...");
        await ensureProductSchema();
        try {
          doc = await prisma.product.create({
            data: productPayload,
          });
        } catch (retryErr) {
          const { sku: _omitted, ...payloadWithoutSku } = productPayload;
          doc = await (prisma.product as any).create({
            data: payloadWithoutSku,
          });
        }
      } else {
        throw createErr;
      }
    }

    return NextResponse.json({ product: formatProduct(doc) }, { status: 201 });
  } catch (error) {
    console.error("[/api/products] POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
