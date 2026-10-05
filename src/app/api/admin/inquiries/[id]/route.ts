import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatInquiry } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await req.json();
    const doc = await prisma.inquiry.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ inquiry: formatInquiry(doc) });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    console.error("[admin/inquiries/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    await prisma.inquiry.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ deleted: false });
    }
    console.error("[admin/inquiries/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
