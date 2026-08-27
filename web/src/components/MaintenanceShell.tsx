'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ categories: true });

  return (
    <div className="min-h-screen bg-tbs-light flex text-slate-800 font-sans antialiased">
      {/* SIDEBAR */}
      <aside
        className={`hidden lg:flex ${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200/90 flex-col flex-shrink-0 transition-all duration-300 sticky top-0 h-screen shadow-2xs`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100 min-h-[58px]">
          {!collapsed ? (
            <Link href="/work" className="flex items-center gap-2 min-w-0">
              <img src="/images/tbs-logo.png" alt="TBS Group Logo" className="h-7 w-auto object-contain flex-shrink-0" />
              <span className="text-xs font-black text-tbs-dark truncate">Quản Lý MMTB</span>
            </Link>
          ) : (
            <Link href="/work" className="mx-auto">
              <img src="/images/tbs-logo.png" alt="TBS Logo" className="h-6 w-auto object-contain" />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 ml-1"
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
                <Link
                  key={entry.id}
                  href={entry.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-emerald-50 text-accent font-extrabold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-accent' : 'text-slate-500'} />
                  {!collapsed && <span className="truncate">{entry.label}</span>}
                </Link>
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    hasActiveChild ? 'text-accent' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <GroupIcon size={17} className={hasActiveChild ? 'text-accent' : 'text-slate-500'} />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{entry.label}</span>
                      <IconChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-3.5 pl-3 border-l border-slate-100 space-y-0.5 mt-0.5">
                    {entry.children.map((c) => {
                      const CIcon = ICONS[c.iconName] ?? IconTools;
                      const isActive = pathname === c.href;
                      return (
                        <Link
                          key={c.id}
                          href={c.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            isActive ? 'bg-emerald-50 text-accent' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          <CIcon size={14} className={isActive ? 'text-accent' : 'text-slate-400'} />
                          <span className="truncate">{c.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <Link
            href="/work"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-tbs-dark"
          >
            <IconArrowLeft size={16} />
            {!collapsed && <span>Về Trang Chủ</span>}
          </Link>
        </div>
      </aside>

      {/* NỘI DUNG */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 sticky top-0 z-20 flex items-center justify-between gap-3 lg:hidden">
          <Link href="/work" className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <IconArrowLeft size={16} />
            Về Trang Chủ
          </Link>
        </header>
        <div className="px-4 sm:px-6 pt-4 hidden lg:block">
          <div className="text-[11px] font-semibold text-gray-400">
            <Link href="/work" className="hover:text-accent">Trang chủ</Link>
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
