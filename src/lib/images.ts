/**
 * Utility functions for image URLs and Google Drive link normalization.
 */

/**
 * Recognizes common Google Drive sharing and preview URLs, extracting the file ID.
 * Supports:
 * - https://drive.google.com/file/d/{FILE_ID}/view...
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}...
 * - https://drive.google.com/thumbnail?id={FILE_ID}...
 * - https://docs.google.com/file/d/{FILE_ID}...
 * - https://lh3.googleusercontent.com/d/{FILE_ID}
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  const isGoogle =
    trimmed.includes("drive.google.com") ||
    trimmed.includes("docs.google.com") ||
    trimmed.includes("googleusercontent.com");

  if (!isGoogle) return null;

  // Pattern 1: /file/d/{FILE_ID}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: id={FILE_ID} query parameter
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 3: /d/{FILE_ID} (e.g. lh3.googleusercontent.com/d/{FILE_ID})
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  return null;
}

/**
 * Builds a directly renderable Google Drive thumbnail image URL.
 */
export function toGoogleDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * Normalizes an image URL:
 * - If it is a Google Drive URL, extracts the file ID and converts to a directly renderable Google Drive thumbnail URL.
 * - Otherwise (standard HTTPS image URL, local/static asset path), leaves it unmodified.
 */
export function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

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
