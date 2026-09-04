'use client';

import { useEffect, useState } from 'react';
import NavLink from "@/components/NavLink";
import { usePathname, useRouter } from 'next/navigation';
import {
  IconTools,
  IconClipboardList,
  IconDeviceLaptop,
  IconChartPie,
  IconStar,
  IconCategory,
  IconMapPin,
  IconLayoutDashboard,
  IconUsers,
  IconBulb,
  IconAlertTriangle,
  IconCalendarStats,
  IconCircleCheck,
  IconPackage,
  IconStopwatch,
  IconSpeakerphone,
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconLogout,
} from '@tabler/icons-react';
import { MMTB_NAV } from '@/lib/mmtbNav';

// Khung sườn RIÊNG cho khu vực "Quản Lý MMTB" — độc lập hoàn toàn với tbsMayMoc, giao diện tự do
// thay đổi ở đây không ảnh hưởng gì bên đó. Menu đầy đủ theo cấu trúc admin tbsMayMoc (xem
// lib/mmtbNav.ts), có nhóm "Danh Mục" xổ xuống.
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  IconTools,
  IconClipboardList,
  IconDeviceLaptop,
  IconChartPie,
  IconStar,
  IconCategory,
  IconMapPin,
  IconLayoutDashboard,
  IconUsers,
  IconBulb,
  IconAlertTriangle,
  IconCalendarStats,
  IconCircleCheck,
  IconPackage,
  IconStopwatch,
  IconSpeakerphone,
};

export default function MaintenanceShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ categories: true });

  // MMTB có đăng nhập RIÊNG (cookie mmtb_token, xem /maintenance/login) — không dùng chung phiên
  // đăng nhập của cả trang thkiengiangshoes. Mọi trang bọc trong MaintenanceShell đều tự kiểm tra
  // ở đây, chưa đăng nhập thì đưa thẳng về /maintenance/login. CHỈ coi là đã đăng nhập khi API trả
  // đúng 200 — mọi mã khác (401 chưa đăng nhập, 404 endpoint không tồn tại vd chạy nhầm "next dev"
  // thay vì "wrangler dev", 500...) đều đưa về /maintenance/login, không cho vào xem "hờ" như
  // trước (trước đây chỉ chặn đúng 401, các mã khác lọt qua).
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/mmtb-kg/me')
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          setAuthChecked(true);
          return;
        }
        router.replace('/maintenance/login');
      })
      .catch(() => {
        if (!cancelled) router.replace('/maintenance/login');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await fetch('/api/mmtb-kg/logout', { method: 'POST' }).catch(() => {});
    router.replace('/maintenance/login');
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-tbs-light flex items-center justify-center">
        <div className="text-xs font-semibold text-gray-400">Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tbs-light flex text-slate-800 font-sans antialiased">
      {/* SIDEBAR — nền tối xanh đậm, đồng bộ màu trang đăng nhập (#08221a) */}
      <aside
        className={`hidden lg:flex ${collapsed ? 'w-20' : 'w-64'} bg-[#08221a] border-r border-white/10 flex-col flex-shrink-0 transition-all duration-300 sticky top-0 h-screen shadow-xl`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10 min-h-[58px]">
          {!collapsed ? (
            <NavLink href="/work" className="flex items-center gap-2 min-w-0">
              <img src="/images/tbs-logo.png" alt="TBS Group Logo" className="h-7 w-auto object-contain flex-shrink-0" />
              <span className="text-xs font-black text-white truncate">Quản Lý MMTB</span>
            </NavLink>
          ) : (
            <NavLink href="/work" className="mx-auto">
              <img src="/images/tbs-logo.png" alt="TBS Logo" className="h-6 w-auto object-contain" />
            </NavLink>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white flex-shrink-0 ml-1 transition-colors"
          >
            {collapsed ? <IconChevronRight size={15} /> : <IconChevronLeft size={15} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {MMTB_NAV.map((entry) => {
            if (entry.type === 'link') {
              const Icon = ICONS[entry.iconName] ?? IconTools;
              const isActive = pathname === entry.href;
              return (
                <NavLink
                  key={entry.id}
                  href={entry.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 ${
                    isActive
                      ? 'bg-accent/20 text-accent-light font-extrabold border-accent-light'
                      : 'border-transparent text-white/55 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-accent-light' : 'text-white/40'} />
                  {!collapsed && <span className="truncate">{entry.label}</span>}
                </NavLink>
              );
            }

            // Nhóm xổ xuống (Danh Mục) — mở/đóng độc lập, tự mở nếu đang đứng ở 1 trang con.
            const GroupIcon = ICONS[entry.iconName] ?? IconCategory;
            const hasActiveChild = entry.children.some((c) => c.href === pathname);
            const isOpen = collapsed ? true : (openGroups[entry.id] ?? hasActiveChild);
            return (
              <div key={entry.id}>
                <button
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [entry.id]: !isOpen }))}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    hasActiveChild ? 'text-accent-light' : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <GroupIcon size={17} className={hasActiveChild ? 'text-accent-light' : 'text-white/40'} />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{entry.label}</span>
                      <IconChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-3.5 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
                    {entry.children.map((c) => {
                      const CIcon = ICONS[c.iconName] ?? IconTools;
                      const isActive = pathname === c.href;
                      return (
                        <NavLink
                          key={c.id}
                          href={c.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                            isActive ? 'bg-accent/20 text-accent-light' : 'text-white/40 hover:bg-white/[0.06] hover:text-white/80'
                          }`}
                        >
                          <CIcon size={14} className={isActive ? 'text-accent-light' : 'text-white/30'} />
                          <span className="truncate">{c.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-0.5">
          <NavLink
            href="/work"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors duration-150"
          >
            <IconArrowLeft size={16} />
            {!collapsed && <span>Về Trang Chủ</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors duration-150"
          >
            <IconLogout size={16} />
            {!collapsed && <span>Đăng Xuất MMTB</span>}
          </button>
        </div>
      </aside>

      {/* NỘI DUNG */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 sticky top-0 z-20 flex items-center justify-between gap-3 lg:hidden">
          <NavLink href="/work" className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <IconArrowLeft size={16} />
            Về Trang Chủ
          </NavLink>
        </header>
        <div className="px-4 sm:px-6 pt-4 hidden lg:block">
          <div className="text-[11px] font-semibold text-gray-400">
            <NavLink href="/work" className="hover:text-accent">Trang chủ</NavLink>
            <span className="mx-1.5">/</span>
            <span>Quản Lý MMTB</span>
            <span className="mx-1.5">/</span>
            <span className="text-tbs-dark">{title}</span>
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
