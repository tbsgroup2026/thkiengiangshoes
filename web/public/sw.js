/**
 * Service Worker — KG-KAIZEN (thkiengiangshoes.tbsgroup2026.workers.dev)
 * Version: v5
 *
 * FIX: Bump version để buộc client lấy SW mới, cleanup cache v4 cũ.
 *
 * Strategies:
 *  1. Cloudinary images  → Cache-First (opaque response support)
 *  2. JS / CSS / fonts   → Stale-While-Revalidate
 *     - FIX: Content-type guard — không cache nếu server trả text/html
 *     - FIX: Safe 503 fallback — không trả undefined khi mạng lỗi + cache rỗng
 *  3. Navigation (HTML)  → Network-First, fallback /offline.html
 *     - FIX: Tách riêng navigation request, không dùng chung fallback với JS/CSS
 *  4. SKIP_WAITING message → user-controlled update, không tự reload
 */

const CACHE_NAMES = {
  IMAGES: "cloudinary-images-v5",
  STATIC: "static-assets-v5",
  PAGES:  "pages-v5",
};

// ---------------------------------------------------------------------------
// Install — KHÔNG gọi self.skipWaiting() tự động.
// SW mới sẽ ở trạng thái "waiting" cho đến khi user bấm banner "Cập Nhật Ngay".
// Điều này ngăn việc SW tự apply → tab reload bất ngờ.
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  // Pre-cache trang offline để dùng được khi mất mạng hoàn toàn
  event.waitUntil(
    caches.open(CACHE_NAMES.PAGES).then((cache) =>
      cache.add("/offline.html").catch(() => {})
    )
  );
  // Không gọi self.skipWaiting() — để SWUpdateBanner quyết định khi nào apply
});

// ---------------------------------------------------------------------------
// Activate — cleanup tất cả cache cũ (v2 và các version khác)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Message — user-controlled SKIP_WAITING
// FIX: Thay vì tự gọi skipWaiting() trong install, SW chờ lệnh từ client.
// Client gửi { type: 'SKIP_WAITING' } khi user bấm "Cập Nhật Ngay" trên banner.
// ---------------------------------------------------------------------------
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ---------------------------------------------------------------------------
// Fetch Interceptor
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, etc.)
  if (request.method !== "GET") return;

  // FIX: Bắt buộc check protocol — tránh chrome-extension:// hoặc moz-extension:// lọt vào
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // ── 1. Cloudinary Images → Cache-First ──────────────────────────────────
  if (url.hostname.includes("res.cloudinary.com")) {
    event.respondWith(
      caches.open(CACHE_NAMES.IMAGES).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            // Cache opaque responses (status 0) và 200 OK
            if (res && (res.status === 200 || res.status === 0 || res.type === "opaque")) {
              try { cache.put(request, res.clone()); } catch (_) {}
            }
            return res;
          });
        })
      )
    );
    return;
  }

  // ── 2. Static JS / CSS / Fonts → Stale-While-Revalidate ────────────────
  const isStaticAsset =
    url.pathname.includes("/_next/static/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".mjs") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf");

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAMES.STATIC).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((res) => {
            // FIX: Content-type guard — nếu server trả HTML (lỗi/trang 404),
            // KHÔNG cache và KHÔNG trả về làm JS/CSS → tránh "Unexpected token '<'"
            const contentType = res.headers.get("content-type") || "";
            if (res.status === 200 && !contentType.includes("text/html")) {
              try { cache.put(request, res.clone()); } catch (_) {}
            }
            return res;
          }).catch(() => {
            // FIX: Nếu cache có → dùng cache; nếu không có → trả 503 đúng content-type
            // Không bao giờ trả undefined hay HTML giả làm JS/CSS
            if (cached) return cached;
            const ext = url.pathname.split(".").pop() || "";
            const mime =
              ext === "css"                ? "text/css"
              : ext === "js" || ext === "mjs" ? "application/javascript"
              : ext === "woff2"            ? "font/woff2"
              : ext === "woff"             ? "font/woff"
              : "application/octet-stream";
            return new Response(
              `/* SW: Network error fetching ${url.pathname} */`,
              { status: 503, headers: { "Content-Type": mime } }
            );
          });

          // Trả cache ngay (stale), đồng thời revalidate ngầm
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // ── 3. Navigation Requests (HTML pages) → Network-First ────────────────
  // FIX: Tách riêng navigation request — không trộn với JS/CSS logic.
  // Fallback về /offline.html (HTML đúng nghĩa) khi mất mạng.
  if (request.mode === "navigate") {
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

  // ── 4. Tất cả request khác → Network (không can thiệp) ─────────────────
  // API calls, analytics, v.v. → để browser xử lý bình thường
});
