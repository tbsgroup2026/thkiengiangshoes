/**
 * Cloudinary Utility Module - TH Kiên Giang Shoes & VP Chuỗi Skechers
 * Handles site-isolated folders, unique public_id generation, and cache-busting versioning.
 */

export const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
export const CLOUDINARY_PRESET = "vpchuoisk";

export interface CloudinaryUploadOptions {
  category?: string;
  fileType?: "image" | "video" | "auto";
  folder?: string;
}

/**
 * Automatically determine the isolated Cloudinary folder & prefix based on the current site/hostname
 */
export function getSiteFolder(): { folder: string; prefix: string } {
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("vpchuoiskechers")) {
      return { folder: "vpchuoiskechers", prefix: "sk" };
    }
  }
  return { folder: "thkiengiangshoes", prefix: "kg" };
}

/**
 * Generate a 100% unique public_id with site prefix to prevent Cloudinary CDN & browser overwrite caching
 */
export function generateUniquePublicId(category: string = "img", fileName: string = "file", sitePrefix?: string): string {
  const { prefix } = sitePrefix ? { prefix: sitePrefix } : getSiteFolder();
  const timeTag = Date.now();
  const randTag = Math.random().toString(36).substring(2, 7);
  const cleanName = fileName
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase()
    .slice(0, 20);
  return `${prefix}_${category}_${timeTag}_${randTag}_${cleanName}`;
}

/**
 * Helper to append cache-busting version query string (?v=<timestamp>) to image URLs
 */
export function formatCloudinaryUrl(url: string | undefined | null, versionTag?: string | number): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:") || trimmed.startsWith("/")) {
    return trimmed;
  }

  // Check if URL already has query parameters
  const tag = versionTag ? String(versionTag) : String(Date.now());
  if (trimmed.includes("?v=") || trimmed.includes("&v=") || trimmed.includes("?t=") || trimmed.includes("&t=")) {
    return trimmed;
  }

  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${separator}v=${tag}`;
}

/**
 * Upload a file directly to Cloudinary with unique public_id and folder isolation per site
 */
export async function uploadCloudinaryFile(
  file: File | string,
  options: CloudinaryUploadOptions = {}
): Promise<{ secure_url: string; public_id: string; folder: string }> {
  const { category = "general", fileType = "image" } = options;

  const siteInfo = getSiteFolder();
  const targetFolder = options.folder || siteInfo.folder;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", targetFolder);

  const fileName = typeof file === "string" ? "dataurl" : file.name;
  const uniquePublicId = generateUniquePublicId(category, fileName, siteInfo.prefix);
  formData.append("public_id", uniquePublicId);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${fileType === "video" ? "video" : "image"}/upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Không thể tải tệp lên Cloudinary!");
  }

  // Return secure URL with versioning cache-buster
  const versionedUrl = formatCloudinaryUrl(data.secure_url, data.version || Date.now());

  return {
    secure_url: versionedUrl,
    public_id: data.public_id || uniquePublicId,
    folder: targetFolder,
  };
}
