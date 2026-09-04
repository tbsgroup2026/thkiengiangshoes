"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
import {
  IconFileText,
  IconFlask,
  IconClock,
  IconAward,
  IconWallet,
  IconUsers,
  IconCalculator,
  IconShieldCheck,
  IconTruck,
  IconBuilding,
  IconBuildingFactory,
  IconClipboardList,
  IconBell,
  IconGridDots,
  IconChartBar,
  IconCalendarEvent,
  IconFolder,
  IconSettings,
  IconHelp,
  IconArrowUpRight,
  IconChevronRight,
  IconCircleCheck,
  IconSpeakerphone,
  IconInfoCircle,
  IconCalendar,
  IconActivity,
  IconChevronDown,
  IconSparkles,
  IconSun,
  IconRotate,
  IconArrowDown,
  IconArrowUp,
  IconLeaf,
} from "@tabler/icons-react";
import { RDSampleItem } from "./types";

interface RDModuleProps {
  userName?: string;
  onSelectDept?: (deptId: string) => void;
}

export default function RDModule({
  userName = "Huy Anh",
  onSelectDept,
}: RDModuleProps) {
  const [trendRange, setTrendRange] = useState("6 tháng gần đây");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Mock Samples List (Exact screenshot data)
  const samplesList: RDSampleItem[] = [
    {
      code: "MS-2505-06",
      name: "Go Walk Flex - Gen 2",
      status: "approved",
      statusLabel: "Đã duyệt",
      department: "R&D Footwear",
      createdAt: "15/05/2025",
      dueDate: "25/05/2025",
      progress: 60,
    },
    {
      code: "MS-2505-05",
      name: "Max Cushion Elite",
      status: "testing",
      statusLabel: "Đang thử nghiệm",
      department: "R&D Footwear",
      createdAt: "14/05/2025",
      dueDate: "28/05/2025",
      progress: 40,
    },
    {
      code: "MS-2505-04",
      name: "Slip-ins - Summer White",
      status: "pending",
      statusLabel: "Chờ duyệt",
      department: "R&D Footwear",
      createdAt: "10/05/2025",
      dueDate: "15/05/2025",
      progress: 100,
    },
    {
      code: "MS-2505-03",
      name: "Kids Light Runner",
      status: "testing",
      statusLabel: "Đang thử nghiệm",
      department: "R&D Kids",
      createdAt: "09/05/2025",
      dueDate: "20/05/2025",
      progress: 70,
    },
    {
      code: "MS-2505-02",
      name: "Work Safety Pro",
      status: "designing",
      statusLabel: "Đang thiết kế",
      department: "R&D Performance",
      createdAt: "07/05/2025",
      dueDate: "22/05/2025",
      progress: 30,
    },
  ];

  // Trend Data for 6 Months (12/2024 to 05/2025)
  const trendMonths = [
    { label: "12/2024", approved: 50, testing: 18, designing: 12, x: 45 },
    { label: "01/2025", approved: 92, testing: 35, designing: 20, x: 120 },
    { label: "02/2025", approved: 120, testing: 36, designing: 22, x: 195 },
    { label: "03/2025", approved: 118, testing: 26, designing: 18, x: 270 },
    { label: "04/2025", approved: 138, testing: 27, designing: 19, x: 345 },
    { label: "05/2025", approved: 142, testing: 28, designing: 16, x: 420 },
  ];

  // Helper to map Y value (0..150) to SVG coords (140..20)
  const getY = (val: number) => 140 - (val / 150) * 115;

  const approvedPath = trendMonths.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${getY(pt.approved)}` : `${acc} L ${pt.x} ${getY(pt.approved)}`),
    ""
  );

  const testingPath = trendMonths.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${getY(pt.testing)}` : `${acc} L ${pt.x} ${getY(pt.testing)}`),
    ""
  );

  const designingPath = trendMonths.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${getY(pt.designing)}` : `${acc} L ${pt.x} ${getY(pt.designing)}`),
    ""
  );

  return (
    <div className="space-y-4 sm:space-y-4.5 w-full min-w-0 animate-in fade-in duration-300">
      {/* ════════════════════════════════════════════════════════════════
          ROW 1: TOP ROW (HERO CARD LEFT + 5 KPI CARDS RIGHT)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left: Mini Hero Card (Col 4/12) */}
        <div className="lg:col-span-4 rounded-3xl overflow-hidden shadow-sm bg-slate-900 text-white p-5 border border-emerald-600/30 flex flex-col justify-between relative group min-h-[160px]">
          {/* R&D Real Background Photo - Subject Centered */}
          <img
            src="/images/brands/Phòng Đào Tạo/1787810869499_5373416762128407822_5373416762128407822_49d7659c53b21702dff5c8f39212d143.jpg"
            alt="R&D (Phát triển sản phẩm)"
            className="absolute inset-0 w-full h-full object-cover object-[center_55%] opacity-85 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          />
          {/* Lighter Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-[#005a30]/40 to-slate-950/40 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_center,rgba(141,198,63,0.15),transparent_65%)] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>R&D (Phát triển sản phẩm)</span>
            </h2>
            <p className="text-xs text-emerald-100/90 font-medium leading-relaxed">
              Nghiên cứu, thiết kế mẫu & kỹ thuật cùng Tổ hợp Kiên Giang - TBS Group.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 flex-wrap pt-3">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white backdrop-blur-md">
              Hiệu quả hơn
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white backdrop-blur-md">
              Minh bạch hơn
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white backdrop-blur-md">
              Số hóa toàn diện
            </span>
          </div>
        </div>

        {/* Right: 5 Horizontal KPI Cards (Col 8/12) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* KPI 1: Mẫu Đã Duyệt */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2 hover:border-[#006838]/60 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">Mẫu Đã Duyệt</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <IconFileText size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">142</span>
                <span className="text-[11px] font-medium text-slate-500">Mẫu</span>
              </div>
              <div className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-0.5 mt-0.5">
                <span>▲ 18% so với tháng trước</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Mẫu Đang Thử Nghiệm */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2 hover:border-blue-500/60 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">Mẫu Đang TN</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100">
                <IconFlask size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">28</span>
                <span className="text-[11px] font-medium text-slate-500">Mẫu</span>
              </div>
              <div className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-0.5 mt-0.5">
                <span>▲ 5% so với tháng trước</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Lead Time Trung Bình */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2 hover:border-amber-500/60 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">Lead Time TB</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0 border border-amber-100">
                <IconClock size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">4.2</span>
                <span className="text-[11px] font-medium text-slate-500">Ngày</span>
              </div>
              <div className="text-[10px] font-extrabold text-rose-600 flex items-center gap-0.5 mt-0.5">
                <span>▼ 15% so với tháng trước</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Duyệt Mẫu Lần 1 */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2 hover:border-teal-500/60 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">Duyệt Mẫu Lần 1</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 border border-teal-100">
                <IconAward size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">94.8%</div>
              <div className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-0.5 mt-0.5">
                <span>▲ 2.1% so với tháng trước</span>
              </div>
            </div>
          </div>

          {/* KPI 5: Chi Phí R&D Tháng */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2 hover:border-purple-500/60 transition-all col-span-2 sm:col-span-1">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">Chi Phí R&amp;D</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-100">
                <IconWallet size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">1.24</span>
                <span className="text-[11px] font-medium text-slate-500">Tỷ VND</span>
              </div>
              <div className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-0.5 mt-0.5">
                <span>▲ 8% so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 2: 3 COLUMNS (LÀM VIỆC NHANH + XU HƯỚNG TIẾN ĐỘ + TỶ LỆ TRẠNG THÁI)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Col 1 (4/12): Làm việc nhanh (Quick Launch Grid 15 items) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="text-emerald-700">⚡</span>
              <span>Làm việc nhanh</span>
            </h3>
          </div>

          {/* 5x3 Grid */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {[
              { id: "hr", name: "Nhân sự", icon: IconUsers, color: "text-[#006838]", bg: "bg-emerald-50" },
              { id: "finance", name: "Kế toán", icon: IconCalculator, color: "text-emerald-700", bg: "bg-emerald-50" },
              { id: "rd", name: "R&D", icon: IconFlask, color: "text-purple-700", bg: "bg-purple-50" },
              { id: "qc", name: "QC", icon: IconShieldCheck, color: "text-teal-700", bg: "bg-teal-50" },
              { id: "logistics", name: "Kho & Logistics", icon: IconTruck, color: "text-amber-700", bg: "bg-amber-50" },
              { id: "admin", name: "Hành chính", icon: IconBuilding, color: "text-blue-700", bg: "bg-blue-50" },
              { id: "factory", name: "Nhà máy", icon: IconBuildingFactory, color: "text-indigo-700", bg: "bg-indigo-50" },
              { id: "tasks", name: "Công việc", icon: IconClipboardList, color: "text-amber-800", bg: "bg-amber-50" },
              { id: "news", name: "Thông báo", icon: IconBell, color: "text-rose-600", bg: "bg-rose-50" },
              { id: "tools", name: "Tiện ích", icon: IconGridDots, color: "text-purple-600", bg: "bg-purple-50" },
              { id: "reports", name: "Báo cáo", icon: IconChartBar, color: "text-emerald-600", bg: "bg-emerald-50" },
              { id: "rooms", name: "Lịch họp", icon: IconCalendarEvent, color: "text-blue-600", bg: "bg-blue-50" },
              { id: "docs", name: "Tài liệu", icon: IconFolder, color: "text-teal-600", bg: "bg-teal-50" },
              { id: "settings", name: "Cài đặt", icon: IconSettings, color: "text-slate-600", bg: "bg-slate-50" },
              { id: "help", name: "Trợ giúp", icon: IconHelp, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectDept?.(item.id)}
                  className="flex flex-col items-center text-center p-1.5 rounded-xl border border-slate-200/70 hover:border-[#006838] hover:shadow-2xs transition-all group bg-white cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${item.bg} ${item.color}`}>
                    <IconComp size={16} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 mt-1 truncate w-full group-hover:text-[#006838] transition-colors leading-tight">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Col 2 (5/12): Xu hướng tiến độ phát triển mẫu (Line Chart) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              Xu hướng tiến độ phát triển mẫu
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <span>{trendRange}</span>
              <IconChevronDown size={12} className="text-slate-400" />
            </div>
          </div>

          {/* Line Chart Legends */}
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Mẫu Đã Duyệt</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Mẫu Đang TN</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Mẫu Đang Thiết Kế</span>
            </span>
          </div>

          {/* SVG Line Chart (3 Lines) */}
          <div className="w-full h-44 sm:h-48 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 460 160" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              {[
                { val: 150, y: 25 },
                { val: 120, y: 48 },
                { val: 90, y: 71 },
                { val: 60, y: 94 },
                { val: 0, y: 140 },
              ].map((g, idx) => (
                <g key={idx}>
                  <text x="18" y={g.y + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="700">
                    {g.val}
                  </text>
                  <line x1="25" y1={g.y} x2="445" y2={g.y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2 2" />
                </g>
              ))}

              {/* 3 Line Paths */}
              <path d={approvedPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={testingPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={designingPath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points */}
              {trendMonths.map((pt, idx) => (
                <g key={idx}>
                  {/* Approved Point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.approved)}
                    r={idx === 5 ? "4" : "3"}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {idx === 5 && (
                    <text x={pt.x + 8} y={getY(pt.approved) + 3} fill="#10b981" fontSize="9" fontWeight="900">
                      142
                    </text>
                  )}

                  {/* Testing Point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.testing)}
                    r={idx === 5 ? "4" : "3"}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {idx === 5 && (
                    <text x={pt.x + 8} y={getY(pt.testing) + 3} fill="#3b82f6" fontSize="9" fontWeight="900">
                      28
                    </text>
                  )}

                  {/* Designing Point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.designing)}
                    r={idx === 5 ? "4" : "3"}
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {idx === 5 && (
                    <text x={pt.x + 8} y={getY(pt.designing) + 3} fill="#f97316" fontSize="9" fontWeight="900">
                      16
                    </text>
                  )}

                  {/* Month Label */}
                  <text x={pt.x} y="153" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="700">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Col 3 (3/12): Tỷ lệ trạng thái mẫu (Donut Chart) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="pb-1 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              Tỷ lệ trạng thái mẫu
            </h3>
          </div>

          {/* Donut SVG Ring */}
          <div className="flex items-center justify-center relative py-1 my-auto">
            <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
              {/* Approved: 76.3% */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray="182.1 238.7"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Testing: 15.1% */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray="36.0 238.7"
                strokeDashoffset="-182.1"
                strokeLinecap="round"
              />
              {/* Designing: 8.6% */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f97316"
                strokeWidth="12"
                strokeDasharray="20.5 238.7"
                strokeDashoffset="-218.1"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 leading-none">186</span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">Tổng mẫu</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 font-bold">Mẫu Đã Duyệt</span>
              </div>
              <span className="font-extrabold text-slate-900">142 (76.3%)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 flex-shrink-0" />
                <span className="text-slate-700 font-bold">Mẫu Đang Thử Nghiệm</span>
              </div>
              <span className="font-extrabold text-slate-900">28 (15.1%)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 flex-shrink-0" />
                <span className="text-slate-700 font-bold">Mẫu Đang Thiết Kế</span>
              </div>
              <span className="font-extrabold text-slate-900">16 (8.6%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 3: DANH SÁCH MẪU GẦN ĐÂY (LEFT) + CÔNG VIỆC & THÔNG BÁO (RIGHT)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left (Col 8/12): Danh Sách Mẫu Gần Đây */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              Danh sách mẫu gần đây
            </h3>
            <button className="text-[11px] font-extrabold text-[#006838] hover:underline cursor-pointer flex items-center gap-0.5">
              <span>Xem tất cả</span>
              <IconChevronRight size={13} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-bold">Mã mẫu</th>
                  <th className="pb-2 font-bold">Tên mẫu</th>
                  <th className="pb-2 font-bold">Trạng thái</th>
                  <th className="pb-2 font-bold">Bộ phận</th>
                  <th className="pb-2 font-bold">Ngày tạo</th>
                  <th className="pb-2 font-bold">Hạn dự kiến</th>
                  <th className="pb-2 font-bold text-right">Tiến độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {samplesList.map((sample, idx) => {
                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006838] font-bold text-[10px] border border-emerald-200">
                      Đã duyệt
                    </span>
                  );
                  if (sample.status === "testing") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                        Đang thử nghiệm
                      </span>
                    );
                  } else if (sample.status === "pending") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                        Chờ duyệt
                      </span>
                    );
                  } else if (sample.status === "designing") {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                        Đang thiết kế
                      </span>
                    );
                  }

                  let barColor = "bg-emerald-500";
                  if (sample.progress <= 40) barColor = "bg-amber-500";
                  else if (sample.progress <= 70) barColor = "bg-blue-500";

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900">{sample.code}</td>
                      <td className="py-2.5 font-bold text-slate-800">{sample.name}</td>
                      <td className="py-2.5">{statusBadge}</td>
                      <td className="py-2.5 text-slate-600">{sample.department}</td>
                      <td className="py-2.5 text-slate-500">{sample.createdAt}</td>
                      <td className="py-2.5 text-slate-500">{sample.dueDate}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${sample.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-700 w-7 text-right">
                            {sample.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (Col 4/12): 2 Khối Nhỏ (Công việc cần xử lý & Thông báo) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Box 1: Công việc cần xử lý */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <IconCircleCheck size={16} className="text-[#006838]" />
                <span>Công việc cần xử lý</span>
              </h3>
              <button className="text-[10px] font-extrabold text-[#006838] hover:underline cursor-pointer">
                Xem tất cả →
              </button>
            </div>

            <div className="space-y-2">
              {[
                { title: "Nhắc xử lý Báo lỗi toàn tháng 6/2025", dept: "Phòng QC", deadline: "25/05", icon: IconFileText, color: "text-emerald-700", bg: "bg-emerald-50" },
                { title: "Báo cáo tiến độ dự án R&D", dept: "Phòng R&D", deadline: "26/05", icon: IconFlask, color: "text-purple-700", bg: "bg-purple-50" },
                { title: "Kiểm tra chất lượng lô hàng", dept: "Phòng QC", deadline: "28/05", icon: IconShieldCheck, color: "text-teal-700", bg: "bg-teal-50" },
              ].map((task, idx) => {
                const TIcon = task.icon;
                return (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-white hover:border-[#006838] transition-all flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${task.bg} ${task.color}`}>
                        <TIcon size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-slate-800 truncate">{task.title}</h4>
                        <span className="text-[9px] text-slate-400 font-medium block">{task.dept}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-black whitespace-nowrap">
                      Hạn: {task.deadline}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Box 2: Thông báo */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <IconBell size={16} className="text-[#006838]" />
                <span>Thông báo</span>
              </h3>
              <button className="text-[10px] font-extrabold text-[#006838] hover:underline cursor-pointer">
                Xem tất cả →
              </button>
            </div>

            <div className="space-y-2">
              {[
                { title: "Khai trương mô hình số hóa Tổ hợp Kiên Giang - TBS Group", date: "20/05/2025", icon: IconSpeakerphone, color: "text-[#006838]", bg: "bg-emerald-50" },
                { title: "Cập nhật quy trình nhập liệu tài chính kế toán", date: "20/05/2025", icon: IconInfoCircle, color: "text-blue-700", bg: "bg-blue-50" },
                { title: "Lịch đào tạo nội bộ tháng 6", date: "20/05/2025", icon: IconCalendar, color: "text-purple-700", bg: "bg-purple-50" },
              ].map((news, idx) => {
                const NIcon = news.icon;
                return (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-white hover:border-[#006838] transition-all flex items-start gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${news.bg} ${news.color}`}>
                      <NIcon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{news.title}</h4>
                      <span className="text-[9px] text-slate-400 font-medium">{news.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 4: HIỆU SUẤT VẬN HÀNH (5 CHỈ SỐ + BANNER CTA SỐ HÓA)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left (Col 9/12): 5 Thẻ Hiệu Suất Vận Hành */}
        <div className="lg:col-span-9 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <h4 className="text-xs font-black text-slate-900 tracking-tight">
            Hiệu suất vận hành
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Metric 1 */}
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <IconSettings size={14} className="text-emerald-700" />
                <span className="text-[10px] font-bold truncate">OEE Toàn hệ thống</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">87.6%</span>
                <span className="text-[9px] font-bold text-emerald-700">▲ 4.3%</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <IconActivity size={14} className="text-emerald-700" />
                <span className="text-[10px] font-bold truncate">Năng suất</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">12,540 đôi</span>
                <span className="text-[9px] font-bold text-emerald-700">▲ 6.7%</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <IconClock size={14} className="text-teal-700" />
                <span className="text-[10px] font-bold truncate">Tỷ lệ lỗi (QC)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">1.32%</span>
                <span className="text-[9px] font-bold text-rose-600">▼ 0.35%</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <IconTruck size={14} className="text-blue-700" />
                <span className="text-[10px] font-bold truncate">Giao hàng đúng hạn</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">96.8%</span>
                <span className="text-[9px] font-bold text-emerald-700">▲ 2.4%</span>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <IconUsers size={14} className="text-amber-800" />
                <span className="text-[10px] font-bold truncate">Tồn kho (Ngày)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">27 ngày</span>
                <span className="text-[9px] font-bold text-emerald-700">▼ 1 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (Col 3/12): Banner CTA "Số hóa hôm nay" */}
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-[#e8f5ec] via-emerald-50 to-teal-50 border border-emerald-200/80 p-4 shadow-2xs flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900">
              Số hóa hôm nay
            </h4>
            <div className="text-xs font-extrabold text-[#006838]">
              Dẫn đầu ngày mai
            </div>
          </div>

          <button
            onClick={() => onSelectDept?.("reports")}
            className="w-full py-2 px-3 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-[11px] font-bold transition-all cursor-pointer shadow-sm text-center"
          >
            Xem báo cáo chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
