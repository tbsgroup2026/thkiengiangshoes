"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconCalculator,
  IconFlask,
  IconShieldCheck,
  IconTruck,
  IconChartBar,
  IconFileText,
  IconCalendarEvent,
  IconHeadset,
  IconChevronRight,
  IconSpeakerphone,
  IconInfoCircle,
  IconCalendar,
  IconPackage,
  IconBell,
  IconActivity,
  IconArrowUpRight,
  IconBolt,
  IconCircleCheck,
  IconSparkles,
  IconLayersSubtract,
} from "@tabler/icons-react";

interface OverviewDashboardProps {
  onSelectDept?: (deptId: string) => void;
  userName?: string;
  canViewFinance?: boolean;
}

interface ChartPoint {
  day: string;
  val: number;
  x: number;
  y: number;
  highlight?: boolean;
}

export default function OverviewDashboard({
  onSelectDept,
  userName = "Phạm Nguyễn Anh Huy",
  canViewFinance = true,
}: OverviewDashboardProps) {
  const [chartTab, setChartTab] = useState<"thisMonth" | "lastMonth">("thisMonth");
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // Mock Activity Chart Points for This Month
  const chartPointsThisMonth: ChartPoint[] = [
    { day: "01", val: 20, x: 25, y: 120 },
    { day: "05", val: 38, x: 85, y: 95 },
    { day: "08", val: 42, x: 135, y: 88 },
    { day: "10", val: 32, x: 180, y: 105 },
    { day: "12", val: 50, x: 230, y: 78 },
    { day: "13", val: 78, x: 260, y: 35, highlight: true }, // PEAK POINT
    { day: "15", val: 48, x: 300, y: 80 },
    { day: "18", val: 55, x: 350, y: 70 },
    { day: "20", val: 38, x: 400, y: 95 },
    { day: "23", val: 56, x: 450, y: 68 },
    { day: "26", val: 65, x: 505, y: 55 },
    { day: "28", val: 46, x: 555, y: 82 },
    { day: "30", val: 65, x: 610, y: 55 },
  ];

  const chartPointsLastMonth: ChartPoint[] = [
    { day: "01", val: 15, x: 25, y: 128 },
    { day: "05", val: 30, x: 85, y: 105 },
    { day: "08", val: 35, x: 135, y: 98 },
    { day: "10", val: 45, x: 180, y: 85 },
    { day: "12", val: 40, x: 230, y: 90 },
    { day: "13", val: 55, x: 260, y: 70 },
    { day: "15", val: 62, x: 300, y: 60 },
    { day: "18", val: 48, x: 350, y: 80 },
    { day: "20", val: 52, x: 400, y: 75 },
    { day: "23", val: 45, x: 450, y: 85 },
    { day: "26", val: 58, x: 505, y: 65 },
    { day: "28", val: 50, x: 555, y: 78 },
    { day: "30", val: 58, x: 610, y: 65 },
  ];

  const currentPoints = chartTab === "thisMonth" ? chartPointsThisMonth : chartPointsLastMonth;

  // Generate SVG Path
  const pathD = currentPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  return (
    <div className="space-y-5 w-full min-w-0 animate-in fade-in duration-300">
      {/* ════════════════════════════════════════════════════════════════
          1. HERO BANNER CARD - AWWWARDS & HUMAN TASTE QUALITY
         ════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-lg bg-slate-900 text-white p-6 sm:p-8 border border-emerald-600/30 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[180px] group">
        {/* Real Factory/Lobby Background Image - Clear & Crisp */}
        <img
          src="/images/brands/SẢNH/1787810869473_5373416762128407822_5373416762128407822_cc4e9457f6b6ec27ca152415bdff7a52.jpg"
          alt="Trung Tâm Điều Hành Tổ Hợp Kiên Giang - TBS Group"
          className="absolute inset-0 w-full h-full object-cover opacity-75 sm:opacity-80 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        />
        {/* Lighter Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-[#004d29]/45 to-slate-950/50 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_center,rgba(141,198,63,0.18),transparent_65%)] pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left: Greeting & Human Mission Directives */}
        <div className="relative z-10 space-y-4 max-w-xl text-left">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Trung Tâm Điều Hành Tổ Hợp Kiên Giang - TBS Group
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-white">
              Xin chào, {userName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
              Chúc bạn một ngày làm việc sáng tạo, minh bạch và hiệu quả cao tại TBS Group.
            </p>
          </div>

          {/* 3 Mission Pillars */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-bold text-white backdrop-blur-md transition-colors shadow-2xs">
              Hiệu quả hơn
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-bold text-white backdrop-blur-md transition-colors shadow-2xs">
              Minh bạch hơn
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-bold text-white backdrop-blur-md transition-colors shadow-2xs">
              Số hóa toàn diện
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          2. ROW 1: 6 THẺ PHÒNG BAN + KHỐI TRUY CẬP NHANH
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (Col 8/12): 6 Thẻ Phòng Ban Chính */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              id: "hr",
              name: "Nhân sự\n& Hành chính",
              icon: IconUsers,
              iconBg: "bg-emerald-50 text-[#006838] border-emerald-200",
            },
            ...(canViewFinance
              ? [
                  {
                    id: "finance",
                    name: "Kế toán\n& Tài chính",
                    icon: IconCalculator,
                    iconBg: "bg-emerald-50/80 text-[#005a30] border-emerald-200",
                  },
                ]
              : []),
            {
              id: "rd",
              name: "R&D\n(Phát triển SP)",
              icon: IconFlask,
              iconBg: "bg-[#e6f4ed] text-[#006838] border-emerald-200",
            },
            {
              id: "qc",
              name: "Quản lý\nchất lượng",
              icon: IconShieldCheck,
              iconBg: "bg-emerald-50 text-[#006838] border-emerald-200",
            },
            {
              id: "logistics",
              name: "Kho &\nLogistics",
              icon: IconTruck,
              iconBg: "bg-emerald-50/90 text-[#005a30] border-emerald-200",
            },
            {
              id: "report",
              name: "Báo cáo\nthống kê",
              icon: IconChartBar,
              iconBg: "bg-emerald-100/60 text-[#006838] border-emerald-200",
              href: canViewFinance ? "/finance/bao-cao" : "#",
            },
          ].map((item) => {
            const IconC = item.icon;
            const content = (
              <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#006838] hover:shadow-md transition-all duration-300 group cursor-pointer h-full justify-center space-y-2.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border ${item.iconBg}`}>
                  <IconC size={22} />
                </div>
                <span className="text-[11px] font-extrabold text-slate-800 leading-tight whitespace-pre-line group-hover:text-[#006838] transition-colors">
                  {item.name}
                </span>
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className="block h-full">
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectDept?.(item.id)}
                className="block h-full w-full text-left cursor-pointer"
              >
                {content}
              </button>
            );
          })}
        </div>

        {/* Right (Col 4/12): Khối Truy Cập Nhanh */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#006838] flex items-center justify-center border border-emerald-100">
                <IconBolt size={14} />
              </div>
              <span>Truy cập nhanh</span>
            </div>
            <Link
              href="/finance"
              className="text-[11px] font-extrabold text-[#006838] hover:underline flex items-center gap-1"
            >
              <span>Tất cả</span>
              <IconArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Nhập liệu", icon: IconFileText, href: "/finance?tab=desk", color: "text-[#006838]", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
              { label: "Báo cáo", icon: IconChartBar, href: "/finance/bao-cao", color: "text-[#006838]", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
              { label: "Công việc", icon: IconCalendarEvent, href: "/business-trip", color: "text-[#006838]", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
              { label: "Hỗ trợ", icon: IconHeadset, href: "/rooms", color: "text-[#006838]", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
            ].map((q, idx) => {
              const QIcon = q.icon;
              return (
                <Link
                  key={idx}
                  href={q.href}
                  className="flex flex-col items-center text-center p-2 rounded-xl border border-slate-200/80 hover:border-[#006838] hover:shadow-2xs transition-all duration-200 group bg-slate-50/50"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 border ${q.bg} ${q.color}`}>
                    <QIcon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1.5 truncate w-full group-hover:text-[#006838] transition-colors">
                    {q.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          3. ROW 2: 4 THẺ KPI CHỈ SỐ HOẠT ĐỘNG TOÀN HỆ THỐNG
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nhân sự toàn hệ thống */}
        <div
          onClick={() => onSelectDept?.("hr")}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#006838] hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <IconUsers size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-black text-slate-800">
              <span className="truncate">Nhân sự toàn hệ thống</span>
              <IconChevronRight size={14} className="text-slate-400 group-hover:text-[#006838] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-sans">586</span>
              <span className="text-[11px] font-bold text-slate-500">Đang làm việc</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#006838] mt-0.5">
              <span>+12% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Đơn hàng / Logistics */}
        <div
          onClick={() => onSelectDept?.("logistics")}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#006838] hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <IconTruck size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-black text-slate-800">
              <span className="truncate">Dây chuyền Logistics</span>
              <IconChevronRight size={14} className="text-slate-400 group-hover:text-[#006838] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-sans">33</span>
              <span className="text-[11px] font-bold text-slate-500">chuyền</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#006838] mt-0.5">
              <span>+8% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Tỷ lệ chất lượng (QC) */}
        <div
          onClick={() => onSelectDept?.("qc")}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#006838] hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <IconPackage size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-black text-slate-800">
              <span className="truncate">Chất lượng tổng thể (QC)</span>
              <IconChevronRight size={14} className="text-slate-400 group-hover:text-[#006838] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-sans">92.4%</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#006838] mt-0.5">
              <span>+5% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Dự án R&D */}
        <div
          onClick={() => onSelectDept?.("rd")}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#006838] hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <IconFlask size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-black text-slate-800">
              <span className="truncate">Dự án R&amp;D Mẫu mới</span>
              <IconChevronRight size={14} className="text-slate-400 group-hover:text-[#006838] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-sans">12</span>
              <span className="text-[11px] font-bold text-slate-500">dự án</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#006838] mt-0.5">
              <span>+20% so với tháng trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          4. ROW 3: BIỂU ĐỒ HOẠT ĐỘNG + CÔNG VIỆC CẦN XỬ LÝ + THÔNG BÁO
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 5/12: Biểu đồ biến động hoạt động theo tháng */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          {/* Header & Month Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center">
                <IconActivity size={16} />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Biến động hoạt động theo tháng
              </h3>
            </div>

            {/* Toggle Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setChartTab("thisMonth")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartTab === "thisMonth"
                    ? "bg-white text-[#006838] font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tháng này
              </button>
              <button
                type="button"
                onClick={() => setChartTab("lastMonth")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartTab === "lastMonth"
                    ? "bg-white text-[#006838] font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tháng trước
              </button>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full h-48 sm:h-52 pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 640 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="overviewAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006838" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#006838" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[
                { val: 100, y: 20 },
                { val: 80, y: 45 },
                { val: 60, y: 70 },
                { val: 40, y: 95 },
                { val: 20, y: 120 },
                { val: 0, y: 145 },
              ].map((g, idx) => (
                <g key={idx}>
                  <text x="12" y={g.y + 3.5} textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="700" className="font-mono select-none">
                    {g.val}
                  </text>
                  <line x1="20" y1={g.y} x2="630" y2={g.y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray={g.val === 0 ? "none" : "3 3"} />
                </g>
              ))}

              {/* Area Polygon */}
              <polygon points={currentPoints.map((p) => `${p.x},${p.y}`).join(" ") + ` 610,145 25,145`} fill="url(#overviewAreaGradient)" />

              {/* Line Curve */}
              <path d={pathD} fill="none" stroke="#006838" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points */}
              {currentPoints.map((pt, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.highlight ? "6" : "4"}
                    fill="#ffffff"
                    stroke="#006838"
                    strokeWidth={pt.highlight ? "3" : "2"}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="transition-all duration-150 group-hover:r-7 group-hover:fill-[#006838]"
                  />
                  {/* X Axis Labels */}
                  {["01", "05", "10", "15", "20", "25", "30"].includes(pt.day) && (
                    <text x={pt.x} y="156" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="700" className="font-mono select-none">
                      {pt.day}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* Dynamic Hover Tooltip */}
            {hoveredPoint ? (
              <div
                style={{
                  left: `${(hoveredPoint.x / 640) * 100}%`,
                  top: `${(hoveredPoint.y / 160) * 100}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-full mb-3 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700 pointer-events-none text-center z-30 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ngày {hoveredPoint.day}</div>
                <div className="text-xs font-black text-emerald-400 font-mono mt-0.5">{hoveredPoint.val} Hoạt động</div>
              </div>
            ) : chartTab === "thisMonth" ? (
              /* Default Peak Point Tooltip (78 Hoạt Động) */
              <div className="absolute left-[38%] top-[14%] -translate-x-1/2 -translate-y-full bg-white border-2 border-[#006838] px-2.5 py-1 rounded-xl shadow-md text-center pointer-events-none animate-bounce">
                <div className="text-xs font-black text-slate-900 leading-none">78</div>
                <div className="text-[9px] font-extrabold text-[#006838] leading-none mt-0.5">Hoạt động</div>
                <div className="w-2 h-2 bg-white border-r-2 border-b-2 border-[#006838] rotate-45 mx-auto -mb-2 mt-0.5" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Col 4/12: Công Việc Cần Xử Lý */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center">
                <IconCircleCheck size={16} />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Công việc cần xử lý
              </h3>
            </div>
            <span className="h-5 px-2 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              3 việc
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                title: "Nhập số liệu kế toán tháng 8/2025",
                dept: "Phòng Kế toán",
                deadline: "28/08",
                icon: IconFileText,
                iconBg: "bg-emerald-50 text-[#006838] border-emerald-100",
                href: "/finance",
              },
              {
                title: "Báo cáo tiến độ dự án R&D",
                dept: "Phòng R&D",
                deadline: "30/08",
                icon: IconFlask,
                iconBg: "bg-purple-50 text-purple-700 border-purple-100",
                href: "/work",
              },
              {
                title: "Kiểm tra chất lượng lô hàng",
                dept: "Phòng QC",
                deadline: "29/08",
                icon: IconShieldCheck,
                iconBg: "bg-teal-50 text-teal-700 border-teal-100",
                href: "/work",
              },
            ].map((task, idx) => {
              const TIcon = task.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#006838] hover:shadow-2xs transition-all duration-200 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${task.iconBg}`}>
                      <TIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-[#006838] transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{task.dept}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black whitespace-nowrap">
                    Hạn: {task.deadline}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3/12: Thông Báo */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center">
                <IconBell size={16} />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Thông báo
              </h3>
            </div>
            <Link href="/news" className="text-[11px] font-extrabold text-[#006838] hover:underline flex items-center gap-1">
              <span>Xem tất cả</span>
              <IconArrowUpRight size={13} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              {
                title: "Khai trương mô hình số hóa Tổ hợp Kiên Giang - TBS Group",
                date: "26/08/2025",
                icon: IconSpeakerphone,
                iconBg: "bg-emerald-50 text-[#006838] border-emerald-100",
              },
              {
                title: "Cập nhật quy trình nhập liệu tài chính kế toán",
                date: "24/08/2025",
                icon: IconInfoCircle,
                iconBg: "bg-blue-50 text-blue-700 border-blue-100",
              },
              {
                title: "Lịch đào tạo nội bộ tháng 9",
                date: "22/08/2025",
                icon: IconCalendar,
                iconBg: "bg-purple-50 text-purple-700 border-purple-100",
              },
            ].map((news, idx) => {
              const NIcon = news.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#006838] hover:shadow-2xs transition-all duration-200 flex items-start gap-2.5 group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${news.iconBg}`}>
                    <NIcon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#006838] transition-colors">
                      {news.title}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 mt-1 block">{news.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          5. FOOTER THƯƠNG HIỆU & SỨ MỆNH
         ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] font-bold text-[#006838]">
        <div className="flex items-center gap-2">
          <IconSparkles size={16} />
          <span>Sống tinh gọn – Làm việc hiệu quả – Cùng phát triển bền vững</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <span>© 2026 TBS Group – Tổ hợp Kiên Giang – R&amp;D Center</span>
        </div>
      </div>
    </div>
  );
}
