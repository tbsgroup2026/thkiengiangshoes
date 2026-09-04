/**
 * Service Worker — KG-KAIZEN (thkiengiangshoes.tbsgroup2026.workers.dev)
 * Version: v24-no-nav-intercept
 *
 * Strategies:
 *  1. Cloudinary images  → Cache-First (opaque response support) — DUY NHẤT thứ SW còn can thiệp.
 *  2. JS / CSS / fonts   → KHÔNG can thiệp — browser tự xử lý bằng HTTP cache chuẩn (server đã set
 *     Cache-Control: public, max-age=31536000, immutable cho file content-hash).
 *  3. Điều hướng trang (HTML) → KHÔNG can thiệp nữa (bỏ hẳn từ v24) — trước đây "Network-First,
 *     fallback /offline.html" nghe hợp lý, nhưng qua kiểm chứng thực tế bằng Chrome headless: khi
 *     có 1 SW đang thực sự điều khiển trang và người dùng ĐIỀU HƯỚNG SANG TRANG MỚI, việc SW chặn
 *     lại request điều hướng đó (respondWith) để tự fetch hộ khiến trình duyệt xử lý nặng/chậm hơn
 *     hẳn so với để trình duyệt tự điều hướng bình thường — đúng lớp nguyên nhân gây cảm giác giật/
 *     kẹt lúc chuyển trang đã dày vò suốt phiên làm việc hôm nay. Cái giá đánh đổi (mất trang
 *     offline.html khi rớt mạng hoàn toàn) nhỏ hơn nhiều lợi ích "điều hướng trang luôn mượt, không
 *     còn tầng SW nào chen vào giữa nữa".
 *  4. SKIP_WAITING → tự động ngay khi cài (skipWaiting), không chờ user bấm banner nữa.
 */

const CACHE_NAMES = {
  IMAGES: "cloudinary-images-v24",
};

self.addEventListener("install", (event) => {
  // Kích hoạt bản SW mới NGAY, không chờ hết tab cũ đóng lại hay chờ người dùng tự bấm banner cập
  // nhật — trước đây cố tình để user tự bấm (tránh reload bất ngờ mất dữ liệu form đang nhập), NHƯNG
  // giờ SW không còn tự cache JS/CSS nữa (xem giải thích đầu file) nên KHÔNG còn rủi ro "kẹt mãi ở
  // bản JS cũ" như trước — chỉ cần bản SW điều khiển fetch được cập nhật càng sớm càng tốt, không
  // đụng gì tới trang đang mở (skipWaiting KHÔNG tự reload trang, chỉ đổi ai xử lý request kế tiếp).
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHE_NAMES).includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Check valid protocol
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Never cache Next.js App Router's static-export RSC payload files (.txt)
  if (url.pathname.endsWith(".txt")) return;

  // 1. Cloudinary Images → Cache-First
  if (url.hostname.includes("res.cloudinary.com")) {
    event.respondWith(
      caches.open(CACHE_NAMES.IMAGES).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res && (res.status === 200 || res.status === 0 || res.type === "opaque")) {
              try { cache.put(request, res.clone()); } catch (_) {}
            }
            return res;
          }).catch(() => cached || new Response("", { status: 504 }));
        })
      )
    );
    return;
  }

  // 2. Static JS / CSS / Fonts → KHÔNG can thiệp gì cả (xem giải thích ở đầu file) — không gọi
  // event.respondWith() nghĩa là trình duyệt tự fetch bình thường, dùng đúng HTTP cache chuẩn theo
  // Cache-Control server đã set (immutable cho file có content-hash, nên vẫn nhanh/đỡ tốn mạng ở
  // lần sau, chỉ là để trình duyệt tự quyết định thay vì SW tự ý ưu tiên cache không kiểm tra).

  // 3. Điều hướng trang (HTML) → KHÔNG can thiệp nữa (xem giải thích ở đầu file) — không gọi
  // event.respondWith() nghĩa là trình duyệt tự điều hướng bình thường, không qua SW.
});
