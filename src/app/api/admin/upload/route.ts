import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function POST(req: Request) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const body = await req.json();
    const { image, folder } = body;
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }
    const result = await uploadImage(image, { folder: folder || "tuskel/products" });
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("[admin/upload] POST error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
