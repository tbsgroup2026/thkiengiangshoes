// PWA Service Worker for Văn Phòng Chuỗi SKECHERS - TBS Group
const CACHE_NAME = "skechers-tbs-v7";
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.ico",
  "/icon.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Handling Mobile Push Notifications (Android & iOS 16.4+ Web Push)
self.addEventListener("push", (event) => {
  let payload = {
    title: "🔔 Văn Phòng Chuỗi SKECHERS",
    message: "Bạn có thông báo vận hành mới từ hệ thống TBS Group.",
    url: "/work",
    priority: "NORMAL",
    tag: `tbs_push_${Date.now()}`
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (e) {
      payload.message = event.data.text();
    }
  }

  const isUrgent =
    payload.priority === "CRITICAL" ||
    payload.priority === "URGENT" ||
    (payload.title && (payload.title.includes("🚨") || payload.title.includes("KHẨN")));

  const options = {
    body: payload.message,
    icon: "/icon.png",
    badge: "/icon.png",
    vibrate: isUrgent ? [500, 150, 500, 150, 500, 150, 500] : [200, 100, 200],
    tag: payload.tag || `tbs_push_${Date.now()}`,
    data: { url: payload.url || "/work" },
    requireInteraction: isUrgent,
    renotify: true,
    actions: [
      { action: "open", title: "Xem ngay" },
      { action: "close", title: "Đóng" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Click action on mobile notification toast / banner
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;

  const targetUrl = event.notification.data?.url || "/work";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          client.focus();
          if ("navigate" in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests for static assets, skip API routes
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  const url = new URL(event.request.url);

  // Network-first for Next.js build chunks to handle new deployments cleanly
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const contentType = response.headers.get("content-type") || "";

          // If SPA fallback returned HTML for a missing JS/CSS chunk, don't execute HTML as JS
          if (contentType.includes("text/html")) {
            if (url.pathname.endsWith(".js")) {
              return new Response("/* Chunk 404 */", {
                status: 200,
                headers: { "Content-Type": "application/javascript" },
              });
            }
            if (url.pathname.endsWith(".css")) {
              return new Response("/* CSS 404 */", {
                status: 200,
                headers: { "Content-Type": "text/css" },
              });
            }
          }

          // Handle 200 OK and 304 Not Modified from Cloudflare Edge Server correctly
          if (response.ok || response.status === 304) {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return response;
          }

          // Only fallback if chunk returned 404
          if (response.status === 404) {
            return caches.match(event.request).then((cached) => {
              if (cached) return cached;
              return response;
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for offline PWA shell
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return (
          caches.match("/work") ||
          caches.match("/") ||
          new Response("Offline", {
            status: 503,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      });
    })
  );
});
