import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatProduct } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

const INTERNAL_FIELDS = new Set(["id", "_id", "__v", "createdAt", "updatedAt"]);

export async function PATCH(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const body = await _req.json();
    const { slug } = await params;

    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (!INTERNAL_FIELDS.has(k) && v !== undefined) {
        if (k === "_stock" || k === "stock") {
          clean["stock"] = Number(v);
        } else if (k === "_status" || k === "status") {
          clean["status"] = String(v);
        } else if (k === "mrp" || k === "price") {
          clean[k] = Number(v);
        } else {
          clean[k] = v;
        }
      }
    }

    const doc = await prisma.product.update({
      where: { slug },
      data: clean,
    });

    return NextResponse.json({ product: formatProduct(doc) });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("[admin/products/[slug]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { slug } = await params;
    await prisma.product.delete({ where: { slug } });
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ deleted: false });
    }
    console.error("[admin/products/[slug]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
