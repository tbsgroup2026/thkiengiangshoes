// PWA Service Worker for Văn Phòng Chuỗi SKECHERS - TBS Group
// v19: never cache Next.js App Router's static-export RSC payload files (out/**/index.txt,
// __next._full.txt, __next._tree.txt, __PAGE__.txt...). Với output:'export', mỗi lần bấm <Link>
// chuyển trang, Next fetch 1 file .txt CỐ ĐỊNH tên (không đổi giữa các lần deploy) để lấy dữ liệu
// điều hướng mà không cần tải lại cả trang. Cache-First trên URL cố định đó khiến trình duyệt giữ
// mãi bản .txt của lần deploy CŨ — mỗi lần bấm nav sau đó Next nhận dữ liệu cũ/không khớp mã đang
// chạy, âm thầm thất bại, người dùng phải bấm nhiều lần mới có 1 lần rơi vào full reload thật.
// Đổi tên CACHE_NAME lên v19 để buộc xoá sạch cache cũ (đang chứa các .txt lỗi thời) ở mọi trình
// duyệt đã ghé site trước đây.
const CACHE_NAME = "skechers-tbs-v19-no-stale-rsc";
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

  // CRITICAL RULE 3: NEVER cache Next.js App Router's static-export RSC/navigation payload files
  // (mọi file .txt trong out/**, VD /work/index.txt, __next._full.txt, __PAGE__.txt...). Tên file
  // này CỐ ĐỊNH, không đổi giữa các lần deploy — Cache-First trên nó sẽ giữ mãi dữ liệu điều
  // hướng của bản build cũ, khiến click chuyển trang (client-side navigation) âm thầm thất bại.
  // Luôn lấy trực tiếp từ mạng, không lưu cache.
  if (event.request.url.split("?")[0].endsWith(".txt")) {
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

