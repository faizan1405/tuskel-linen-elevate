"use client";

import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { extractGoogleDriveFileId } from "@/lib/images";

// Self-contained SVG data URL placeholder that never fails or 404s
const SVG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500' fill='%23f5f5f4'%3E%3Crect width='400' height='500' fill='%23f5f5f4'/%3E%3Cpath d='M160 210a40 40 0 1 0 80 0 40 40 0 1 0-80 0z' fill='%23d6d3d1'/%3E%3Cpath d='M80 370l90-110 60 70 50-50 80 90H80z' fill='%23e7e5e4'/%3E%3C/svg%3E";

export interface ProductImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null | undefined;
  fallbackSrc?: string | undefined;
  showFallbackPlaceholder?: boolean | undefined;
}

/**
 * Robust image component for product photos and Google Drive thumbnails.
 * Features:
 * 1. Sets `referrerPolicy="no-referrer"` so Google Drive CDN doesn't block with 403.
 * 2. On load error, automatically retries via internal Next.js `/api/proxy-image` server route.
 * 3. Gracefully shows a clean fallback rather than a broken browser outline.
 */
export function ProductImage({
  src,
  alt = "",
  className = "",
  fallbackSrc = SVG_FALLBACK,
  showFallbackPlaceholder = true,
  onError,
  ...props
}: ProductImageProps) {
  const safeSrc = typeof src === "string" ? src : "";
  const [currentSrc, setCurrentSrc] = useState<string>(safeSrc);
  const [attemptState, setAttemptState] = useState<"direct" | "proxy" | "fallback" | "failed">("direct");

  useEffect(() => {
    setCurrentSrc(typeof src === "string" ? src : "");
    setAttemptState("direct");
  }, [src]);

  if (!src && showFallbackPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/40 text-muted-foreground ${className}`}
        title="No image available"
      >
        <ImageOff className="h-5 w-5 opacity-40" />
      </div>
    );
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (attemptState === "direct") {
      // Direct load failed. Try proxying if it's a Google Drive or external URL
      const isGoogle = currentSrc.includes("google") || currentSrc.includes("googleusercontent.com");
      const isExternal = currentSrc.startsWith("http://") || currentSrc.startsWith("https://");

      if (isGoogle || isExternal) {
        setAttemptState("proxy");
        const driveId = extractGoogleDriveFileId(currentSrc);
        const proxyUrl = driveId
          ? `/api/proxy-image?id=${encodeURIComponent(driveId)}`
          : `/api/proxy-image?url=${encodeURIComponent(currentSrc)}`;
        setCurrentSrc(proxyUrl);
        return;
      }
    }

    if (attemptState === "proxy" && fallbackSrc && currentSrc !== fallbackSrc) {
      setAttemptState("fallback");
      setCurrentSrc(fallbackSrc);
      return;
    }

    setAttemptState("failed");
    if (onError) onError(e);
  };

  if (attemptState === "failed") {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted/30 text-muted-foreground p-2 text-center ${className}`}
        title="Could not display image. Please verify file sharing is set to 'Anyone with the link can view'."
      >
        <ImageOff className="h-5 w-5 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
