/**
 * Service Worker — KG-KAIZEN (thkiengiangshoes.tbsgroup2026.workers.dev)
 * Version: v21-fresh
 *
 * Strategies:
 *  1. Cloudinary images  → Cache-First (opaque response support)
 *  2. JS / CSS / fonts   → Stale-While-Revalidate (with Content-Type guard & error catch)
 *  3. Next.js .txt files → Network-Only (do not cache RSC navigation payloads)
 *  4. Navigation (HTML)  → Network-First, fallback /offline.html
 *  5. SKIP_WAITING message → user-controlled update
 */

const CACHE_NAMES = {
  IMAGES: "cloudinary-images-v21",
  STATIC: "static-assets-v21",
  PAGES:  "pages-v21",
};

self.addEventListener("install", (event) => {
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

  // 2. Static JS / CSS / Fonts → Stale-While-Revalidate
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
            const contentType = res.headers.get("content-type") || "";
            if (res.status === 200 && !contentType.includes("text/html")) {
              try { cache.put(request, res.clone()); } catch (_) {}
            }
            return res;
          }).catch(() => {
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

          return cached || fetchPromise;
        })
      )
    );
    return;
  }

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
