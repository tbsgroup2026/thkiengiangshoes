import type { Metadata, Viewport } from "next";
import "./globals.css";
import DevToolsShield from "@/components/DevToolsShield";
import NotificationInitializer from "@/components/NotificationInitializer";
import SWUpdateBanner from "@/components/SWUpdateBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#08221a",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang",
  description:
    "Hệ thống quản trị vận hành TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang (Gemba Walk, Cải tiến CI, Kaizen, Biểu mẫu, BI Dashboard 24/7).",
  keywords:
    "TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang, Công Ty Cổ Phần Thái Bình Kiên Giang, TBS Group, Gemba Walk, CI, Kaizen, Quản trị hằng ngày, Quản lý nhà máy",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang",
  },
  openGraph: {
    title: "TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang",
    description:
      "Trung tâm điều hành và quản trị số hoá vận hành TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang.",
    type: "website",
    images: ["/icon.png"],
  },
};

import { StatusCountsProvider } from "@/context/StatusCountsContext";
import { PerformanceProvider } from "@/context/PerformanceContext";
import { ServiceWorkerRegister } from "@/components/performance/ServiceWorkerRegister";
import { PerformanceDebugOverlay } from "@/components/performance/PerformanceDebugOverlay";
import { WebVitalsReporter } from "@/components/vitals/WebVitalsReporter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && 'caches' in window) {
                caches.keys().then(function(keys) {
                  keys.forEach(function(key) {
                    if (!key.includes('v22') && !key.includes('cloudinary') && !key.includes('static-assets')) {
                      caches.delete(key);
                    }
                  });
                });
              }
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason === undefined || !event.reason || (typeof event.reason === 'string' && event.reason === 'undefined')) {
                  event.preventDefault();
                }
              });
              // TỰ HỒI PHỤC khi trình duyệt đang giữ 1 bản HTML CŨ trỏ tới file JS đã bị xoá ở lần
              // deploy mới (tên file đổi theo content-hash mỗi build) — trước đây chỉ console.warn
              // rồi ĐỨNG YÊN, khiến trang kẹt mãi ở màn hình tĩnh lúc build (React không hydrate
              // được vì thiếu JS) — đúng lỗi "quét lại vẫn bị" người dùng báo cáo (có thể do 1 số
              // điểm Cloudflare edge chưa kịp cập nhật cache dù server đã có bản mới). Cho phép tự
              // reload TỐI ĐA 3 lần (mỗi lần cách nhau 1 chút để cache biên có cơ hội revalidate),
              // và nếu vẫn hỏng sau 3 lần, tự vẽ 1 màn hình báo lỗi + nút tải lại bằng JS THUẦN
              // (KHÔNG cần React) — vì lúc này React chắc chắn KHÔNG chạy được, mọi UI dựa vào React
              // (kể cả nút "Tải lại trang" trong PphScanClient) đều vô dụng.
              (function () {
                var MAX_ATTEMPTS = 3;
                var COUNT_KEY = 'tbs_chunk_recover_count';
                function isAssetLoadFailure(e) {
                  var target = e && e.target;
                  if (target && target.tagName === 'SCRIPT' && target.src) return true;
                  if (target && target.tagName === 'LINK' && target.href) return true;
                  var msg = (e && (e.message || (e.error && e.error.message))) || '';
                  return msg.includes('Unexpected token') || msg.includes('Loading chunk') || msg.includes('Failed to fetch dynamically imported module') || msg.includes('ChunkLoadError');
                }
                function showManualFallback() {
                  try {
                    var root = document.body;
                    if (!root || document.getElementById('tbs-recover-fallback')) return;
                    var box = document.createElement('div');
                    box.id = 'tbs-recover-fallback';
                    box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#f4f7f5;display:flex;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;';
                    box.innerHTML =
                      '<div style="background:#fff;border-radius:24px;padding:32px 24px;max-width:320px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.1);">' +
                      '<div style="font-weight:900;font-size:16px;color:#0f172a;margin-bottom:8px;">Không tải được trang</div>' +
                      '<div style="font-size:13px;color:#64748b;margin-bottom:20px;line-height:1.5;">Trình duyệt đang giữ 1 bản trang cũ. Vui lòng xoá bộ nhớ đệm hoặc thử lại.</div>' +
                      '<button id="tbs-recover-btn" style="width:100%;padding:12px;border-radius:12px;background:#006838;color:#fff;font-weight:800;font-size:14px;border:none;">Thử tải lại</button>' +
                      '</div>';
                    root.appendChild(box);
                    var btn = document.getElementById('tbs-recover-btn');
                    if (btn) btn.addEventListener('click', function () {
                      try { sessionStorage.removeItem(COUNT_KEY); } catch (_) {}
                      window.location.reload();
                    });
                  } catch (_) {}
                }
                window.addEventListener('error', function (e) {
                  if (!isAssetLoadFailure(e)) return;
                  console.warn('[TBS App] Static asset load failed — likely stale cached page, attempting recovery:', e);
                  var attempt = 0;
                  try { attempt = parseInt(sessionStorage.getItem(COUNT_KEY) || '0', 10) || 0; } catch (_) {}
                  if (attempt >= MAX_ATTEMPTS) {
                    console.warn('[TBS App] Already retried ' + MAX_ATTEMPTS + ' times — showing manual fallback instead of looping.');
                    showManualFallback();
                    return;
                  }
                  try { sessionStorage.setItem(COUNT_KEY, String(attempt + 1)); } catch (_) {}
                  setTimeout(function () { window.location.reload(); }, 600 + attempt * 700);
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-canvas text-ink" suppressHydrationWarning>
        <DevToolsShield />
        <NotificationInitializer />
        <WebVitalsReporter />
        {/* FIX: Banner thông báo SW update — user-controlled, không tự reload */}
        <SWUpdateBanner />
        <PerformanceProvider>
          <ServiceWorkerRegister />
          <StatusCountsProvider>
            {children}
          </StatusCountsProvider>
          <PerformanceDebugOverlay />
        </PerformanceProvider>
      </body>
    </html>
  );
}
