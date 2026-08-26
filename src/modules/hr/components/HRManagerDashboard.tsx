"use client";

import React, { useState } from "react";
import {
  IconUsers,
  IconUserCheck,
  IconUserPlus,
  IconUserMinus,
  IconBriefcase,
  IconAlertTriangle,
  IconClock,
  IconTrendingUp,
  IconBuilding,
  IconFileText,
  IconRefresh,
  IconCheck,
  IconArrowRight,
  IconPlus,
  IconDownload,
  IconChartBar,
  IconChartPie,
  IconChevronRight,
  IconLayersSubtract,
} from "@tabler/icons-react";

interface HRManagerDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenDocModal?: (docId: string) => void;
}

export default function HRManagerDashboard({
  onNavigateTab,
  onOpenDocModal,
}: HRManagerDashboardProps) {
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("month");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════
          1. HEADER & EXECUTIVE FILTERS
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Xin chào, Nguyễn Thị Lan Anh 👋
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Tổng quan tình hình nguồn nhân lực và danh sách phê duyệt hôm nay (TBS Group &amp; Skechers HQ)
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Toàn Tập Đoàn TBS</option>
            <option value="skechers">Chuỗi SKECHERS HQ</option>
            <option value="factory">Tổ Hợp Nhà Máy NM1</option>
          </select>

          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="month">Tháng 08/2026</option>
            <option value="quarter">Quý 3 / 2026</option>
            <option value="year">Năm 2026</option>
          </select>

          <button
            onClick={() => onNavigateTab("reports")}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <IconDownload size={14} />
            <span>Xuất Báo Cáo HR</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          2. 8 EXECUTIVE KPI CARDS
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tổng số nhân viên */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">1. Tổng số nhân viên</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center border border-emerald-100">
              <IconUsers size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">4,286</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              +2.4% so tháng trước
            </span>
          </div>
        </div>

        {/* Card 2: Đang làm việc */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">2. Nhân viên đang làm việc</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <IconUserCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">4,102</span>
            <span className="text-[10px] font-bold text-slate-400">95.7% active</span>
          </div>
        </div>

        {/* Card 3: Nhân viên mới */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">3. Nhân viên mới T8</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <IconUserPlus size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">86</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              +12 người
            </span>
          </div>
        </div>

        {/* Card 4: Nghỉ việc */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">4. Nhân viên nghỉ việc</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
              <IconUserMinus size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">24</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Giảm 8%
            </span>
          </div>
        </div>

        {/* Card 5: Vị trí đang tuyển */}
        <div
          onClick={() => onNavigateTab("recruitment")}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer hover:border-[#006838] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">5. Vị trí đang tuyển</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
              <IconBriefcase size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">37</span>
            <span className="text-[10px] font-bold text-purple-700 group-hover:underline">Xem tuyển dụng →</span>
          </div>
        </div>

        {/* Card 6: Hợp đồng sắp hết hạn */}
        <div
          onClick={() => onNavigateTab("contracts")}
          className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer hover:bg-amber-100/70 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900">6. Hợp đồng sắp hết hạn</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <IconAlertTriangle size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-900 tracking-tight">18</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
              Cần gia hạn trong 30d
            </span>
          </div>
        </div>

        {/* Card 7: Đơn chờ phê duyệt */}
        <div
          onClick={() => onNavigateTab("attendance_payroll")}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer hover:border-[#006838] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">7. Đơn chờ phê duyệt</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <IconClock size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">32</span>
            <span className="text-[10px] font-bold text-slate-400">Phép, tăng ca, điều chuyển</span>
          </div>
        </div>

        {/* Card 8: Tỷ lệ nghỉ việc */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">8. Tỷ lệ nghỉ việc (Turnover)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <IconTrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">2.8%</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              Trong ngưỡng an toàn
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          3. HR ANALYTICS CHARTS SECTION
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">Phân Tích Nguồn Nhân Lực (HR Analytics)</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Thống kê biến động, cơ cấu phòng ban và loại hình hợp đồng</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#006838] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Dữ liệu实时 T8/2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart 1: Department Distribution */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Cơ cấu nhân sự theo Phòng ban</span>
              <IconChartBar size={16} className="text-slate-400" />
            </div>

            <div className="space-y-2 text-xs font-medium">
              {[
                { name: "Khối Sản Xuất & NM1", count: 2450, pct: "57%" },
                { name: "Khối QC & Chất lượng", count: 420, pct: "10%" },
                { name: "Kho & Logistics", count: 380, pct: "9%" },
                { name: "Kinh Doanh & Xuất Khẩu", count: 310, pct: "7%" },
                { name: "Kế Toán / HR / Admin", count: 286, pct: "6.6%" },
                { name: "Khối IT & CĐS", count: 140, pct: "3.2%" },
                { name: "Nghiên cứu R&D", count: 300, pct: "7.2%" },
              ].map((d, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-700 font-semibold">{d.name}</span>
                    <span className="font-mono text-slate-500">{d.count} ({d.pct})</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#006838] rounded-full" style={{ width: d.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Contract Type Breakdown */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Cơ cấu loại hợp đồng</span>
              <IconChartPie size={16} className="text-slate-400" />
            </div>

            <div className="space-y-3 pt-2">
              {[
                { type: "Chính thức (Không XĐTH)", count: 2840, pct: "66%", color: "bg-[#006838]" },
                { type: "Chính thức (1-2 năm)", count: 1120, pct: "26%", color: "bg-blue-600" },
                { type: "Thử việc (2 tháng)", count: 210, pct: "5%", color: "bg-amber-500" },
                { type: "Hợp đồng mùa vụ", count: 116, pct: "3%", color: "bg-purple-600" },
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${c.color}`} />
                    <span className="text-xs font-bold text-slate-800">{c.type}</span>
                  </div>
                  <span className="text-xs font-black font-mono text-slate-900">{c.count} ({c.pct})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: Turnover comparison */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">So sánh biến động nhân sự T8</span>
              <IconTrendingUp size={16} className="text-[#006838]" />
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Tháng này (T8/2026)</span>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Tuyển mới: <strong className="text-[#006838]">+86</strong></span>
                  <span>Nghỉ việc: <strong className="text-rose-600">-24</strong></span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Tháng trước (T7/2026)</span>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Tuyển mới: <strong className="text-[#006838]">+74</strong></span>
                  <span>Nghỉ việc: <strong className="text-rose-600">-28</strong></span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Cùng kỳ 2025</span>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Tuyển mới: <strong className="text-[#006838]">+65</strong></span>
                  <span>Nghỉ việc: <strong className="text-rose-600">-32</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          4. ACTION ITEMS ("CÔNG VIỆC CẦN XỬ LÝ")
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">Công Việc Cần Xử Lý (Action Required)</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Danh sách công việc ưu tiên dành cho Trưởng phòng HR</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
            6 danh mục ưu tiên
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Task 1: Hợp đồng sắp hết hạn */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-black text-amber-950 block">Hợp đồng sắp hết hạn</span>
              <span className="text-xl font-black text-amber-900 font-mono">18 nhân viên</span>
              <p className="text-[10px] text-amber-800 font-medium">Cần ký lại hoặc thông báo chốt</p>
            </div>
            <button
              onClick={() => onNavigateTab("contracts")}
              className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
            >
              Xem danh sách
            </button>
          </div>

          {/* Task 2: Đơn nghỉ phép chờ duyệt */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-black text-slate-900 block">Đơn nghỉ phép chờ duyệt</span>
              <span className="text-xl font-black text-slate-900 font-mono">12 đơn</span>
              <p className="text-[10px] text-slate-500 font-medium">Trình duyệt cấp TP</p>
            </div>
            <button
              onClick={() => onNavigateTab("attendance_payroll")}
              className="px-3 py-1.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
            >
              Xử lý đơn
            </button>
          </div>

          {/* Task 3: Đề xuất tuyển dụng */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-black text-slate-900 block">Đề xuất tuyển dụng</span>
              <span className="text-xl font-black text-slate-900 font-mono">7 yêu cầu</span>
              <p className="text-[10px] text-slate-500 font-medium">Cần xem xét định biên</p>
            </div>
            <button
              onClick={() => onNavigateTab("recruitment")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
            >
              Xem đề xuất
            </button>
          </div>

          {/* Task 4: Hồ sơ cần bổ sung */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-black text-slate-900 block">Hồ sơ thiếu chứng từ</span>
              <span className="text-xl font-black text-slate-900 font-mono">23 người</span>
              <p className="text-[10px] text-slate-500 font-medium">Thiếu KSK, bằng cấp</p>
            </div>
            <button
              onClick={() => onNavigateTab("directory")}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold shrink-0 cursor-pointer"
            >
              Kiểm tra
            </button>
          </div>

          {/* Task 5: Onboarding chưa hoàn tất */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-black text-slate-900 block">Onboarding nhân viên mới</span>
              <span className="text-xl font-black text-slate-900 font-mono">8 người</span>
              <p className="text-[10px] text-slate-500 font-medium">Chờ bàn giao máy tính/thẻ</p>
            </div>
            <button
              onClick={() => onNavigateTab("lifecycle")}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold shrink-0 cursor-pointer"
            >
              Xử lý ngay
            </button>
          </div>

          {/* Task 6: Đánh giá thử việc */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-black text-slate-900 block">Hết thời gian thử việc</span>
              <span className="text-xl font-black text-slate-900 font-mono">15 người</span>
              <p className="text-[10px] text-slate-500 font-medium">Cần chốt HĐ chính thức</p>
            </div>
            <button
              onClick={() => onNavigateTab("lifecycle")}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold shrink-0 cursor-pointer"
            >
              Đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
