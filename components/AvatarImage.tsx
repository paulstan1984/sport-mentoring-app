"use client";

import { useState } from "react";

const FALLBACK_SRC = "/avatar-placeholder.svg";

interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Displays an uploaded photo. Falls back to the demo placeholder when
 * the image source is absent or fails to load (e.g. file deleted from disk).
 */
export function AvatarImage({ src, alt, className, width, height }: AvatarImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK_SRC);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => setImgSrc(FALLBACK_SRC)}
    />
  );
}
