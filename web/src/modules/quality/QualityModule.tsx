"use client";

import React, { useState, useEffect, useCallback } from "react";
import FactorySelector from "./components/FactorySelector";
import FactoryInfoCard from "./components/FactoryInfoCard";
import QualityKG1KPIs from "./components/QualityKG1KPIs";
import QualityCharts from "./components/QualityCharts";
import IncidentList from "./components/IncidentList";
import { FACTORIES, KG1_KPIS, KG1_PARETO_ERRORS, KG1_INCIDENTS } from "./factoryConfig";
import { Factory } from "./types";
import {
  fetchQualitySummary,
  QualityDashboardResponse,
} from "../../services/qualityDashboardService";
import {
  IconBuildingFactory2,
  IconShieldCheck,
  IconArrowUpRight,
  IconActivity,
  IconRefresh,
  IconAlertTriangle,
  IconChecklist,
  IconSparkles,
} from "@tabler/icons-react";

interface QualityModuleProps {
  onNavigateToApp?: (url: string) => void;
}

export default function QualityModule({ onNavigateToApp }: QualityModuleProps) {
  const [selectedFactory, setSelectedFactory] = useState<Factory>(FACTORIES[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qcData, setQcData] = useState<QualityDashboardResponse | null>(null);

  const loadData = useCallback(async (factoryId: string, force: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchQualitySummary(factoryId, force);
      setQcData(result);
    } catch (err: any) {
      console.error("[QualityModule] Load error:", err);
      setError(err?.message || "Không thể tải dữ liệu từ hệ thống HTPH-CLSK");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedFactory.id);
  }, [selectedFactory.id, loadData]);

  const handleOpenPortal = (portalUrl?: string) => {
    const targetUrl = portalUrl || "https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal";
    if (onNavigateToApp) {
      onNavigateToApp(targetUrl);
    } else {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  // 4 Main Metric Cards (Fallback default vs Dynamic from HTPH-CLSK API)
  const metricsList = [
    {
      title: "Tỷ Lệ Đạt Chuẩn (First Pass Yield)",
      val: qcData?.chainMetrics?.firstPassYield?.val || "98.4%",
      trend: qcData?.chainMetrics?.firstPassYield?.trend || "+0.6%",
      sub: qcData?.chainMetrics?.firstPassYield?.sub || "Mục tiêu: ≥ 98.0%",
      badgeColor: qcData?.chainMetrics?.firstPassYield?.badgeColor || "bg-emerald-50 text-[#006838] border-emerald-200",
    },
    {
      title: "Hiệu Suất Tổng Thể (OEE)",
      val: qcData?.chainMetrics?.oee?.val || "92.4%",
      trend: qcData?.chainMetrics?.oee?.trend || "+1.2%",
      sub: qcData?.chainMetrics?.oee?.sub || "33 Dây chuyền hoạt động",
      badgeColor: qcData?.chainMetrics?.oee?.badgeColor || "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Tỷ Lệ Xử Lý Sự Cố ≤ 2H",
      val: qcData?.chainMetrics?.sla2HoursRate?.val || "94.8%",
      trend: qcData?.chainMetrics?.sla2HoursRate?.trend || "+2.1%",
      sub: qcData?.chainMetrics?.sla2HoursRate?.sub || "Cam kết SLA 2 giờ",
      badgeColor: qcData?.chainMetrics?.sla2HoursRate?.badgeColor || "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: "Tổng Sự Cố Đang Xử Lý",
      val: qcData?.chainMetrics?.totalOpenIncidents?.val || "20 Vụ",
      trend: qcData?.chainMetrics?.totalOpenIncidents?.trend || "-5 vụ so với hôm qua",
      sub: qcData?.chainMetrics?.totalOpenIncidents?.sub || "KG1 (12), KG2 (8)",
      badgeColor: qcData?.chainMetrics?.totalOpenIncidents?.badgeColor || "bg-amber-50 text-amber-800 border-amber-200",
    },
  ];

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
              
              {/* Dynamic Live Status Badge */}
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#006838] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {qcData?.source === "live_htph_clsk" ? "HTPH-CLSK LIVE" : "D1 REALTIME"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Giám sát chất lượng, tỷ lệ đạt chuẩn QA/QC và sự cố trực tiếp từ Hệ thống Phản hồi & Xử lý Sự cố Chất lượng (HTPH-CLSK).
            </p>
          </div>
        </div>

        {/* Factory Selector Dropdown & Refresh Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => loadData(selectedFactory.id, true)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-emerald-600 hover:text-[#006838] transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Làm mới dữ liệu từ HTPH-CLSK"
          >
            <IconRefresh size={18} className={loading ? "animate-spin text-[#006838]" : ""} />
          </button>
          <FactorySelector
            selectedFactoryId={selectedFactory.id}
            onSelectFactory={(f) => setSelectedFactory(f)}
          />
        </div>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <IconAlertTriangle size={20} className="text-rose-600 flex-shrink-0" />
            <div className="text-xs font-semibold">
              <strong className="block text-rose-900">Không thể kết nối trực tiếp HTPH-CLSK:</strong>
              {error}
            </div>
          </div>
          <button
            onClick={() => loadData(selectedFactory.id, true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex-shrink-0 shadow-2xs cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !qcData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VIEW 1: NHÀ MÁY KIÊN GIANG 1 (KG1) VIEW
         ════════════════════════════════════════════════════════════════ */}
      {selectedFactory.id === "kg1" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Factory Overview Banner Card with Portal CTA */}
          <FactoryInfoCard factory={selectedFactory} />

          {/* 2. 5 KPI Cards */}
          <QualityKG1KPIs kpis={qcData?.kg1Kpis || KG1_KPIS} />

          {/* 3. Operational Charts (Donut Distribution, Pareto Top 5, 2H SLA Widget) */}
          <QualityCharts
            kpis={qcData?.kg1Kpis || KG1_KPIS}
            paretoErrors={qcData?.paretoErrors || KG1_PARETO_ERRORS}
          />

          {/* 4. Realtime Incident Processing List */}
          <IncidentList
            incidents={qcData?.incidents || KG1_INCIDENTS}
            portalUrl={selectedFactory.portalUrl || "https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal"}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VIEW 2: TOÀN CHUỖI SKECHERS (DEFAULT VIEW)
         ════════════════════════════════════════════════════════════════ */}
      {selectedFactory.id === "all" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Chain-Wide 4 Metric Cards - Precision Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
            {metricsList.map((card, idx) => (
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
                  <span className="truncate">{card.sub}</span>
                  <IconActivity size={14} className="text-slate-300 group-hover:text-[#006838] transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Factories Overview Grid - Dynamic Bento Layout */}
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
                    Dữ liệu chỉ số OEE, Sự cố và MTTR cập nhật trực tiếp từ HTPH-CLSK.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                {(qcData?.factories?.length || 2)} Cơ sở sản xuất
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-1">
              {/* Render Factory Cards from API */}
              {(qcData?.factories || [
                {
                  id: "kg1",
                  code: "KG1",
                  name: "Nhà máy Kiên Giang 1",
                  status: "live" as const,
                  totalLines: 24,
                  oee: 98.2,
                  openIncidents: 12,
                  mttrMinutes: 38,
                  portalUrl: "https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal",
                  detailsNote: "24 chuyền sản xuất • Xưởng A, B, C",
                },
                {
                  id: "kg2",
                  code: "KG2",
                  name: "Nhà máy Kiên Giang 2",
                  status: "planned" as const,
                  totalLines: 16,
                  oee: 95.0,
                  openIncidents: 8,
                  mttrMinutes: 45,
                  portalUrl: "https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal",
                  detailsNote: "16 chuyền sản xuất giai đoạn 2 (Đang lập kế hoạch sensor)",
                },
              ]).map((fac) => {
                const isLive = fac.status === "live";
                return (
                  <div
                    key={fac.id}
                    className={`p-5 rounded-2xl border shadow-2xs transition-all group ${
                      isLive
                        ? "bg-gradient-to-br from-emerald-50/60 via-white to-white border-emerald-300/80 hover:shadow-lg hover:border-[#006838] cursor-pointer"
                        : "bg-slate-50/80 border-slate-200 opacity-90"
                    }`}
                    onClick={() => {
                      if (isLive) {
                        const matched = FACTORIES.find((f) => f.id === fac.id);
                        if (matched) setSelectedFactory(matched);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform ${
                            isLive
                              ? "bg-[#006838] text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {fac.code}
                        </div>
                        <div>
                          <h5
                            className={`text-sm font-black text-slate-900 transition-colors ${
                              isLive ? "group-hover:text-[#006838]" : ""
                            }`}
                          >
                            {fac.name}
                          </h5>
                          <span className="text-xs text-slate-500 font-medium">
                            {fac.detailsNote || `${fac.totalLines} chuyền sản xuất`}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isLive
                            ? "bg-emerald-100 text-[#006838] border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {isLive ? "LIVE" : "ĐANG LẬP KẾ HOẠCH"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-semibold block">OEE</span>
                        <strong className="text-sm font-black text-[#006838]">
                          {fac.oee}%
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-semibold block">Sự Cố</span>
                        <strong className="text-sm font-black text-amber-700">
                          {fac.openIncidents} vụ
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-semibold block">MTTR</span>
                        <strong className="text-sm font-black text-blue-700">
                          {fac.mttrMinutes} phút
                        </strong>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-[#006838] pt-2 border-t border-emerald-100/60">
                      <span>Khám phá Dashboard Nhà Máy {fac.code} (HTPH-CLSK)</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPortal(fac.portalUrl);
                        }}
                        className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Mở Portal</span>
                        <IconArrowUpRight
                          size={16}
                          className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

