/**
 * Cloudinary Custom Image Loader & URL Transformer
 * Compatible with Next.js static export on Cloudflare Workers edge runtime.
 */

import { PERFORMANCE_CONFIG } from "@/config/performance.config";

export interface CloudinaryTransformOptions {
  src: string;
  width?: number;
  quality?: string; // e.g. 'q_auto:eco', 'q_auto:good', 'q_auto', or numeric '80'
  format?: string; // 'f_auto', 'webp', 'avif'
  crop?: string; // 'c_limit', 'c_fill', 'c_fit', 'c_thumb'
  blur?: number;
  dpr?: string; // e.g. '2.0' (omit dpr_auto as it causes 400 without client-hints)
}

/**
 * Returns raw unmodified Cloudinary URL without any transformations.
 */
export function getRawCloudinaryUrl(src: string): string {
  if (!src) return "";
  const trimmed = src.trim();
  if (!trimmed.includes("res.cloudinary.com")) return trimmed;

  const uploadIndex = trimmed.indexOf("/upload/");
  if (uploadIndex === -1) return trimmed;

  const prefix = trimmed.substring(0, uploadIndex + 8);
  let rest = trimmed.substring(uploadIndex + 8);

  const pathParts = rest.split("/");
  // If first segment after /upload/ contains transformation flags (e.g. f_auto or comma or q_)
  if (pathParts.length > 1 && !pathParts[0].match(/^v\d+$/) && (pathParts[0].includes(",") || pathParts[0].includes("_"))) {
    pathParts.shift();
    rest = pathParts.join("/");
  }

  return `${prefix}${rest}`;
}

/**
 * Parses and injects valid transformation parameters into Cloudinary URLs.
 */
export function buildCloudinaryUrl(options: CloudinaryTransformOptions): string {
  const {
    src,
    width,
    quality = "q_auto:good",
    crop = "c_limit",
    blur,
    dpr,
  } = options;

  if (!src) return "";

  const trimmed = src.trim();

  // If local asset or non-Cloudinary URL, return as-is
  if (!trimmed.includes("res.cloudinary.com")) {
    return trimmed;
  }

  const uploadIndex = trimmed.indexOf("/upload/");
  if (uploadIndex === -1) {
    return trimmed;
  }

  const prefix = trimmed.substring(0, uploadIndex + 8); // includes '/upload/'
  let rest = trimmed.substring(uploadIndex + 8);

  // Remove existing transformation params if present
  const pathParts = rest.split("/");
  if (pathParts.length > 1 && !pathParts[0].match(/^v\d+$/) && (pathParts[0].includes(",") || pathParts[0].includes("_"))) {
    pathParts.shift();
    rest = pathParts.join("/");
  }

  const transformParams: string[] = [];

  // 1. Format (always include f_auto for WebP/AVIF auto-format)
  transformParams.push("f_auto");

  // 2. Quality (e.g. q_auto:eco or q_auto:good)
  if (quality.startsWith("q_")) {
    // Extract just quality if format was passed together
    const cleanQ = quality.split(",").find((p) => p.startsWith("q_")) || quality;
    transformParams.push(cleanQ);
  } else {
    transformParams.push(`q_${quality}`);
  }

  // 3. Width & Crop
  if (width && width > 0) {
    transformParams.push(`${crop},w_${width}`);
  }

  // 4. DPR (only if explicit number)
  if (dpr && dpr !== "dpr_auto") {
    transformParams.push(`dpr_${dpr}`);
  }

  // 5. Blur for LQIP
  if (blur && blur > 0) {
    transformParams.push(`e_blur:${blur}`);
  }

  const transformString = transformParams.join(",") + "/";
  return `${prefix}${transformString}${rest}`;
}

/**
 * Next.js custom loader function signature.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number | string;
}): string {
  const qualityString = typeof quality === "number" ? `q_${quality}` : quality || "q_auto:good";
  return buildCloudinaryUrl({
    src,
    width,
    quality: qualityString,
  });
}

/**
 * Generates Low-Quality Image Placeholder (LQIP) URL via Cloudinary blur.
 */
export function getCloudinaryBlurUrl(src: string): string {
  return buildCloudinaryUrl({
    src,
    width: 50,
    quality: "q_auto:low",
    blur: 1000,
  });
}

/**
 * Generates dynamic srcset string for responsive images.
 */
export function generateSrcSet(
  src: string,
  qualityProfile: string = "q_auto:good",
  breakpoints: number[] = PERFORMANCE_CONFIG.breakpoints
): string {
  if (!src || !src.includes("res.cloudinary.com")) return "";

  return breakpoints
    .map((w) => {
      const url = buildCloudinaryUrl({
        src,
        width: w,
        quality: qualityProfile,
      });
      return `${url} ${w}w`;
    })
    .join(", ");
}
