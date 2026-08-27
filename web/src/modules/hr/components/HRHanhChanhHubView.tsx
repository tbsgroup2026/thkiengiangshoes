"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconLayoutGrid,
  IconBuilding,
  IconUsers,
  IconArrowRight,
  IconCheck,
  IconDoor,
  IconBriefcase,
  IconAddressBook,
  IconCalendarOff,
  IconClock,
  IconTrendingUp,
  IconSchool,
  IconWallet,
  IconUserPlus,
  IconFileSpreadsheet,
  IconChartPie,
  IconSparkles,
} from "@tabler/icons-react";

interface HRHanhChanhHubViewProps {
  onNavigateTab?: (tab: string) => void;
  onOpenApp?: (appName: string, path: string) => void;
}

export default function HRHanhChanhHubView({
  onNavigateTab,
  onOpenApp,
}: HRHanhChanhHubViewProps) {
  const router = RouterHook();
  const [activeModal, setActiveModal] = useState<{ title: string; desc: string } | null>(null);

  // Helper router hook for safe client side routing
  function RouterHook() {
    try {
      return useRouter();
    } catch {
      return null;
    }
  }

  const handleCardClick = (tabId: string, directUrl?: string, appTitle?: string) => {
    if (directUrl) {
      if (router) {
        router.push(directUrl);
      } else {
        window.location.href = directUrl;
      }
      return;
    }

    if (onNavigateTab) {
      onNavigateTab(tabId);
    } else if (appTitle) {
      setActiveModal({
        title: appTitle,
        desc: "Dữ liệu phân hệ đang được đồng bộ và sẵn sàng phục vụ tác nghiệp.",
      });
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-8 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════
          1. HERO HEADER BANNER (GREEN GRADIENT SKECHERS SYSTEM BRANDING)
         ════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-emerald-800/20 bg-slate-900 text-white p-6 sm:p-8 lg:p-9 group">
        {/* Office Real Background Photo - Brighter & Clearer (Shifted Down) */}
        <img
          src="/images/brands/Văn phòng/1787810869509_5373416762128407822_5373416762128407822_4243291c07f467487e67e1e1e47b8905.jpg"
          alt="Phân Hệ Nghiệp Vụ Nhân Sự - Hành Chánh"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] opacity-75 sm:opacity-80 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        />
        {/* Lighter Gradient Overlay - Dark on left for text readability, clear on right for photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-[#004d29]/45 to-slate-950/50 pointer-events-none" />

        {/* Subtle Decorative Grid Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Pill Row */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-lg border border-white/15 shadow-2xs">
              PHÂN HỆ NGHIỆP VỤ
            </span>

            <div className="px-3.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100 text-xs font-black backdrop-blur-md flex items-center gap-1.5 shadow-2xs">
              <IconLayoutGrid size={15} className="text-emerald-300" />
              <span>10 ứng dụng</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Nhân Sự – Hành Chánh
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
              Quản lý văn thư, tài sản, phòng họp, tuyển dụng và lịch công tác toàn chuỗi.
            </p>
          </div>

          {/* Bottom Operational Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-emerald-100 flex items-center gap-1.5 backdrop-blur-xs">
              Vận hành chuỗi SKECHERS
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-emerald-100 flex items-center gap-1.5 backdrop-blur-xs">
              Dữ liệu D1 Realtime
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          2. SECTION 1: HÀNH CHÍNH (2 CARDS)
         ════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3.5">
        {/* Section Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center border border-emerald-200/80 shadow-2xs shrink-0">
            <IconBuilding size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              HÀNH CHÍNH
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Quản lý hành chính, văn phòng và công tác
            </p>
          </div>
        </div>

        {/* 2 Equal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Quản lý phòng họp */}
          <div
            onClick={() => handleCardClick("rooms", "/rooms", "Quản lý phòng họp")}
            className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-[#006838]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Card Top: Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e6f4ed] text-[#006838] flex items-center justify-center border border-emerald-100/90 shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                  <IconDoor size={24} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#006838] transition-colors truncate">
                    Quản lý phòng họp
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    Đặt lịch, quản lý phòng họp, đón khách ngoài và trang thiết bị.
                  </p>
                </div>
              </div>

              {/* Bullet Checklist */}
              <ul className="space-y-1.5 pt-1 border-t border-slate-100">
                <li className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                  <IconCheck size={14} className="text-[#006838] shrink-0 stroke-[3]" />
                  <span>Đặt lịch phòng họp &amp; thiết bị</span>
                </li>
                <li className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                  <IconCheck size={14} className="text-[#006838] shrink-0 stroke-[3]" />
                  <span>Quản lý đón khách &amp; Cấp thẻ</span>
                </li>
                <li className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                  <IconCheck size={14} className="text-[#006838] shrink-0 stroke-[3]" />
                  <span>Khóa bảo trì &amp; Dữ liệu D1</span>
                </li>
              </ul>
            </div>

            {/* Bottom Right Arrow Button */}
            <div className="pt-4 flex justify-end">
              <div className="w-9 h-9 rounded-full bg-[#e6f4ed] text-[#006838] group-hover:bg-[#006838] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
                <IconArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Đăng ký công tác */}
          <div
            onClick={() => handleCardClick("business-trip", "/business-trip", "Đăng ký công tác")}
            className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-amber-500/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Card Top: Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                  <IconBriefcase size={24} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                    Đăng ký công tác
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    Đăng ký, theo dõi và quản lý các chuyến công tác.
                  </p>
                </div>
              </div>

              {/* Bullet Checklist */}
              <ul className="space-y-1.5 pt-1 border-t border-slate-100">
                <li className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                  <IconCheck size={14} className="text-amber-600 shrink-0 stroke-[3]" />
                  <span>Tạo đăng ký công tác</span>
                </li>
                <li className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                  <IconCheck size={14} className="text-amber-600 shrink-0 stroke-[3]" />
                  <span>Theo dõi phê duyệt</span>
                </li>
                <li className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                  <IconCheck size={14} className="text-amber-600 shrink-0 stroke-[3]" />
                  <span>Lịch sử công tác</span>
                </li>
              </ul>
            </div>

            {/* Bottom Right Arrow Button */}
            <div className="pt-4 flex justify-end">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
                <IconArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          3. SECTION 2: NHÂN SỰ (8 CARDS IN A 4-COLUMN GRID)
         ════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3.5">
        {/* Section Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center border border-emerald-200/80 shadow-2xs shrink-0">
            <IconUsers size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              NHÂN SỰ
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Quản lý thông tin và phát triển nguồn nhân lực
            </p>
          </div>
        </div>

        {/* 8 Cards Grid (4 cols on desktop, 2 cols on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "directory",
              title: "Hồ sơ nhân sự",
              desc: "Quản lý thông tin hồ sơ và quá trình công tác của nhân viên.",
              icon: IconAddressBook,
            },
            {
              id: "attendance_payroll",
              title: "Quản lý nghỉ phép",
              desc: "Đăng ký, theo dõi và phê duyệt các đơn nghỉ phép.",
              icon: IconCalendarOff,
            },
            {
              id: "attendance_payroll",
              title: "Chấm công",
              desc: "Theo dõi, quản lý và tổng hợp dữ liệu chấm công.",
              icon: IconClock,
            },
            {
              id: "talent_performance",
              title: "Đánh giá nhân viên",
              desc: "Đánh giá hiệu suất làm việc và năng lực nhân viên.",
              icon: IconTrendingUp,
            },
            {
              id: "talent_performance",
              title: "Đào tạo & phát triển",
              desc: "Quản lý kế hoạch đào tạo và phát triển kỹ năng nhân viên.",
              icon: IconSchool,
            },
            {
              id: "attendance_payroll",
              title: "Lương & phúc lợi",
              desc: "Quản lý thông tin lương, thưởng và phúc lợi nhân viên.",
              icon: IconWallet,
            },
            {
              id: "recruitment",
              title: "Tuyển dụng",
              desc: "Quản lý quy trình tuyển dụng và theo dõi ứng viên.",
              icon: IconUserPlus,
            },
            {
              id: "reports",
              title: "Báo cáo nhân sự",
              desc: "Hệ thống báo cáo tổng hợp về nhân sự và thống kê.",
              icon: IconFileSpreadsheet,
            },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                onClick={() => handleCardClick(item.id, undefined, item.title)}
                className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#006838]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full min-h-[160px]"
              >
                <div className="space-y-3">
                  {/* Card Icon Header */}
                  <div className="w-10 h-10 rounded-xl bg-[#e6f4ed] text-[#006838] flex items-center justify-center border border-emerald-100/90 shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                    <IconComp size={20} />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#006838] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Right Arrow Button */}
                <div className="pt-3 flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-[#e6f4ed] text-[#006838] group-hover:bg-[#006838] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
                    <IconArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          4. FOOTER STATUS BAR (SYSTEM ONLINE & DASHBOARD VERSION)
         ════════════════════════════════════════════════════════════════ */}
      <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span className="text-[11px] text-slate-500 font-medium">
          Tổ hợp Kiên Giang - TBS Group Dashboard v2.4
        </span>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-600">System Online 24/7</span>
        </div>
      </div>

      {/* Modal Popup Preview when clicked */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center font-bold">
                <IconSparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{activeModal.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Truy cập phân hệ nghiệp vụ</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {activeModal.desc}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-[#006838] text-white text-xs font-bold hover:bg-[#00522c] transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
