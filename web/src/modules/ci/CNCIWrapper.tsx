"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconCpu,
  IconFileText,
  IconDeviceMobile,
  IconBuildingStore,
  IconTrendingUp,
  IconBulb,
  IconSchool,
  IconChartBar,
  IconMapPin,
  IconTools,
  IconClipboardList,
  IconDeviceLaptop,
  IconChartPie,
  IconStar,
  IconChevronRight,
  IconSparkles,
  IconArrowLeft,
  IconClock,
  IconSettings,
} from "@tabler/icons-react";
import CIModule from "./CIModule";
import { CNCI_BANNER_DATA, CNCI_CARDS_DATA, CNCICard, CNCIItem } from "@/lib/cnciData";

const renderIcon = (name: string, size = 20) => {
  switch (name) {
    case "IconCpu":
      return <IconCpu size={size} />;
    case "IconFileText":
      return <IconFileText size={size} />;
    case "IconDeviceMobile":
      return <IconDeviceMobile size={size} />;
    case "IconBuildingStore":
      return <IconBuildingStore size={size} />;
    case "IconTrendingUp":
      return <IconTrendingUp size={size} />;
    case "IconBulb":
      return <IconBulb size={size} />;
    case "IconSchool":
      return <IconSchool size={size} />;
    case "IconChartBar":
      return <IconChartBar size={size} />;
    case "IconMapPin":
      return <IconMapPin size={size} />;
    case "IconTools":
    case "IconWrench":
      return <IconTools size={size} />;
    case "IconClipboardList":
      return <IconClipboardList size={size} />;
    case "IconDeviceLaptop":
      return <IconDeviceLaptop size={size} />;
    case "IconChartPie":
      return <IconChartPie size={size} />;
    case "IconStar":
      return <IconStar size={size} />;
    default:
      return <IconFileText size={size} />;
  }
};

export default function CNCIWrapper() {
  const router = useRouter();
  const [subView, setSubView] = useState<"kaizen" | "ci" | "gemba" | null>(null);

  // Sync subView with URL search params if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const sub = urlParams.get("sub");
      if (sub === "kaizen" || sub === "ci" || sub === "gemba") {
        setSubView(sub);
      }
    }
  }, []);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* ════════════════════════════════════════════════════════════════
          BREADCRUMB / TOP NAVIGATION BAR (FOR SUB-VIEWS)
         ════════════════════════════════════════════════════════════════ */}
      {subView && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <Link
            href="/work/cn-ci"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <IconArrowLeft size={16} />
            <span>Quay lại Phân Hệ CN-CI</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>CN-CI (Cải Tiến Liên Tục)</span>
            <span>/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006838] font-black uppercase text-[10px] border border-emerald-200">
              {subView === "kaizen" ? "💡 Kaizen (Thư viện Cải tiến)" : subView === "ci" ? "📈 CI (Điểm nghẽn)" : "📍 Gemba Walk"}
            </span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          1. MAIN DASHBOARD CONTENT VIEW (BANNER + 3 FEATURE CARDS GRID)
         ════════════════════════════════════════════════════════════════ */}
      {!subView && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* TOP BANNER — Dark Emerald Gradient matching reference screenshot */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#042017] via-[#004d29] to-[#041a13] text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-emerald-800/40">
            {/* Background Decorative Pattern & Growth Graphic */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none flex items-center justify-end pr-6">
              <div className="relative w-full h-full flex items-center justify-end">
                <IconTrendingUp size={180} className="text-emerald-300 stroke-[1.2]" />
                <IconSettings size={90} className="absolute right-12 bottom-4 text-emerald-400 animate-spin-slow" />
              </div>
            </div>

            <div className="space-y-2 z-10 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-2xs backdrop-blur-xs">
                  <IconSparkles size={18} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                  {CNCI_BANNER_DATA.welcomeText}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                {CNCI_BANNER_DATA.title}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
                {CNCI_BANNER_DATA.description}
              </p>
            </div>
          </div>

          {/* 3 FEATURE CARDS GRID (Exact 3-Column Layout Matching Reference Screenshot) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start">
            {CNCI_CARDS_DATA.map((card: CNCICard) => {
              // Separate full width vs half width items
              const fullWidthItems = card.items.filter((item) => !item.isHalfWidth);
              const halfWidthItems = card.items.filter((item) => item.isHalfWidth);

              return (
                <div
                  key={card.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs ${card.cardBorderHoverClass} transition-all duration-300 flex flex-col justify-between space-y-5`}
                >
                  {/* Card Header: Icon + Title + Description */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl ${card.iconBgClass} ${card.iconColorClass} flex items-center justify-center flex-shrink-0 shadow-md shadow-slate-900/10`}
                    >
                      {renderIcon(card.iconName, 26)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug truncate">
                        {card.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 leading-snug line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Sub-Items List */}
                  <div className="space-y-2.5 pt-1">
                    {fullWidthItems.map((item: CNCIItem) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="p-3.5 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-[#006838]/60 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-[#006838] flex items-center justify-center flex-shrink-0 transition-colors border border-slate-200/60">
                            {renderIcon(item.iconName, 17)}
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#006838] transition-colors truncate">
                            {item.name}
                          </span>
                        </div>
                        <IconChevronRight
                          size={15}
                          className="text-slate-400 group-hover:text-[#006838] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                        />
                      </Link>
                    ))}

                    {/* Half-width items rendered side-by-side in a 2-column sub-grid */}
                    {halfWidthItems.length > 0 && (
                      <div className="grid grid-cols-2 gap-2.5">
                        {halfWidthItems.map((item: CNCIItem) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="p-3 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-[#006838]/60 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-2 group cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-[#006838] flex items-center justify-center flex-shrink-0 transition-colors border border-slate-200/60">
                                {renderIcon(item.iconName, 15)}
                              </div>
                              <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#006838] transition-colors truncate">
                                {item.name}
                              </span>
                            </div>
                            <IconChevronRight
                              size={14}
                              className="text-slate-400 group-hover:text-[#006838] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          2. KAIZEN SUB-VIEW
         ════════════════════════════════════════════════════════════════ */}
      {subView === "kaizen" && (
        <div className="animate-in fade-in duration-200">
          <CIModule />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          3. CI SUB-VIEW
         ════════════════════════════════════════════════════════════════ */}
      {subView === "ci" && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-4 max-w-xl mx-auto my-8 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2f54eb] flex items-center justify-center mx-auto border border-blue-200 shadow-2xs">
            <IconTrendingUp size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Phân Hệ CI — Quản Lý &amp; Theo Dõi Điểm Nghẽn
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
              Chức năng ghi nhận điểm nghẽn sản xuất, 5 loại lãng phí Muda (Chờ đợi, Thao tác thừa, Tồn kho, Vận chuyển, Hàng lỗi) đang được chuẩn hóa giao diện và đấu nối API.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider">
            <IconClock size={16} />
            <span>Tính năng đang phát triển — Coming Soon</span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          4. GEMBA SUB-VIEW
         ════════════════════════════════════════════════════════════════ */}
      {subView === "gemba" && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-4 max-w-xl mx-auto my-8 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#fa8c16] flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
            <IconMapPin size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Phân Hệ GEMBA — Đi Hiện Trường &amp; Phát Hiện Vấn Đề
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
              Chức năng Gemba Walk (ghi nhận hiện trường chuyền dán, người phụ trách, ảnh chụp trực tiếp và theo dõi khắc phục sự cố) đang chuẩn bị tích hợp ở giai đoạn tiếp theo.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            <IconClock size={16} />
            <span>Tính năng đang phát triển — Coming Soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
