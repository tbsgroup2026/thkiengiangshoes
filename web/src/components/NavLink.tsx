/**
 * NavLink — wrapper của next/link với prefetch={false} mặc định.
 *
 * FIX: Next.js Link mặc định prefetch tất cả links khi vào viewport.
 * Trên mạng yếu (3G/4G nhà máy), điều này gây hàng chục request JS chunk
 * đồng thời, chiếm CPU/băng thông → onClick handlers không phản hồi.
 *
 * NavLink tắt prefetch mặc định. Nếu cần prefetch cho CTA quan trọng,
 * truyền prefetch={true} tường minh.
 *
 * Usage: thay `import Link from 'next/link'` bằng `import NavLink from '@/components/NavLink'`
 *        rồi dùng <NavLink> y hệt <Link> — props hoàn toàn tương thích.
 */
import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";

type NavLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children?: React.ReactNode;
  };

export default function NavLink({ prefetch = false, ...props }: NavLinkProps) {
  // Gọi NextLink (next/link) — KHÔNG phải NavLink chính nó (tránh infinite recursion)
  return <NextLink prefetch={prefetch} {...props} />;
}

