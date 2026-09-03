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
 * Helper to append cache-busting version query string (?v=<timestamp>) to image URLs, and to
 * auto-optimize real Cloudinary delivery URLs (resize + auto quality/format) so pages don't ship
 * multi-MB originals for thumbnail-sized slots.
 *
 * `width` (optional): nếu truyền vào, chèn thêm "w_<width>,c_limit" — Cloudinary tự resize ảnh
 * xuống đúng chiều rộng cần hiển thị (c_limit = chỉ thu nhỏ, không phóng to nếu ảnh gốc nhỏ hơn).
 * Luôn chèn "q_auto,f_auto" (tự chọn chất lượng + định dạng WebP/AVIF theo trình duyệt) cho MỌI
 * ảnh Cloudinary, kể cả khi không truyền width — ảnh admin upload thường là file gốc chưa nén
 * (~1MB+) dù chỉ hiển thị trong khung nhỏ, riêng bước q_auto,f_auto này thường đã giảm được phần
 * lớn dung lượng mà không cần biết trước kích thước hiển thị.
 */
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

  // Chèn transformation string ngay sau "/upload/" — bỏ qua nếu URL đã có transform sẵn (tránh
  // chèn lặp khi hàm được gọi nhiều lần hoặc trên URL đã tối ưu từ trước).
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

  // Check if URL already has query parameters, or already carries Cloudinary's own version
  // segment (VD "/upload/v1787832565/...") — đây là cách Cloudinary tự đánh cache-buster thật
  // sự, khác "?v=" (query string). Không nhận ra dạng này khiến hàm cứ gắn thêm "?v=Date.now()"
  // MỚI mỗi lần gọi dù URL không đổi, dù đã memo hoá ở nơi gọi.
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
