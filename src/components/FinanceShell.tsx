"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import { getCurrentUser } from "@/lib/userProfiles";
import { usePermission } from "@/hooks/usePermission";
import {
  IconHome,
  IconCalculator,
  IconWallet,
  IconFileInvoice,
  IconUsers,
  IconCalendarEvent,
  IconChartPie,
  IconDeviceDesktop,
  IconPackage,
  IconArrowsRightLeft,
  IconChartBar,
  IconShieldCheck,
  IconList,
  IconSettings,
  IconBell,
  IconMaximize,
  IconChevronDown,
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconArrowLeft,
  IconMenu2,
  IconX,
  IconLock,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface FinanceShellProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  title?: string;
  badge?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  activeSubmenu?: string;
}

export default function FinanceShell({
  children,
  breadcrumbs = [
    { label: "Kế toán & Quản trị", href: "/finance" },
    { label: "Thu – Chi", href: "/finance/thu-chi" },
  ],
  title,
  actions,
  activeSubmenu,
}: FinanceShellProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isExecutiveOrAdmin, canEditModule, roles, user: sessionUser } = usePermission();

  // Cho phép truy cập phân hệ Kế toán & Tài chính nếu là: IT, Admin, Sếp (isExecutiveOrAdmin), hoặc Kế toán (canEditModule("finance") / accountant)
  const canViewFinance =
    isExecutiveOrAdmin ||
    canEditModule("finance") ||
    roles.includes("accountant") ||
    roles.includes("finance") ||
    (sessionUser as any)?.roleCode === "KE_TOAN" ||
    (sessionUser as any)?.department?.toLowerCase().includes("kế toán") ||
    (sessionUser as any)?.managedDepartmentId === "accounting";
  const [userInfo, setUserInfo] = useState<{
    name: string;
    title: string;
    avatar: string;
  }>({
    name: "Cán Bộ Nhân Viên",
    title: "Cán Bộ Công Nhân Viên",
    avatar: "/images/tbs-logo.png",
  });

  useEffect(() => {
    function loadUser() {
      const cur = getCurrentUser();
      if (cur && cur.name) {
        setUserInfo({
          name: cur.name,
          title: cur.title || "Cán Bộ Công Nhân Viên",
          avatar: cur.avatar || "/images/tbs-logo.png",
        });
      }
    }

    loadUser();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_profile_updated", loadUser);
      return () => window.removeEventListener("tbs_profile_updated", loadUser);
    }
  }, []);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "tong-quan": true,
    "thu-chi": true,
    "hoa-don": false,
    "cong-no": false,
    "ngan-sach": false,
    "chi-phi": false,
    "tai-san": false,
    "vat-tu-kho": false,
    "doi-soat": false,
    "bao-cao": false,
  });

  const toggleSubmenu = (key: string) => {
    setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems = [
    {
      key: "tong-quan",
      label: "Tổng quan",
      icon: IconHome,
      href: "/finance",
      subItems: [
        { label: "Bàn làm việc kế toán", href: "/finance?tab=desk" },
        { label: "Tổng quan 10 phân hệ", href: "/finance?tab=overview" },
      ],
    },
    {
      key: "thu-chi",
      label: "Thu – Chi",
      icon: IconWallet,
      href: "/finance/thu-chi",
      subItems: [
        { label: "Phiếu chi", href: "/finance/thu-chi/phieu-chi" },
        { label: "Phiếu thu", href: "/finance/thu-chi/phieu-thu" },
        { label: "Tạm ứng", href: "/finance/thu-chi/tam-ung" },
        { label: "Hoàn ứng", href: "/finance/thu-chi/hoan-ung" },
        { label: "Quỹ tiền mặt", href: "/finance/thu-chi/quy-tien-mat" },
        { label: "Ngân hàng", href: "/finance/thu-chi/ngan-hang" },
      ],
    },
    {
      key: "hoa-don",
      label: "Hóa đơn",
      icon: IconFileInvoice,
      href: "/finance/hoa-don",
      subItems: [
        { label: "Hóa đơn đầu vào", href: "/finance/hoa-don/dau-vao" },
        { label: "Hóa đơn đầu ra", href: "/finance/hoa-don/dau-ra" },
        { label: "Tra cứu hóa đơn", href: "/finance/hoa-don/tra-cuu" },
      ],
    },
    {
      key: "cong-no",
      label: "Công nợ",
      icon: IconUsers,
      href: "/finance/cong-no",
      subItems: [
        { label: "Công nợ phải trả", href: "/finance/cong-no/phai-tra" },
        { label: "Công nợ phải thu", href: "/finance/cong-no/phai-thu" },
        { label: "Đối tác & NCC", href: "/finance/cong-no/doi-tac" },
      ],
    },
    {
      key: "ngan-sach",
      label: "Ngân sách",
      icon: IconCalendarEvent,
      href: "/finance/ngan-sach",
      subItems: [
        { label: "Lập ngân sách", href: "/finance/ngan-sach/lap-ngan-sach" },
        { label: "Phân bổ phòng ban", href: "/finance/ngan-sach/phan-bo" },
        { label: "Budget vs Actual", href: "/finance/ngan-sach/budget-vs-actual" },
      ],
    },
    {
      key: "chi-phi",
      label: "Chi phí",
      icon: IconChartPie,
      href: "/finance/chi-phi",
      subItems: [
        { label: "Chi phí văn phòng", href: "/finance/chi-phi/van-phong" },
        { label: "Chi phí công tác", href: "/finance/chi-phi/cong-tac" },
        { label: "Chi phí R&D", href: "/finance/chi-phi/rd" },
      ],
    },
    {
      key: "tai-san",
      label: "Tài sản",
      icon: IconDeviceDesktop,
      href: "/finance/tai-san",
      subItems: [
        { label: "Danh mục tài sản", href: "/finance/tai-san?tab=list" },
        { label: "Khấu hao tài sản", href: "/finance/tai-san?tab=khau_hao" },
      ],
    },
    {
      key: "vat-tu-kho",
      label: "Kho / Vật tư",
      icon: IconPackage,
      href: "/finance/vat-tu-kho",
      subItems: [
        { label: "Nhập kho", href: "/finance/vat-tu-kho?tab=nhap" },
        { label: "Xuất kho", href: "/finance/vat-tu-kho?tab=xuat" },
        { label: "Tồn kho an toàn", href: "/finance/vat-tu-kho?tab=ton" },
      ],
    },
    {
      key: "doi-soat",
      label: "Đối soát",
      icon: IconArrowsRightLeft,
      href: "/finance/doi-soat",
      subItems: [
        { label: "Đối soát ngân hàng", href: "/finance/doi-soat?tab=bank" },
        { label: "Đối chiếu công nợ", href: "/finance/doi-soat?tab=debt" },
      ],
    },
    {
      key: "bao-cao",
      label: "Báo cáo",
      icon: IconChartBar,
      href: "/finance/bao-cao",
      subItems: [
        { label: "Báo cáo tài chính", href: "/finance/bao-cao" },
        { label: "Báo cáo dòng tiền", href: "/finance/bao-cao?tab=cf" },
      ],
    },
    {
      key: "phe-duyet",
      label: "Phê duyệt",
      icon: IconShieldCheck,
      href: "/finance/phe-duyet",
    },
    {
      key: "danh-muc",
      label: "Danh mục",
      icon: IconList,
      href: "/finance",
      subItems: [
        { label: "Hệ thống tài khoản", href: "/finance" },
        { label: "Danh mục đối tác", href: "/finance/cong-no/doi-tac" },
      ],
    },
    {
      key: "cai-dat",
      label: "Cài đặt",
      icon: IconSettings,
      href: "/finance",
      subItems: [
        { label: "Mẫu số chứng từ", href: "/finance" },
        { label: "Quy trình phê duyệt", href: "/finance/phe-duyet" },
      ],
    },
  ];

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.href !== "/finance" && pathname.startsWith(item.href)) {
        setExpandedMenus((prev) => ({ ...prev, [item.key]: true }));
      }
    });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f4f7f5] flex text-slate-800 font-sans antialiased selection:bg-[#006838] selection:text-white">
      {/* ════════════════════════════════════════════════════════════════
          SIDEBAR NAVIGATION (UNIFIED BRANDING & TYPOGRAPHY)
         ════════════════════════════════════════════════════════════════ */}
      <aside
        className={`hidden lg:flex ${
          isSidebarCollapsed ? "w-20" : "w-64 lg:w-72"
        } bg-white border-r border-slate-200/90 flex-col flex-shrink-0 transition-all duration-300 select-none z-30 sticky top-0 h-screen shadow-2xs`}
      >
        {/* Sidebar Header Brand Logo */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0 min-h-[58px]">
          {!isSidebarCollapsed ? (
            <Link
              href="/"
              title="Về Trang Chủ TBS Group (https://vpchuoiskechers.tbsgroup2026.workers.dev)"
              className="flex items-center gap-2 group overflow-hidden cursor-pointer min-w-0"
            >
              <img
                src="/images/tbs-logo.png"
                alt="TBS Group Logo"
                className="h-7 w-auto object-contain group-hover:scale-105 transition-transform flex-shrink-0"
              />
            </Link>
          ) : (
            <Link href="/" className="mx-auto hover:opacity-80 transition-opacity" title="Về Trang Chủ TBS Group">
              <img
                src="/images/tbs-logo.png"
                alt="TBS Logo"
                className="h-6 w-auto object-contain"
              />
            </Link>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer flex-shrink-0 ml-1"
            title={isSidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {isSidebarCollapsed ? <IconChevronRight size={15} /> : <IconChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation List Accordions */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/finance"
                ? pathname === "/finance"
                : pathname.startsWith(item.href);
            const isExpanded = expandedMenus[item.key] ?? false;

            return (
              <div key={item.key} className="space-y-0.5">
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "text-[#006838] bg-emerald-50/70 font-extrabold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={17} className={isActive ? "text-[#006838]" : "text-slate-500"} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && (
                        <span className="text-slate-400">
                          {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                        </span>
                      )}
                    </button>

                    {/* Submenu links */}
                    {!isSidebarCollapsed && isExpanded && (
                      <div className="pl-7 pr-2 py-1 space-y-0.5 border-l border-slate-200 ml-5 my-0.5">
                        {item.subItems.map((sub, sIdx) => {
                          let isSubActive = false;
                          const cleanSubHref = sub.href.split("?")[0];
                          if (item.key === "tong-quan") {
                            if (sub.label === "Tổng quan 10 phân hệ") {
                              isSubActive = pathname === "/finance" && activeSubmenu === "Tổng quan 10 phân hệ";
                            } else {
                              isSubActive = pathname === "/finance" && activeSubmenu !== "Tổng quan 10 phân hệ";
                            }
                          } else {
                            isSubActive =
                              pathname === cleanSubHref ||
                              activeSubmenu === sub.label ||
                              (isActive && sIdx === 0 && !activeSubmenu && pathname === item.href);
                          }
                          return (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                isSubActive
                                  ? "bg-emerald-100/70 text-[#006838] font-black"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                              }`}
                            >
                              {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-[#006838] flex-shrink-0" />}
                              <span className="truncate">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#e6f4ed] text-[#006838] font-extrabold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={17} className={isActive ? "text-[#006838]" : "text-slate-500"} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Unified Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <img
                  src="/images/tbs-logo.png"
                  alt="TBS Logo"
                  className="h-3.5 w-auto object-contain opacity-70"
                />
                <span className="font-bold text-slate-600">TBS GROUP</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono text-[9px] text-slate-400">© 2026</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#006838] font-extrabold text-[9px] border border-emerald-200">
                ERP LIVE
              </span>
            </div>
          ) : (
            <span className="font-mono text-[9px] mx-auto text-[#006838] font-black">TBS</span>
          )}
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA (HEADER TOP + BODY)
         ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top App Header */}
        <header className="bg-white border-b border-slate-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Drawer Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#006838] hover:text-white transition-colors flex-shrink-0 cursor-pointer"
              title="Mở danh mục Kế toán"
            >
              {isMobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight truncate">
                Xin chào, <span className="text-[#006838]">{userInfo.name}!</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[170px] sm:max-w-none">
                Văn phòng Chuỗi SKECHERS - R&amp;D Center | Kế toán &amp; Quản trị
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Link back to Work Dashboard */}
            <Link
              href="/work?dept=finance"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-[#006838] border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5"
            >
              <IconArrowLeft size={14} />
              <span className="hidden xs:inline">Về Dashboard</span>
              <span className="xs:hidden">Về DB</span>
            </Link>

            {/* Notification Icon */}
            <button className="relative w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <IconBell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                2
              </span>
            </button>

            {/* Fullscreen Icon */}
            <button className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <IconMaximize size={15} />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <UserAvatar
                src={userInfo.avatar}
                name={userInfo.name}
                size="sm"
                showOnlineBadge={true}
              />
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-xs font-black text-slate-900 block truncate max-w-[100px]">{userInfo.name}</span>
                <span className="text-[10px] text-slate-500 block font-medium truncate max-w-[100px]">{userInfo.title}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <img src="/images/tbs-logo.png" alt="TBS" className="h-6 w-auto object-contain" />
                  <span className="font-bold text-xs text-slate-900">Kế Toán &amp; Quản Trị</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <IconX size={18} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/finance"
                      ? pathname === "/finance"
                      : pathname.startsWith(item.href);
                  const isExpanded = expandedMenus[item.key] ?? false;

                  return (
                    <div key={item.key} className="space-y-0.5">
                      {item.subItems ? (
                        <div>
                          <button
                            onClick={() => toggleSubmenu(item.key)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? "text-[#006838] bg-emerald-50/70 font-extrabold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon size={17} className={isActive ? "text-[#006838]" : "text-slate-500"} />
                              <span>{item.label}</span>
                            </div>
                            <span className="text-slate-400">
                              {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="pl-8 pr-2 py-1 space-y-1">
                              {item.subItems.map((sub, sIdx) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={sIdx}
                                    href={sub.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                      isSubActive
                                        ? "text-[#006838] font-bold bg-emerald-50"
                                        : "text-slate-500 hover:text-slate-900"
                                    }`}
                                  >
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? "text-[#006838] bg-emerald-50/70 font-extrabold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={17} className={isActive ? "text-[#006838]" : "text-slate-500"} />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 space-y-4 max-w-7xl w-full mx-auto pb-24 sm:pb-6">
          {/* Breadcrumb Bar */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">›</span>}
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-[#006838] transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 font-bold">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Action Header Title Bar (If provided) */}
          {title && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
                  <IconFileInvoice size={20} />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {title}
                </h2>
              </div>

              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}

          {/* Main Slot */}
          {!canViewFinance ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto my-6 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
                <IconLock size={32} />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider">
                  Bảo Mật Nội Bộ - Giới Hạn Truy Cập
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quyền Truy Cập Phân Hệ Kế Toán Bị Khóa
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
                  Dữ liệu chỉ số tài chính, doanh thu, ngân sách và báo cáo tài chính hợp nhất của Chuỗi SKECHERS 
                  chỉ dành riêng cho <strong className="text-slate-900">Ban Giám Đốc (Sếp), Phòng Kế Toán &amp; IT Team Chuyển Đổi Số</strong>.
                </p>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-left text-xs space-y-1.5 max-w-lg mx-auto">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <IconAlertTriangle size={16} className="text-amber-600" />
                  <span>Yêu cầu hỗ trợ mở quyền truy cập:</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Nếu bạn thuộc bộ phận Kế toán hoặc cần xem báo cáo tài chính phục vụ công tác điều hành, vui lòng liên hệ 
                  <strong className="text-amber-950 font-black"> Ban Giám Đốc</strong> hoặc <strong className="text-amber-950 font-black">IT - Team Chuyển Đổi Số (MSNV: 202608001 / 202608002)</strong> để được phê duyệt cấp quyền.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#004d29] text-white text-xs font-bold transition shadow-sm"
                >
                  <IconArrowLeft size={16} />
                  <span>Quay về Dashboard Công Việc</span>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
