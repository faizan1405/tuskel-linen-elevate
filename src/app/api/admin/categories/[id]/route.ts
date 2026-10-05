import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatCategory } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await _req.json();
    const doc = await prisma.category.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ category: formatCategory(doc) });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    console.error("[admin/categories/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ deleted: false });
    }
    console.error("[admin/categories/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
