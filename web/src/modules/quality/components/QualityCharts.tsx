"use client";

import React from "react";
import { ParetoErrorItem, QualityKPIs } from "../types";
import { IconChartPie, IconChartBar, IconClockCheck, IconAlertTriangle } from "@tabler/icons-react";

interface QualityChartsProps {
  kpis: QualityKPIs;
  paretoErrors: ParetoErrorItem[];
}

export default function QualityCharts({ kpis, paretoErrors }: QualityChartsProps) {
  const totalIncidents =
    kpis.unprocessed + kpis.processing + kpis.trialRun + kpis.completed;

  // Donut chart calculations
  const donutData = [
    { label: "Nghiệm thu", count: kpis.completed, color: "#006838", percent: ((kpis.completed / totalIncidents) * 100).toFixed(1) },
    { label: "Chờ tiếp nhận", count: kpis.unprocessed, color: "#d97706", percent: ((kpis.unprocessed / totalIncidents) * 100).toFixed(1) },
    { label: "Đang sửa chữa", count: kpis.processing, color: "#2563eb", percent: ((kpis.processing / totalIncidents) * 100).toFixed(1) },
    { label: "Chạy thử", count: kpis.trialRun, color: "#9333ea", percent: ((kpis.trialRun / totalIncidents) * 100).toFixed(1) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Phân bố sự cố (Donut Chart - 4 cols) */}
      <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center">
              <IconChartPie size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 tracking-tight">Phân Bố Trạng Thái Sự Cố</h4>
              <p className="text-[11px] text-slate-500 font-medium">Tiến độ xử lý phiếu tại KG1</p>
            </div>
          </div>
          <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {totalIncidents} Phiếu
          </span>
        </div>

        {/* Circular Donut Visual */}
        <div className="flex items-center justify-center py-2 relative">
          <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="11"
            />
            {/* Segments */}
            {(() => {
              let accumulatedPercent = 0;
              return donutData.map((item, idx) => {
                const p = parseFloat(item.percent);
                const strokeDasharray = `${p * 2.387} 238.7`;
                const strokeDashoffset = `-${accumulatedPercent * 2.387}`;
                accumulatedPercent += p;
                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="11"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 hover:opacity-85"
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900">{kpis.completed}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              ĐÃ ĐÓNG PHIẾU
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {donutData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-slate-700 truncate">{item.label}</span>
              </div>
              <span className="font-black text-slate-900 ml-1">{item.count.toString().padStart(2, "0")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top 5 Lỗi Chất Lượng Pareto (4 cols) */}
      <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <IconChartBar size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 tracking-tight">Pareto Top 5 Dạng Lỗi</h4>
              <p className="text-[11px] text-slate-500 font-medium">Tập trung 80% nguyên nhân chính</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            Trọng yếu
          </span>
        </div>

        {/* Progress Bars List */}
        <div className="space-y-3 py-1">
          {paretoErrors.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 truncate">{item.name}</span>
                <span className="text-slate-900 font-black">{item.percentage}% ({item.count} vụ)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 font-medium flex items-center gap-2">
          <IconAlertTriangle size={16} className="text-amber-700 flex-shrink-0" />
          <span>Tập trung xử lý triệt để <strong>Lỗi may</strong> và <strong>Dán đế</strong> để giảm 56% tỷ lệ lỗi toàn xưởng.</span>
        </div>
      </div>

      {/* 3. SLA Xử Lý Sự Cố (4 cols) */}
      <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <IconClockCheck size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 tracking-tight">Cam Kết Xử Lý Sự Cố SLA</h4>
              <p className="text-[11px] text-slate-500 font-medium">Tiêu chuẩn kiểm soát 2 giờ</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            2H SLA
          </span>
        </div>

        {/* Large SLA Indicator */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-[#e6f4ed] via-emerald-50 to-white border border-emerald-200/80 text-center space-y-1">
          <div className="text-4xl font-black text-[#006838] tracking-tight">
            92.4%
          </div>
          <div className="text-xs font-black text-[#004d29]">
            Tỷ Lệ Xử Lý Sự Cố Trong 2 Giờ
          </div>
          <div className="text-[11px] text-emerald-800/90 font-medium">
            Chỉ tiêu chuỗi SKECHERS: ≥ 90.0%
          </div>
        </div>

        {/* Sub Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500 font-semibold">MTTR Trung Bình</div>
            <div className="text-xs font-black text-slate-900 mt-0.5">38 phút</div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
            <div className="text-[10px] text-rose-700 font-semibold">Quá SLA</div>
            <div className="text-xs font-black text-rose-800 mt-0.5">02 vụ</div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-[10px] text-amber-800 font-semibold">Chờ Tiếp Nhận</div>
            <div className="text-xs font-black text-amber-900 mt-0.5">{kpis.unprocessed} vụ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
