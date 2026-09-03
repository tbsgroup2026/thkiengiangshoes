"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/userProfiles";

/**
 * Bọc quanh các route cần đăng nhập (VD /work, /finance, /rooms, /business-trip).
 *
 * Vì site build kiểu tĩnh (output:'export'), middleware "src/proxy.ts" — nơi lẽ ra chặn các
 * route này ở server — KHÔNG hề chạy trên production (middleware chỉ chạy khi có Next.js server
 * thật). Nhiều trang chỉ gọi getCurrentUser() để LẤY thông tin hiển thị (tên, avatar...) chứ
 * không hề kiểm tra kết quả trả về null rồi chuyển hướng — nên trước đây bấm thẳng vào các route
 * "protected" (kể cả khi chưa đăng nhập) vẫn vào được, chỉ là hiển thị dữ liệu mặc định/rỗng.
 * Component này là lớp chặn thật sự duy nhất còn hoạt động ở production.
 *
 * `publicSubPaths`: các đường dẫn con vẫn công khai dù nằm trong route được bọc (VD
 * "/work/kaizen/register" — form đăng ký Kaizen mở, ai cũng vào được, không cần đăng nhập).
 */
export default function RequireAuth({
  children,
  publicSubPaths = [],
}: {
  children: React.ReactNode;
  publicSubPaths?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isPublic = publicSubPaths.some(
    (p) => pathname === p || pathname?.startsWith(p + "/")
  );

  useEffect(() => {
    if (isPublic) {
      setIsAuthorized(true);
      return;
    }
    if (typeof window === "undefined") return;
    const user = getCurrentUser();
    if (!user) {
      router.replace(`/login?redirect_uri=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    setIsAuthorized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isPublic]);

  if (isPublic) return <>{children}</>;

  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen bg-[#08221a] flex items-center justify-center">
        <span className="text-xs font-bold text-emerald-300/80">⏳ Đang xác thực đăng nhập...</span>
      </div>
    );
  }

  return <>{children}</>;
}
