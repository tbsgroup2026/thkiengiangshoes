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
  title: "Tổ hợp Kiên Giang - TBS Group",
  description:
    "Hệ thống quản trị vận hành Tổ hợp Kiên Giang - TBS Group (Gemba Walk, Cải tiến CI, Kaizen, Biểu mẫu, BI Dashboard 24/7).",
  keywords:
    "Tổ hợp Kiên Giang - TBS Group, Tổ hợp Kiên Giang, TBS Group, Gemba Walk, CI, Kaizen, Quản trị hằng ngày, Quản lý nhà máy",
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
    title: "Tổ hợp Kiên Giang - TBS Group",
  },
  openGraph: {
    title: "Tổ hợp Kiên Giang - TBS Group",
    description:
      "Trung tâm điều hành và quản trị số hoá vận hành Tổ hợp Kiên Giang - TBS Group.",
    type: "website",
    images: ["/icon.png"],
  },
};

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
                    if (key !== 'skechers-tbs-v11') {
                      caches.delete(key);
                    }
                  });
                });
              }
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
        {children}
      </body>
    </html>
  );
}
