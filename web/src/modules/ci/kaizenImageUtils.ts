/**
 * Nhiều ảnh của 1 đề xuất Kaizen được LƯU GỘP thành 1 chuỗi phân cách bởi dấu phẩy trong đúng
 * 1 field (before_image_url / after_image_url) — xem KaizenPublicSubmitForm.tsx (handleFileUpload
 * nối `combined.join(",")`). Đây là thiết kế cố ý (đỡ phải thêm bảng/field mới), NHƯNG nhiều nơi
 * hiển thị (card danh sách, modal chi tiết, modal xét duyệt) lại truyền thẳng cả chuỗi đó vào
 * `<img src=...>` — trình duyệt không tải nổi 1 URL có dấu phẩy + nối nhiều ảnh, nên với những đề
 * xuất có TỪ 2 ẢNH TRỞ LÊN, ảnh không hiện ra được (đúng lỗi "vài bài không hiện ảnh").
 * Luôn dùng các hàm dưới đây thay vì đọc thẳng field before_image_url/after_image_url khi cần 1 URL ảnh duy nhất để hiển thị.
 */

export function splitImageUrls(raw?: string | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function firstImageUrl(raw?: string | null): string {
  return splitImageUrls(raw)[0] || "";
}

/** Ảnh đại diện tốt nhất để hiển thị: ưu tiên ảnh TRƯỚC, không có thì lấy ảnh SAU. */
export function primaryImageUrl(beforeRaw?: string | null, afterRaw?: string | null): string {
  return firstImageUrl(beforeRaw) || firstImageUrl(afterRaw);
}
