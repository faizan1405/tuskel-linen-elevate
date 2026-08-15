import { NextResponse } from "next/server";
import { connectDb, InquiryModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDb();
    const doc = await InquiryModel.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    return NextResponse.json({ inquiry: { ...doc, id: String(doc._id) } });
  } catch (error) {
    console.error("[admin/inquiries/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    await connectDb();
    const result = await InquiryModel.deleteOne({ _id: id });
    return NextResponse.json({ deleted: result.deletedCount > 0 });
  } catch (error) {
    console.error("[admin/inquiries/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
