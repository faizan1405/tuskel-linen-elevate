import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function POST(req: Request) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const body = await req.json();
    const { image } = body;
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // If an image URL or static path is passed, accept it
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
      return NextResponse.json({ url: image });
    }

    // Direct binary/base64 uploads are disabled for MVP until Hostinger persistent directory is configured
    return NextResponse.json(
      {
        error:
          "Direct runtime image uploads are disabled for MVP until Hostinger persistent media storage is configured. Please provide an image URL (e.g. Unsplash, external CDN) or a static path.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[admin/upload] POST error:", error);
    return NextResponse.json({ error: "Upload handling failed" }, { status: 500 });
  }
}
