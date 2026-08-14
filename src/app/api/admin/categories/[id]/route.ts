import { NextResponse } from "next/server";
import { connectDb, CategoryModel } from "@/lib/db/models";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await _req.json();
    await connectDb();
    const doc = await CategoryModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ category: doc });
  } catch (error) {
    console.error("[admin/categories/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDb();
    const result = await CategoryModel.deleteOne({ _id: id });
    return NextResponse.json({ deleted: result.deletedCount > 0 });
  } catch (error) {
    console.error("[admin/categories/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
