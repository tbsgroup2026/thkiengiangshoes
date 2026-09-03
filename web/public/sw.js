// PWA Service Worker for Văn Phòng Chuỗi SKECHERS - TBS Group
const CACHE_NAME = "skechers-tbs-v18-no-api-fix";
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
  // CRITICAL RULE 1: Only handle http/https requests. Ignore chrome-extension://, file://, etc.
  if (!event.request.url.startsWith("http://") && !event.request.url.startsWith("https://")) {
    return;
  }

  // CRITICAL RULE 2: NEVER intercept or cache API requests. Pass directly to browser network!
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  // Network-First for HTML navigation to guarantee latest HTML and CSS/JS hashes
  if (event.request.mode === "navigate" || (event.request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200 && (event.request.url.startsWith("http://") || event.request.url.startsWith("https://"))) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy).catch(() => {}));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match("/");
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) - Cache First with Network Fallback. NEVER return index HTML on failure!
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200 && (event.request.url.startsWith("http://") || event.request.url.startsWith("https://"))) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy).catch(() => {}));
          }
          return networkResponse;
        });
    })
  );
});

