import { NextResponse } from "next/server";
import { extractGoogleDriveFileId, toGoogleDriveImageUrl, toGoogleDriveFallbackUrl } from "@/lib/images";

export const dynamic = "force-dynamic";

/**
 * GET /api/proxy-image?url=... OR /api/proxy-image?id=...
 *
 * Proxies image requests server-side without sending cross-origin Referer headers,
 * bypassing 403 Forbidden errors imposed by Google Drive / external image hosts
 * on client-side browsers.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const fileId = searchParams.get("id");

  let googleId = fileId ? fileId.trim() : null;

  if (!googleId && targetUrl) {
    googleId = extractGoogleDriveFileId(targetUrl);
  }

  // Candidate URLs to fetch from
  const candidateUrls: string[] = [];

  if (googleId) {
    candidateUrls.push(toGoogleDriveImageUrl(googleId)); // https://lh3.googleusercontent.com/d/{id}=w1200
    candidateUrls.push(toGoogleDriveFallbackUrl(googleId)); // https://drive.google.com/thumbnail?id={id}&sz=w1200
    candidateUrls.push(`https://drive.usercontent.google.com/download?id=${googleId}&export=view`);
  } else if (targetUrl) {
    const trimmed = targetUrl.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      candidateUrls.push(trimmed);
    }
  }

  if (candidateUrls.length === 0) {
    return NextResponse.json({ error: "Valid url or Google Drive id is required" }, { status: 400 });
  }

  let lastError = "Could not fetch image";

  for (const fetchUrl of candidateUrls) {
    try {
      const response = await fetch(fetchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
        redirect: "follow",
        cache: "force-cache",
      });

      if (!response.ok) {
        lastError = `Upstream returned status ${response.status}`;
        continue;
      }

      const contentType = response.headers.get("content-type") || "";

      // If Google returned HTML, it means login/permissions are required
      if (contentType.includes("text/html")) {
        lastError = "Google Drive file is private. Please ensure sharing is set to 'Anyone with the link'.";
        continue;
      }

      const buffer = await response.arrayBuffer();

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    } catch (fetchErr: any) {
      lastError = fetchErr?.message || "Network error fetching image";
    }
  }

  return NextResponse.json({ error: lastError }, { status: 404 });
}
