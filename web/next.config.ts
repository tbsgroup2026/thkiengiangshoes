import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Khôi phục output:'export' — khớp đúng cách trang thkiengiangshoes thật sự deploy (Cloudflare
  // Worker phục vụ file tĩnh qua public/_worker.js, KHÔNG chạy Next.js server). Phần "ghi dữ
  // liệu" của MMTB (trước đây là các route.ts ở app/api/maintenance/**, đã xoá) giờ viết bằng
  // JavaScript thuần gắn thẳng vào public/_worker.js — xem hàm handleMmtbKG() trong file đó.
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
