/**
 * Cloudinary Utility Module - TH Kiên Giang Shoes & VP Chuỗi Skechers
 * Xử lý tải ảnh, tối ưu URL transformation, phân lập thư mục và cache-busting.
 */

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwl2xtbqa";
export const CLOUDINARY_PRESET = "vpchuoisk";

export interface CloudinaryUploadOptions {
  category?: string;
  fileType?: "image" | "video" | "auto";
  folder?: string;
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: "fill" | "limit" | "fit" | "thumb" | "scale" | "pad" | string;
  dpr?: string;
  blur?: number;
}

export function getSiteFolder(): { folder: string; prefix: string } {
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("vpchuoiskechers")) {
      return { folder: "vpchuoiskechers", prefix: "sk" };
    }
  }
  return { folder: "thkiengiangshoes", prefix: "kg" };
}

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

export function formatCloudinaryUrl(
  url: string | undefined | null,
  versionTag?: string | number,
  width?: number
): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:") || trimmed.startsWith("/")) {
    return trimmed;
  }

  if ((trimmed.startsWith("http://") || trimmed.startsWith("https://")) && !trimmed.includes("res.cloudinary.com")) {
    return trimmed;
  }

  const uploadMarker = "/upload/";
  const uploadIdx = trimmed.indexOf(uploadMarker);
  if (uploadIdx !== -1 && trimmed.includes("res.cloudinary.com")) {
    const afterUpload = trimmed.slice(uploadIdx + uploadMarker.length);
    const alreadyTransformed = /^[a-z]_[^/]+(,[a-z]_[^/]+)*\//.test(afterUpload);
    if (!alreadyTransformed) {
      const transformParts = width ? [`w_${width}`, "c_limit", "q_auto", "f_auto"] : ["q_auto", "f_auto"];
      trimmed = trimmed.slice(0, uploadIdx + uploadMarker.length) + transformParts.join(",") + "/" + afterUpload;
    }
  }

  const tag = versionTag ? String(versionTag) : String(Date.now());
  if (
    trimmed.includes("?v=") ||
    trimmed.includes("&v=") ||
    trimmed.includes("?t=") ||
    trimmed.includes("&t=") ||
    /\/v\d+\//.test(trimmed)
  ) {
    return trimmed;
  }

  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${separator}v=${tag}`;
}

export function getRawCloudinaryUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed.includes("res.cloudinary.com")) return trimmed;

  const uploadIndex = trimmed.indexOf("/upload/");
  if (uploadIndex === -1) return trimmed;

  const prefix = trimmed.substring(0, uploadIndex + 8);
  let rest = trimmed.substring(uploadIndex + 8);

  const pathParts = rest.split("/");
  if (
    pathParts.length > 1 &&
    !pathParts[0].match(/^v\d+$/) &&
    (pathParts[0].includes(",") || pathParts[0].includes("_"))
  ) {
    pathParts.shift();
    rest = pathParts.join("/");
  }

  return `${prefix}${rest}`;
}

export function getCloudinaryUrl(
  publicIdOrUrl: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!publicIdOrUrl || typeof publicIdOrUrl !== "string") return "";
  const trimmed = publicIdOrUrl.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:") || (trimmed.startsWith("/") && !trimmed.startsWith("//"))) {
    return trimmed;
  }

  if ((trimmed.startsWith("http://") || trimmed.startsWith("https://")) && !trimmed.includes("res.cloudinary.com")) {
    return trimmed;
  }

  const cloudName = CLOUDINARY_CLOUD_NAME;
  const {
    width,
    height,
    quality = "q_auto",
    format = "f_auto",
    crop,
    dpr,
    blur,
  } = options;

  const selectedCrop = crop ? (crop.startsWith("c_") ? crop : `c_${crop}`) : (width && height ? "c_fill" : "c_limit");
  const transformParts: string[] = [];

  if (format) {
    transformParts.push(format.startsWith("f_") ? format : `f_${format}`);
  }
  if (quality) {
    transformParts.push(quality.startsWith("q_") ? quality : `q_${quality}`);
  }
  if (selectedCrop) transformParts.push(selectedCrop);
  if (width && width > 0) transformParts.push(`w_${Math.round(width)}`);
  if (height && height > 0) transformParts.push(`h_${Math.round(height)}`);
  if (dpr) transformParts.push(`dpr_${dpr}`);
  if (blur && blur > 0) transformParts.push(`e_blur:${blur}`);

  const transformStr = transformParts.join(",");

  if (trimmed.includes("res.cloudinary.com")) {
    const uploadIndex = trimmed.indexOf("/upload/");
    if (uploadIndex === -1) return trimmed;

    const prefix = trimmed.substring(0, uploadIndex + 8);
    let rest = trimmed.substring(uploadIndex + 8);

    const pathParts = rest.split("/");
    if (
      pathParts.length > 1 &&
      !pathParts[0].match(/^v\d+$/) &&
      (pathParts[0].includes(",") || pathParts[0].includes("_"))
    ) {
      pathParts.shift();
      rest = pathParts.join("/");
    }

    return `${prefix}${transformStr}/${rest}`;
  }

  const cleanPublicId = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${cleanPublicId}`;
}

export function getCloudinarySrcSet(
  publicIdOrUrl: string,
  options: Omit<CloudinaryTransformOptions, "width"> = {},
  widths: number[] = [320, 640, 1024, 1920]
): string {
  if (!publicIdOrUrl || typeof publicIdOrUrl !== "string") return "";

  return widths
    .map((w) => {
      const url = getCloudinaryUrl(publicIdOrUrl, { ...options, width: w });
      return `${url} ${w}w`;
    })
    .join(", ");
}

export function getCloudinaryLQIP(
  publicIdOrUrl: string,
  options: Omit<CloudinaryTransformOptions, "width" | "quality" | "blur"> = {}
): string {
  if (!publicIdOrUrl) return "";
  const trimmed = publicIdOrUrl.trim();
  if ((trimmed.startsWith("http://") || trimmed.startsWith("https://")) && !trimmed.includes("res.cloudinary.com")) {
    return "";
  }
  return getCloudinaryUrl(publicIdOrUrl, {
    ...options,
    width: 50,
    quality: "q_auto:low",
    blur: 1000,
  });
}

export function preloadCloudinaryImage(url: string, srcSet?: string, sizes?: string): void {
  if (typeof window === "undefined" || !url) return;

  const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  if (srcSet) link.setAttribute("imagesrcset", srcSet);
  if (sizes) link.setAttribute("imagesizes", sizes);
  document.head.appendChild(link);
}

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

  const versionedUrl = formatCloudinaryUrl(data.secure_url, data.version || Date.now());

  return {
    secure_url: versionedUrl,
    public_id: data.public_id || uniquePublicId,
    folder: targetFolder,
  };
}
