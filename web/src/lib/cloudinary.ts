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
  quality?: string; // 'q_auto', 'q_auto:eco', 'q_auto:good', 'q_auto:best', hoặc số như '80'
  format?: string;  // 'f_auto', 'webp', 'avif' (mặc định 'f_auto')
  crop?: "fill" | "limit" | "fit" | "thumb" | "scale" | "pad" | string;
  dpr?: string;
  blur?: number;
}

/**
 * Tự động xác định thư mục và prefix Cloudinary phân lập theo từng website/domain
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
 * Tạo public_id duy nhất với prefix trang web để tránh ghi đè CDN và cache trình duyệt
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
 * Helper thêm tham số query cache-busting (?v=<timestamp>) cho URL ảnh
 */
export function formatCloudinaryUrl(url: string | undefined | null, versionTag?: string | number): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:") || trimmed.startsWith("/")) {
    return trimmed;
  }

  const tag = versionTag ? String(versionTag) : String(Date.now());
  if (trimmed.includes("?v=") || trimmed.includes("&v=") || trimmed.includes("?t=") || trimmed.includes("&t=")) {
    return trimmed;
  }

  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${separator}v=${tag}`;
}

/**
 * Hàm lấy URL Cloudinary nguyên bản không chứa bộ lọc transformation
 */
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

/**
 * Hàm tập trung sinh Cloudinary Transformation URL tối ưu kích thước, định dạng và chất lượng (f_auto, q_auto).
 * Nhận vào cả public_id riêng lẻ hoặc URL Cloudinary đầy đủ.
 */
export function getCloudinaryUrl(
  publicIdOrUrl: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!publicIdOrUrl || typeof publicIdOrUrl !== "string") return "";
  const trimmed = publicIdOrUrl.trim();
  if (!trimmed) return "";

  // Nếu là ảnh local, data URL, blob URL hoặc không phải Cloudinary, giữ nguyên
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:") || (trimmed.startsWith("/") && !trimmed.startsWith("//"))) {
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

  // Xác định kiểu crop mặc định: nếu có cả width + height -> fill, nếu chỉ 1 cái -> limit
  const selectedCrop = crop ? (crop.startsWith("c_") ? crop : `c_${crop}`) : (width && height ? "c_fill" : "c_limit");

  const transformParts: string[] = [];

  // 1. Tối ưu định dạng tự động (WebP / AVIF theo trình duyệt)
  if (format) {
    transformParts.push(format.startsWith("f_") ? format : `f_${format}`);
  }

  // 2. Tối ưu chất lượng tự động theo preset (q_auto, q_auto:eco, q_auto:good,...)
  if (quality) {
    transformParts.push(quality.startsWith("q_") ? quality : `q_${quality}`);
  }

  // 3. Kích thước (w_, h_, c_)
  if (selectedCrop) transformParts.push(selectedCrop);
  if (width && width > 0) transformParts.push(`w_${Math.round(width)}`);
  if (height && height > 0) transformParts.push(`h_${Math.round(height)}`);

  // 4. DPR
  if (dpr) transformParts.push(`dpr_${dpr}`);

  // 5. Blur hiệu ứng LQIP
  if (blur && blur > 0) transformParts.push(`e_blur:${blur}`);

  const transformStr = transformParts.join(",");

  // Trường hợp 1: Nhập vào URL Cloudinary đầy đủ (vd: https://res.cloudinary.com/dwl2xtbqa/image/upload/v1234/kg_logo.png)
  if (trimmed.includes("res.cloudinary.com")) {
    const uploadIndex = trimmed.indexOf("/upload/");
    if (uploadIndex === -1) return trimmed;

    const prefix = trimmed.substring(0, uploadIndex + 8);
    let rest = trimmed.substring(uploadIndex + 8);

    // Xóa các thông số transform cũ nếu có
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

  // Trường hợp 2: Nhập vào public_id đơn thuần (vd: "thkiengiangshoes/banner_1")
  const cleanPublicId = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${cleanPublicId}`;
}

/**
 * Sinh danh sách biến thể kích thước (srcset) tự động cho ảnh responsive.
 * Mặc định hỗ trợ màn hình từ di động đến desktop: 320w, 640w, 1024w, 1920w.
 */
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

/**
 * Sinh URL placeholder chất lượng thấp (LQIP - Low Quality Image Placeholder) siêu nhẹ với e_blur:1000, q_1.
 */
export function getCloudinaryLQIP(
  publicIdOrUrl: string,
  options: Omit<CloudinaryTransformOptions, "width" | "quality" | "blur"> = {}
): string {
  return getCloudinaryUrl(publicIdOrUrl, {
    ...options,
    width: 50,
    quality: "q_auto:low",
    blur: 1000,
  });
}

/**
 * Preload ảnh quan trọng (LCP Image above the fold) trực tiếp vào DOM <head>
 */
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

/**
 * Tải tệp trực tiếp lên Cloudinary với public_id duy nhất và thư mục phân lập
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

  const versionedUrl = formatCloudinaryUrl(data.secure_url, data.version || Date.now());

  return {
    secure_url: versionedUrl,
    public_id: data.public_id || uniquePublicId,
    folder: targetFolder,
  };
}
