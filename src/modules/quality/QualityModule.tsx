"use client";

import React, { useState } from "react";
import FactorySelector from "./components/FactorySelector";
import FactoryInfoCard from "./components/FactoryInfoCard";
import QualityKG1KPIs from "./components/QualityKG1KPIs";
import QualityCharts from "./components/QualityCharts";
import IncidentList from "./components/IncidentList";
import { FACTORIES, KG1_KPIS, KG1_PARETO_ERRORS, KG1_INCIDENTS } from "./factoryConfig";
import { Factory } from "./types";
import {
  IconBuildingFactory2,
  IconShieldCheck,
  IconArrowUpRight,
  IconActivity,
  IconChecklist,
  IconSparkles,
} from "@tabler/icons-react";

interface QualityModuleProps {
  onNavigateToApp?: (url: string) => void;
}

export default function QualityModule({ onNavigateToApp }: QualityModuleProps) {
  const [selectedFactory, setSelectedFactory] = useState<Factory>(FACTORIES[0]);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar - Human Taste Aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
            <IconShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {selectedFactory.id === "all"
                  ? "Trung Tâm Quản Lý Chất Lượng Toàn Chuỗi"
                  : `Quản Lý Chất Lượng – ${selectedFactory.name}`}
              </h3>
              {selectedFactory.status === "live" && selectedFactory.id !== "all" && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#006838] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedFactory.code} LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedFactory.id === "all"
                ? "Giám sát chỉ số chất lượng, tỷ lệ đạt chuẩn QA/QC và OEE trên toàn bộ hệ thống nhà máy SKECHERS."
                : `Theo dõi chất lượng, sự cố và hiệu suất QC thời gian thực tại ${selectedFactory.name}.`}
            </p>
          </div>
        </div>

        {/* Factory Selector Dropdown */}
        <div className="flex-shrink-0">
          <FactorySelector
            selectedFactoryId={selectedFactory.id}
            onSelectFactory={(f) => setSelectedFactory(f)}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          VIEW 1: NHÀ MÁY KIÊN GIANG 1 (KG1) VIEW
         ════════════════════════════════════════════════════════════════ */}
      {selectedFactory.id === "kg1" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Factory Overview Banner Card with Portal CTA */}
          <FactoryInfoCard factory={selectedFactory} />

          {/* 2. 5 Human-Crafted KPI Cards */}
          <QualityKG1KPIs kpis={KG1_KPIS} />

          {/* 3. Operational Charts (Donut Distribution, Pareto Top 5, 2H SLA Widget) */}
          <QualityCharts kpis={KG1_KPIS} paretoErrors={KG1_PARETO_ERRORS} />

          {/* 4. Realtime Incident Processing List */}
          <IncidentList
            incidents={KG1_INCIDENTS}
            portalUrl={selectedFactory.portalUrl}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VIEW 2: TOÀN CHUỖI SKECHERS (DEFAULT VIEW)
         ════════════════════════════════════════════════════════════════ */}
      {selectedFactory.id === "all" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Chain-Wide 4 Metric Cards - Gapless Math Precision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
            {[
              {
                title: "Tỷ Lệ Đạt Chuẩn (First Pass Yield)",
                val: "98.4%",
                trend: "+0.6%",
                sub: "Mục tiêu: ≥ 98.0%",
                badgeColor: "bg-emerald-50 text-[#006838] border-emerald-200",
              },
              {
                title: "Hiệu Suất Tổng Thể (OEE)",
                val: "92.4%",
                trend: "+1.2%",
                sub: "33 Dây chuyền hoạt động",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
              },
              {
                title: "Tỷ Lệ Xử Lý Sự Cố ≤ 2H",
                val: "94.8%",
                trend: "+2.1%",
                sub: "Cam kết SLA 2 giờ",
                badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
              },
              {
                title: "Tổng Sự Cố Đang Xử Lý",
                val: "20 Vụ",
                trend: "-5 vụ so với hôm qua",
                sub: "KG1 (8), NM2 (12)",
                badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#006838]/60 hover:shadow-md transition-all group cursor-default space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 truncate">
                    {card.title}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${card.badgeColor}`}>
                    {card.trend}
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#006838] transition-colors">
                  {card.val}
                </div>
                <div className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>{card.sub}</span>
                  <IconActivity size={14} className="text-slate-300 group-hover:text-[#006838] transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Factories Overview Grid - Bento Dense Layout */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center">
                  <IconBuildingFactory2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight">
                    Bảng Theo Dõi Trực Quan Các Nhà Máy
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Chọn một nhà máy để mở dashboard chi tiết và điều phối vận hành
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                2 Cơ sở sản xuất
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-1">
              {/* Card KG1 */}
              <div
                onClick={() => setSelectedFactory(FACTORIES[1])}
                className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-white border border-emerald-300/80 shadow-2xs hover:shadow-lg hover:border-[#006838] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#006838] text-white flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                      KG1
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-slate-900 group-hover:text-[#006838] transition-colors">
                        Nhà máy Kiên Giang 1
                      </h5>
                      <span className="text-xs text-slate-500 font-medium">
                        24 chuyền sản xuất • Xưởng A, B, C
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">OEE</span>
                    <strong className="text-sm font-black text-[#006838]">98.2%</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Sự Cố</span>
                    <strong className="text-sm font-black text-amber-700">12 vụ</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">MTTR</span>
                    <strong className="text-sm font-black text-blue-700">38 phút</strong>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-[#006838] pt-2 border-t border-emerald-100/60">
                  <span>Khám phá Dashboard Nhà Máy KG1</span>
                  <IconArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Card KG2 (Soon) */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-2xs opacity-85 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black">
                      KG2
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">
                        Nhà máy Kiên Giang 2
                      </h5>
                      <span className="text-xs text-slate-500 font-medium">
                        16 chuyền sản xuất giai đoạn 2
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wide">
                    Đang Lập Kế Hoạch
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-500 text-center font-medium">
                  Hệ thống đang tích hợp cổng kết nối sensor và hạ tầng D1 Database phân tán.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
