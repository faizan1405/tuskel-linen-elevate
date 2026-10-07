/**
 * Utility functions for image URLs and Google Drive link normalization.
 */

/**
 * Checks whether the given string appears to be a Google Drive folder URL
 * rather than a link to an individual image file.
 */
export function isGoogleDriveFolderUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) &&
    (trimmed.includes("/folders/") || trimmed.includes("drive/folders"))
  );
}

/**
 * Recognizes common Google Drive sharing and preview URLs, extracting the unique file ID.
 * Supports:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/file/u/{USER_INDEX}/d/{FILE_ID}/view
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}...
 * - https://drive.google.com/thumbnail?id={FILE_ID}...
 * - https://docs.google.com/file/d/{FILE_ID}...
 * - https://lh3.googleusercontent.com/d/{FILE_ID}
 * - https://drive.usercontent.google.com/download?id={FILE_ID}
 * - Shortened / un-prefixed URLs like drive.google.com/file/d/...
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  let trimmed = url.trim().replace(/^["']|["']$/g, "");

  if (!trimmed) return null;

  // Auto prepend https if protocol was omitted
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("/")
  ) {
    if (
      trimmed.includes("drive.google.com") ||
      trimmed.includes("docs.google.com") ||
      trimmed.includes("googleusercontent.com")
    ) {
      trimmed = `https://${trimmed}`;
    }
  }

  const isGoogle =
    trimmed.includes("drive.google.com") ||
    trimmed.includes("docs.google.com") ||
    trimmed.includes("googleusercontent.com");

  if (!isGoogle) return null;

  // Folder URLs do not contain a single image file
  if (isGoogleDriveFolderUrl(trimmed)) {
    return null;
  }

  // Pattern 1: /file/d/{FILE_ID} or /file/u/0/d/{FILE_ID}
  const fileDMatch = trimmed.match(/\/file(?:\/u\/\d+)?\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: id={FILE_ID} query parameter
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 3: /d/{FILE_ID} (e.g. lh3.googleusercontent.com/d/{FILE_ID} or googleusercontent.com/d/{FILE_ID}=w1000)
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  return null;
}

/**
 * Builds a directly renderable Google Drive CDN image URL.
 * `lh3.googleusercontent.com/d/{id}=w1200` serves the high-resolution image directly
 * without redirect hops.
 */
export function toGoogleDriveImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
}

/**
 * Alternative Google Drive thumbnail endpoint (used for fallback).
 */
export function toGoogleDriveFallbackUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
}

/**
 * Normalizes an image URL:
 * - If it is a Google Drive URL, extracts the file ID and converts to a directly renderable Google Drive image URL.
 * - Auto-prepends https:// if missing.
 * - Otherwise (standard HTTPS image URL, local/static asset path), leaves it unmodified.
 */
export function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return "";

  // Auto prepend https if protocol was omitted for external domains
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("data:")
  ) {
    trimmed = `https://${trimmed}`;
  }

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return toGoogleDriveImageUrl(fileId);
  }

  return trimmed;
}

/**
 * Normalizes an array of image URLs, filtering out empty items.
 */
export function normalizeImageUrls(urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    .map(normalizeImageUrl);
}
