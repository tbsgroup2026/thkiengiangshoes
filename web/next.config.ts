import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ĐÃ BỎ output: 'export' — chuyển hẳn sang chạy động thật trên Cloudflare Workers (qua
  // OpenNext, xem open-next.config.ts + wrangler.jsonc), không còn xuất tĩnh thuần nữa. Static
  // export xung đột với proxy.ts (middleware) nên không dùng được chung với nhau; chạy động cho
  // phép route API thật sự chạy trên production, đúng yêu cầu "Hướng A" đã chốt.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
