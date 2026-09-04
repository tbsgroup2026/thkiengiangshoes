import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Static export → Cloudflare Workers serves web/out/ via _worker.js proxy
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // FIX: Turbopack cần biết đúng root dir để tránh crash khi có nhiều lockfile
  // Không có config này → Turbopack dùng sai workspace → worker crash (0xC0000409)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
