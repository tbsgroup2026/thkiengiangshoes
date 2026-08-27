"use client";

import React from "react";
import { QualityKPIs } from "../types";
import {
  IconInbox,
  IconLoader2,
  IconPlayerPlay,
  IconCircleCheck,
  IconFlame,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";

interface QualityKG1KPIsProps {
  kpis: QualityKPIs;
  onFilterClick?: (status: string) => void;
}

export default function QualityKG1KPIs({ kpis, onFilterClick }: QualityKG1KPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* KPI 01: Sự cố chờ tiếp nhận */}
      <div
        onClick={() => onFilterClick && onFilterClick("unprocessed")}
        className="p-5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-100">
            <IconInbox size={20} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 text-[10px] font-black tracking-wider flex items-center gap-1 border border-amber-200">
            <IconClock size={12} />
            15m SLA
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.unprocessed.toString().padStart(2, "0")}
          </div>
          <div className="text-xs font-black text-amber-900 mt-1">
            Sự Cố Chờ Tiếp Nhận
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Cần tiếp nhận & phân công
          </div>
        </div>
      </div>

      {/* KPI 02: Đang xử lý khắc phục */}
      <div
        onClick={() => onFilterClick && onFilterClick("processing")}
        className="p-5 rounded-2xl bg-white border border-blue-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100">
          <IconLoader2 size={20} className="animate-spin-slow" />
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.processing.toString().padStart(2, "0")}
          </div>
          <div className="text-xs font-black text-blue-900 mt-1">
            Đang Xử Lý Khắc Phục
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Điều tra 5M+1E & sửa chữa
          </div>
        </div>
      </div>

      {/* KPI 03: Chuyền theo dõi chạy thử */}
      <div
        onClick={() => onFilterClick && onFilterClick("trial")}
        className="p-5 rounded-2xl bg-white border border-purple-200/90 shadow-2xs hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-100">
          <IconPlayerPlay size={20} />
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.trialRun.toString().padStart(2, "0")}
          </div>
          <div className="text-xs font-black text-purple-900 mt-1">
            Theo Dõi Chạy Thử
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Thời lượng 3h – 48h
          </div>
        </div>
      </div>

      {/* KPI 04: Đã nghiệm thu đạt chuẩn */}
      <div
        onClick={() => onFilterClick && onFilterClick("completed")}
        className="p-5 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100">
          <IconCircleCheck size={20} />
        </div>

        <div className="mt-4">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.completed}
          </div>
          <div className="text-xs font-black text-[#006838] mt-1">
            Đã Nghiệm Thu Hoàn Tất
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Đóng phiếu đạt chuẩn QA
          </div>
        </div>
      </div>

      {/* KPI 05: Báo động SOS khẩn cấp */}
      <div
        onClick={() => onFilterClick && onFilterClick("sos")}
        className="p-5 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md shadow-rose-950/25 hover:shadow-lg hover:from-rose-700 hover:to-red-800 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute -right-3 -bottom-3 opacity-15 pointer-events-none">
          <IconFlame size={90} />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <IconAlertCircle size={20} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-black tracking-widest uppercase animate-pulse">
            KHẨN CẤP
          </span>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-3xl font-black text-white tracking-tight">
            {kpis.emergencySOS.toString().padStart(2, "0")}
          </div>
          <div className="text-xs font-black text-rose-100 mt-1">
            Báo Động SOS Khẩn
          </div>
          <div className="text-[11px] text-rose-100/90 font-medium mt-0.5">
            Cần lãnh đạo chỉ đạo ngay
          </div>
        </div>
      </div>
    </div>
  );
}
