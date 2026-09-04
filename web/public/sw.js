/**
 * Service Worker — KG-KAIZEN (thkiengiangshoes.tbsgroup2026.workers.dev)
 * Version: v23-no-js-cache
 *
 * Strategies:
 *  1. Cloudinary images  → Cache-First (opaque response support)
 *  2. JS / CSS / fonts   → KHÔNG can thiệp — để trình duyệt tự xử lý bằng HTTP cache chuẩn (worker
 *     phía server đã set Cache-Control: public, max-age=31536000, immutable cho các file
 *     /_next/static/ có tên gắn content-hash, nên đã an toàn tuyệt đối — cache SW ở TẦNG NÀY từng
 *     là rủi ro thừa: nếu 1 file JS dùng chung (framework/runtime chunk) không đổi hash giữa 2 lần
 *     build dù nội dung liên kết module bên trong có đổi, SW từng ưu tiên trả bản CŨ trong cache
 *     ("cached || fetchPromise") mà không hề fetch mạng để so sánh — có thể gây lỗi JS runtime im
 *     lặng (không phải lỗi tải file 404 rõ ràng) khiến React không khởi động được, mà cơ chế phát
 *     hiện lỗi ở layout.tsx không bắt được (chỉ bắt lỗi TẢI file, không bắt lỗi NỘI DUNG file cũ).
 *  3. Next.js .txt files → Network-Only (do not cache RSC navigation payloads)
 *  4. Navigation (HTML)  → Network-First, fallback /offline.html
 *  5. SKIP_WAITING message → user-controlled update
 */

const CACHE_NAMES = {
  IMAGES: "cloudinary-images-v23",
  PAGES:  "pages-v23",
};

self.addEventListener("install", (event) => {
  // Kích hoạt bản SW mới NGAY, không chờ hết tab cũ đóng lại hay chờ người dùng tự bấm banner cập
  // nhật — trước đây cố tình để user tự bấm (tránh reload bất ngờ mất dữ liệu form đang nhập), NHƯNG
  // giờ SW không còn tự cache JS/CSS nữa (xem giải thích đầu file) nên KHÔNG còn rủi ro "kẹt mãi ở
  // bản JS cũ" như trước — chỉ cần bản SW điều khiển fetch được cập nhật càng sớm càng tốt, không
  // đụng gì tới trang đang mở (skipWaiting KHÔNG tự reload trang, chỉ đổi ai xử lý request kế tiếp).
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAMES.PAGES).then((cache) =>
      cache.add("/offline.html").catch(() => {})
    )
  );
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

  // 3. Navigation Requests (HTML pages) → Network-First
  if (request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline.html").then(
          (offline) =>
            offline ||
            new Response("<h1>Mất kết nối</h1>", {
              status: 503,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
        )
      )
    );
    return;
  }
});
