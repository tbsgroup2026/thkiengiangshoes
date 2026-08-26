"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconUsers,
  IconShield,
  IconBuilding,
  IconFileText,
  IconChartBar,
  IconAlertTriangle,
  IconArrowLeft,
  IconLayoutDashboard,
  IconShoe,
  IconHome,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/userProfiles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { canAny, roles } = usePermission();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const userRoles: string[] = user?.roles || [];
        const empCode: string = user?.empCode || "";
        const roleCode: string = user?.roleCode || "";

        const hasAdminPermission =
          userRoles.includes("admin") ||
          userRoles.includes("ceo") ||
          userRoles.includes("deputy_ceo") ||
          userRoles.includes("director") ||
          userRoles.includes("deputy_director") ||
          roleCode === "SUPER_ADMIN" ||
          roleCode === "SYSTEM_ADMIN" ||
          roleCode === "TONG_GIAM_DOC" ||
          empCode === "202608001" ||
          empCode === "2026080001" ||
          empCode === "ADMIN-2026" ||
          empCode === "TGĐ-001" ||
          empCode === "PTGĐ-002" ||
          empCode === "GĐ-003" ||
          empCode === "PGĐ-004" ||
          canAny([
            PERMISSIONS.ADMIN_MANAGE_USERS,
            PERMISSIONS.ADMIN_MANAGE_ROLES,
            PERMISSIONS.ADMIN_MANAGE_DEPARTMENTS,
          ]);

        if (!hasAdminPermission) {
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (e) {
        setIsAuthorized(false);
      }
    }
  }, [canAny, roles, router]);

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/40">
          <IconAlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-black mb-2">Không Có Quyền Truy Cập (403 Forbidden)</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Tài khoản của bạn không được cấp quyền Quản trị hệ thống (`admin`). Đang tự động chuyển hướng về trang làm việc...
        </p>
        <Link
          href="/work"
          className="px-6 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-bold text-xs flex items-center gap-2"
        >
          <IconArrowLeft size={16} />
          <span>Về trang Dashboard ngay</span>
        </Link>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <span className="text-xs font-bold text-slate-400">⏳ Đang xác thực quyền truy cập Admin...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Admin sidebar (Desktop Only) */}
      <aside className="hidden lg:flex w-64 bg-[#00381e] text-white p-6 border-r border-[#006838]/20 flex-col justify-between shadow-xl flex-shrink-0">
        <div>
          <div className="mb-8 pb-4 border-b border-white/10">
            <Link href="/work" className="flex items-center gap-2 group">
              <img
                src="/images/tbs-logo.png"
                alt="TBS Group Logo"
                className="h-7 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform"
              />
              <div className="h-4 w-[1px] bg-white/30" />
              <img
                src="/images/skechers-logo.png"
                alt="Skechers Logo"
                className="h-5 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                QUẢN TRỊ HỆ THỐNG
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                PROD
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-extrabold">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                pathname === "/admin"
                  ? "bg-white/20 text-white font-black shadow-md border border-white/25"
                  : "hover:bg-white/10 text-emerald-100/90 hover:text-white"
              }`}
            >
              <IconLayoutDashboard size={18} />
              <span>Cổng Quản trị Admin</span>
            </Link>

            <Link
              href="/admin/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                pathname === "/admin/users"
                  ? "bg-white/20 text-white font-black shadow-md border border-white/25"
                  : "hover:bg-white/10 text-emerald-100/90 hover:text-white"
              }`}
            >
              <IconUsers size={18} />
              Quản lý nhân viên
            </Link>
            <Link
              href="/admin/roles"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                pathname === "/admin/roles"
                  ? "bg-white/20 text-white font-black shadow-md border border-white/25"
                  : "hover:bg-white/10 text-emerald-100/90 hover:text-white"
              }`}
            >
              <IconShield size={18} />
              Vai trò (Roles)
            </Link>
            <Link
              href="/admin/departments"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                pathname === "/admin/departments"
                  ? "bg-white/20 text-white font-black shadow-md border border-white/25"
                  : "hover:bg-white/10 text-emerald-100/90 hover:text-white"
              }`}
            >
              <IconBuilding size={18} />
              Phòng ban
            </Link>

            <Link
              href="/admin?tab=products"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-emerald-100/90 hover:text-white transition"
            >
              <IconShoe size={18} />
              <span>Dòng sản phẩm</span>
            </Link>

            <Link
              href="/admin?tab=landing_cms"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-emerald-100/90 hover:text-white transition"
            >
              <IconHome size={18} />
              <span>Quản trị Trang chủ</span>
            </Link>

            <div className="pt-4 mt-4 border-t border-white/10 text-[10px] text-emerald-300/70 font-black uppercase tracking-widest px-4">
              Phân hệ khác
            </div>
            <Link
              href="/documents/templates"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition text-emerald-100/90"
            >
              <IconFileText size={18} />
              Số hóa giấy tờ
            </Link>
            <Link
              href="/work"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white transition text-emerald-100/90"
            >
              <IconChartBar size={18} />
              BI Dashboard
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/50">
          <span>TBS Group v1.0</span>
          <Link href="/login" className="text-rose-300 hover:underline font-bold">
            Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-[#00381e] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-[#006838]/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
            </button>
            <span className="font-extrabold text-xs text-white">Quản Trị Admin</span>
          </div>
          <Link href="/work" className="text-xs font-bold text-emerald-300 hover:underline">
            Về Dashboard
          </Link>
        </header>

        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex">
            <div className="w-4/5 max-w-xs bg-[#00381e] text-white h-full shadow-2xl flex flex-col p-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider">Cổng Quản Trị</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-white/10 text-white"
                >
                  <IconX size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-1 text-xs font-bold">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10"
                >
                  <IconLayoutDashboard size={18} />
                  <span>Cổng Quản trị Admin</span>
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10"
                >
                  <IconUsers size={18} />
                  <span>Quản lý nhân viên</span>
                </Link>
                <Link
                  href="/admin/roles"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10"
                >
                  <IconShield size={18} />
                  <span>Vai trò (Roles)</span>
                </Link>
                <Link
                  href="/admin/departments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10"
                >
                  <IconBuilding size={18} />
                  <span>Phòng ban</span>
                </Link>
                <Link
                  href="/admin?tab=products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10"
                >
                  <IconShoe size={18} />
                  <span>Dòng sản phẩm</span>
                </Link>
                <Link
                  href="/admin?tab=landing_cms"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10"
                >
                  <IconHome size={18} />
                  <span>Quản trị Trang chủ</span>
                </Link>
              </nav>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-6 lg:p-10 overflow-y-auto min-w-0 pb-24 sm:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
