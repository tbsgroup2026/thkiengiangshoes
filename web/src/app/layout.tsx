import type { Metadata, Viewport } from "next";
import "./globals.css";
import DevToolsShield from "@/components/DevToolsShield";
import NotificationInitializer from "@/components/NotificationInitializer";

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

import { KaizenStatsProvider } from "@/context/KaizenStatsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased font-sans"
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
                    if (key !== 'skechers-tbs-v17-no-api-404-cache') {
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
              window.addEventListener('error', function(e) {
                var msg = e && (e.message || (e.error && e.error.message)) || '';
                if (msg.includes('Unexpected token') || msg.includes('Loading chunk') || msg.includes('Failed to fetch dynamically imported module')) {
                  if (!sessionStorage.getItem('tbs_chunk_retry')) {
                    sessionStorage.setItem('tbs_chunk_retry', 'true');
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(function(regs) {
                        for (var i = 0; i < regs.length; i++) regs[i].unregister();
                        window.location.reload();
                      });
                    } else {
                      window.location.reload();
                    }
                  }
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-canvas text-ink">
        <DevToolsShield />
        <NotificationInitializer />
        <KaizenStatsProvider>
          {children}
        </KaizenStatsProvider>
      </body>
    </html>
  );
}
