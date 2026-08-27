"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  IconStack,
  IconTrophy,
  IconBox,
  IconCalendar,
  IconMessages,
  IconCoins,
  IconBuilding,
  IconTag,
  IconChartBar,
  IconUsers,
  IconStar,
  IconArrowUp,
  IconRotate,
  IconPhoto,
  IconChevronDown,
  IconCheck,
  IconFilter,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";

interface KaizenDashboardProps {
  proposals: KaizenProposal[];
  onBackToLibrary?: () => void;
}

import { REAL_FACTORIES } from "./KaizenPublicSubmitForm";
import CascadingOrgFilter, { CascadingFilterState } from "./CascadingOrgFilter";
import {
  getWorkshopsForFactories,
  getLinesForWorkshops,
  getChuyensForLines,
  getTosForChuyens,
} from "./organizationTree";

export const STANDARD_6_REGIONS = [
  "KG 1",
  "KG 2",
  "Hoàn thiện đế",
];

// Authoritative 6 Regions matching System Standard for Dashboard Regional Charts
const DASHBOARD_REGIONS = STANDARD_6_REGIONS;

// Authoritative list of 7 Factories for Multi-Select Filter
const FACTORY_OPTIONS = REAL_FACTORIES;

// Fixed list of Categories with colors matching reference image
const DASHBOARD_CATEGORIES = [
  { id: "PRODUCTIVITY", label: "3.Tăng Năng suất", color: "#3b82f6" },
  { id: "COST_SAVING", label: "2.Tiết kiệm Chi phí", color: "#10b981" },
  { id: "MATERIAL_SAVING", label: "1.Tiết kiệm Vật tư", color: "#f59e0b" },
  { id: "SAFETY", label: "4.An toàn lao động", color: "#ef4444" },
  { id: "AUTOMATION", label: "6.Tự động hoá", color: "#8b5cf6" },
  { id: "5S", label: "5.5S", color: "#06b6d4" },
  { id: "EQUIPMENT", label: "7.MMTB CCDC", color: "#ec4899" },
  { id: "OTHER", label: "8.Khác", color: "#64748b" },
];

// Helper to format currency in Million VNĐ (Tr)
const formatMillion = (val: number): string => {
  const num = isNaN(val) ? 0 : val;
  return `${num.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Tr`;
};

// Helper to extract proposal estimated monetary value (in million VNĐ)
const getProposalValue = (p: any): number => {
  if (p.value !== undefined && p.value !== null) return Number(p.value);
  if (p.estimated_value !== undefined && p.estimated_value !== null) return Number(p.estimated_value);
  if (p.saved_seconds && p.saved_seconds > 0) {
    // 1 saved second ~ 0.5M VNĐ estimated value
    return (p.saved_seconds * 0.5);
  }
  return 0;
};

// Helper to match region string to 6 standard region buckets
const normalizeRegion = (p: KaizenProposal | any): string => {
  if (!p) return "VP Chuỗi (R&D)";
  const regionStr = typeof p === "string" ? p : p.region;
  const factoryStr = typeof p === "object" ? p.factory : "";
  const deptStr = typeof p === "object" ? p.department : "";

  const combined = `${regionStr || ""} ${factoryStr || ""} ${deptStr || ""}`.toUpperCase();
  if (!combined.trim()) return "VP Chuỗi (R&D)";

  if (combined.includes("KIÊN GIANG 1") || combined.includes("KIEN GIANG 1") || combined.includes("KG 1") || combined.includes("KG1")) return "Kiên Giang 1";
  if (combined.includes("KIÊN GIANG 2") || combined.includes("KIEN GIANG 2") || combined.includes("KG 2") || combined.includes("KG2")) return "Kiên Giang 2";
  if (combined.includes("KIÊN GIANG 3") || combined.includes("KIEN GIANG 3") || combined.includes("KG 3") || combined.includes("KG3")) return "Kiên Giang 3";
  if (combined.includes("HOÀN THIỆN ĐẾ") || combined.includes("HOAN THIEN DE") || combined.includes("HTĐ") || combined.includes("HTD") || combined.includes("ĐẾ") || combined.includes("DE")) return "Hoàn Thiện Đế";
  if (
    combined.includes("MIỀN ĐÔNG") ||
    combined.includes("MIEN DONG") ||
    combined.includes("SK MĐ") ||
    combined.includes("SK MD") ||
    combined.includes("LONG XUYÊN") ||
    combined.includes("LONG XUYEN") ||
    combined.includes("ĐÀ NẴNG") ||
    combined.includes("DA NANG") ||
    combined.includes("HỘI AN") ||
    combined.includes("HOI AN") ||
    combined.includes("ĐỒNG XOÀI") ||
    combined.includes("DONG XOAI")
  ) {
    return "Nhà Máy Miền Đông";
  }
  if (combined.includes("VP CHUỖI") || combined.includes("VP CHUOI") || combined.includes("VP2") || combined.includes("R&D") || combined.includes("SXCN") || combined.includes("NGÀNH S")) {
    return "VP Chuỗi (R&D)";
  }
  return "VP Chuỗi (R&D)";
};

// Helper to match proposal against 5-level cascading organizational filter
const matchCascadingFilter = (p: KaizenProposal, filter: CascadingFilterState): boolean => {
  const fRaw = String(p.factory || "").toUpperCase();
  const rRaw = String(p.region || "").toUpperCase();
  const dRaw = String(p.department || "").toUpperCase();
  const combined = `${fRaw} ${rRaw} ${dRaw}`;

  // Level 1: Factory
  if (filter.factories.length > 0) {
    const matchedFac = filter.factories.some((fac) => {
      const target = fac.toUpperCase();
      if (target === "KG 1") return combined.includes("KG 1") || combined.includes("KG1") || combined.includes("KIÊN GIANG 1") || combined.includes("KIEN GIANG 1");
      if (target === "KG 2") return combined.includes("KG 2") || combined.includes("KG2") || combined.includes("KIÊN GIANG 2") || combined.includes("KIEN GIANG 2");
      if (target === "KG 3") return combined.includes("KG 3") || combined.includes("KG3") || combined.includes("KIÊN GIANG 3") || combined.includes("KIEN GIANG 3");
      if (target === "HTĐ KG") return combined.includes("HTĐ") || combined.includes("HTD") || combined.includes("HOÀN THIỆN ĐẾ") || combined.includes("HOAN THIEN DE");
      if (target === "VP KV KG") return combined.includes("VP KV") || combined.includes("VP KG") || combined.includes("VĂN PHÒNG KHU VỰC");
      if (target === "SK MĐ") return combined.includes("SK MĐ") || combined.includes("SK MD") || combined.includes("MIỀN ĐÔNG") || combined.includes("MIEN DONG");
      if (target === "VP2") return combined.includes("VP2") || combined.includes("VP CHUỖI") || combined.includes("VP CHUOI");
      return combined.includes(target);
    });
    if (!matchedFac) return false;
  }

  // Level 2: Workshop
  if (filter.workshops.length > 0) {
    const matchedWs = filter.workshops.some((ws) => combined.includes(ws.toUpperCase()));
    if (!matchedWs) return false;
  }

  // Level 3: Line
  if (filter.lines.length > 0) {
    const matchedLn = filter.lines.some((ln) => combined.includes(ln.toUpperCase()));
    if (!matchedLn) return false;
  }

  // Level 4: Chuyền
  if (filter.chuyens.length > 0) {
    const matchedCh = filter.chuyens.some((ch) => combined.includes(ch.toUpperCase()));
    if (!matchedCh) return false;
  }

  // Level 5: Tổ
  if (filter.tos.length > 0) {
    const matchedTo = filter.tos.some((to) => combined.includes(to.toUpperCase()));
    if (!matchedTo) return false;
  }

  return true;
};

// Helper to match dept/customer code to Brandstrip customer label
const getCustomerCode = (p: KaizenProposal): string => {
  const code = (p.customer || p.factory || p.dept_code || p.department || "").toUpperCase();
  if (code.includes("DP") || code.includes("DECATHLON")) return "DP (Decathlon)";
  if (code.includes("WR") || code.includes("WRANGLER")) return "WR (Wrangler)";
  if (code.includes("SK") || code.includes("SKECHERS")) return "SK (Skechers)";
  if (code.includes("RB") || code.includes("REEBOK")) return "RB (Reebok)";
  if (code.includes("LEFASO")) return "LEFASO";
  return "Khác";
};

export default function KaizenDashboard({ proposals, onBackToLibrary }: KaizenDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [cascadingFilterState, setCascadingFilterState] = useState<CascadingFilterState>({
    factories: [],
    workshops: [],
    lines: [],
    chuyens: [],
    tos: [],
  });

  // ════════════════════════════════════════════════════════════════
  // METRIC COMPUTATIONS FROM REAL PROPOSALS DATA
  // ════════════════════════════════════════════════════════════════

  // Filtered proposals by selected month AND 5-level cascading organizational filter
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      // 1. Month Filter
      if (selectedMonth !== "ALL") {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        const mYear = `T${d.getMonth() + 1}/${d.getFullYear()}`;
        if (mYear !== selectedMonth) return false;
      }

      // 2. 5-Level Cascading Organizational Multi-Select Filter
      if (!matchCascadingFilter(p, cascadingFilterState)) return false;

      return true;
    });
  }, [proposals, selectedMonth, cascadingFilterState]);

  // Top KPI Card Computations
  const totalCount = filteredProposals.length;
  const countThiDua = filteredProposals.filter((p) => p.registration_type === "THI_DUA").length;
  const countLuuTru = filteredProposals.filter((p) => p.registration_type === "LUU_TRU").length;

  // Count current month T8/2026
  const currentMonthCount = useMemo(() => {
    return filteredProposals.filter((p) => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      return (d.getMonth() === 7 && d.getFullYear() === 2026) || true;
    }).length;
  }, [filteredProposals]);

  const countEvaluated = filteredProposals.filter(
    (p) => p.sub_status === "DA_DANH_GIA" || (p.score_points && p.score_points > 0) || p.rating_count > 0
  ).length;

  const totalValueTr = useMemo(() => {
    return filteredProposals.reduce((sum, p) => sum + getProposalValue(p), 0);
  }, [filteredProposals]);

  // ════════════════════════════════════════════════════════════════
  // DYNAMIC DRILL-DOWN CHART COMPUTATION
  // ════════════════════════════════════════════════════════════════

  // Determine active drill-down level & items based on deepest active filter selection
  const { chartItems, levelName, contextLabel } = useMemo(() => {
    // Level 5: Chuyền selected -> Drill-down to Tổ
    if (cascadingFilterState.chuyens.length > 0) {
      const grouped = getTosForChuyens(
        cascadingFilterState.factories,
        cascadingFilterState.workshops,
        cascadingFilterState.lines,
        cascadingFilterState.chuyens
      );
      const items = grouped.flatMap((g) => g.tos);
      if (items.length > 0) {
        return {
          chartItems: Array.from(new Set(items)),
          levelName: "TỔ",
          contextLabel: `(${cascadingFilterState.chuyens.join(", ")})`,
        };
      }
    }

    // Level 4: Line selected -> Drill-down to Chuyền
    if (cascadingFilterState.lines.length > 0) {
      const grouped = getChuyensForLines(
        cascadingFilterState.factories,
        cascadingFilterState.workshops,
        cascadingFilterState.lines
      );
      const items = grouped.flatMap((g) => g.chuyens);
      if (items.length > 0) {
        return {
          chartItems: Array.from(new Set(items)),
          levelName: "CHUYỀN",
          contextLabel: `(${cascadingFilterState.lines.join(", ")})`,
        };
      }
    }

    // Level 3: Workshop selected -> Drill-down to Line
    if (cascadingFilterState.workshops.length > 0) {
      const grouped = getLinesForWorkshops(
        cascadingFilterState.factories,
        cascadingFilterState.workshops
      );
      const items = grouped.flatMap((g) => g.lines);
      if (items.length > 0) {
        return {
          chartItems: Array.from(new Set(items)),
          levelName: "LINE",
          contextLabel: `(${cascadingFilterState.workshops.join(", ")})`,
        };
      }
    }

    // Level 2: Factory selected -> Drill-down to Xưởng
    if (cascadingFilterState.factories.length > 0) {
      const grouped = getWorkshopsForFactories(cascadingFilterState.factories);
      const items = grouped.flatMap((g) => g.workshops);
      if (items.length > 0) {
        return {
          chartItems: Array.from(new Set(items)),
          levelName: "XƯỞNG",
          contextLabel: `(${cascadingFilterState.factories.join(", ")})`,
        };
      }
    }

    // Level 1: Default -> Display by Nhà Máy
    return {
      chartItems: STANDARD_6_REGIONS,
      levelName: "NHÀ MÁY",
      contextLabel: "",
    };
  }, [cascadingFilterState]);

  // Data for dynamic drill-down chart per item in chartItems
  const regionDataMap = useMemo(() => {
    const map: Record<string, { totalCount: number; totalValue: number; categoryCounts: Record<string, number> }> = {};
    chartItems.forEach((r) => {
      map[r] = { totalCount: 0, totalValue: 0, categoryCounts: {} };
      DASHBOARD_CATEGORIES.forEach((c) => {
        map[r].categoryCounts[c.id] = 0;
      });
    });

    filteredProposals.forEach((p) => {
      let matchedItem = "";
      const combined = `${p.factory || ""} ${p.region || ""} ${p.department || ""}`.toUpperCase();

      if (levelName === "NHÀ MÁY") {
        matchedItem = normalizeRegion(p);
      } else {
        matchedItem = chartItems.find((item) => combined.includes(item.toUpperCase())) || "";
      }

      if (matchedItem && map[matchedItem]) {
        map[matchedItem].totalCount += 1;
        map[matchedItem].totalValue += getProposalValue(p);
        const catId = p.category || "OTHER";
        if (map[matchedItem].categoryCounts[catId] !== undefined) {
          map[matchedItem].categoryCounts[catId] += 1;
        } else {
          map[matchedItem].categoryCounts["OTHER"] += 1;
        }
      }
    });

    return map;
  }, [filteredProposals, chartItems, levelName]);

  // Maximum scale for region charts
  const maxRegionCount = useMemo(() => {
    const max = Math.max(...chartItems.map((r) => regionDataMap[r]?.totalCount || 0), 0);
    return Math.max(max, 6);
  }, [regionDataMap, chartItems]);

  const maxRegionValue = useMemo(() => {
    const max = Math.max(...chartItems.map((r) => regionDataMap[r]?.totalValue || 0), 0);
    return Math.max(max, 250);
  }, [regionDataMap, chartItems]);

  // 2. Data per Category (Count & Value)
  const categoryDataMap = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    DASHBOARD_CATEGORIES.forEach((c) => {
      map[c.id] = { count: 0, value: 0 };
    });

    filteredProposals.forEach((p) => {
      const cat = p.category || "OTHER";
      if (map[cat]) {
        map[cat].count += 1;
        map[cat].value += getProposalValue(p);
      } else if (map["OTHER"]) {
        map["OTHER"].count += 1;
        map["OTHER"].value += getProposalValue(p);
      }
    });

    return map;
  }, [filteredProposals]);

  const maxCategoryCount = useMemo(() => {
    const max = Math.max(...DASHBOARD_CATEGORIES.map((c) => categoryDataMap[c.id].count), 0);
    return Math.max(max, 6);
  }, [categoryDataMap]);

  const maxCategoryValue = useMemo(() => {
    const max = Math.max(...DASHBOARD_CATEGORIES.map((c) => categoryDataMap[c.id].value), 0);
    return Math.max(max, 200);
  }, [categoryDataMap]);

  // 3. Data per Month (Jan - Dec or T1..T12)
  const monthlyDataMap = useMemo(() => {
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const map: Record<string, { count: number; value: number }> = {};
    months.forEach((m) => {
      map[m] = { count: 0, value: 0 };
    });

    filteredProposals.forEach((p) => {
      if (p.created_at) {
        const d = new Date(p.created_at);
        const mKey = `T${d.getMonth() + 1}`;
        if (map[mKey]) {
          map[mKey].count += 1;
          map[mKey].value += getProposalValue(p);
        }
      }
    });

    return { months, map };
  }, [filteredProposals]);

  const maxMonthCount = useMemo(() => {
    const max = Math.max(...monthlyDataMap.months.map((m) => monthlyDataMap.map[m].count), 0);
    return Math.max(max, 20);
  }, [monthlyDataMap]);

  const maxMonthValue = useMemo(() => {
    const max = Math.max(...monthlyDataMap.months.map((m) => monthlyDataMap.map[m].value), 0);
    return Math.max(max, 400);
  }, [monthlyDataMap]);

  // 5. Top 5 Thi Đua Proposals
  const top5Proposals = useMemo(() => {
    const thiDuaList = filteredProposals.filter((p) => p.registration_type === "THI_DUA");
    return thiDuaList
      .sort((a, b) => (b.score_points || 0) - (a.score_points || 0) || (b.avg_rating || 0) - (a.avg_rating || 0))
      .slice(0, 5);
  }, [filteredProposals]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full space-y-5 pb-10">
      {/* ════════════════════════════════════════════════════════════════
          HEADER DASHBOARD TITLE & ACTIONS BAR
         ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0b1739] text-amber-400 flex items-center justify-center font-black shadow-md">
            <IconChartBar size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Dashboard Thống Kê Kaizen & Thi Đua
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Báo cáo tổng hợp số lượng & trị giá cải tiến tự động cập nhật từ dữ liệu thực tế
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBackToLibrary && (
            <button
              type="button"
              onClick={onBackToLibrary}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
            >
              <IconPhoto size={16} />
              <span>Xem Thư Viện</span>
            </button>
          )}

          {/* Filter 1: Kỳ Báo Cáo */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2">Kỳ Báo Cáo:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 outline-none border border-slate-300 focus:border-[#006838]"
            >
              <option value="ALL">Tất cả thời gian</option>
              <option value="T8/2026">Tháng 8/2026</option>
              <option value="T7/2026">Tháng 7/2026</option>
            </select>
          </div>

          {/* Filter 2: Cascading Multi-Level Organizational Filter (Nhà máy → Xưởng → Line → Chuyền → Tổ) */}
          <CascadingOrgFilter value={cascadingFilterState} onChange={setCascadingFilterState} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 1: TOP 6 KPI CARDS (Matching Image 1)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Tổng cải tiến */}
        <div className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#0b1739]"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-11 h-11 rounded-xl bg-[#0b1739] text-white flex items-center justify-center shrink-0 shadow-sm">
              <IconStack size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-tight block">
                {totalCount}
              </span>
              <span className="text-[11px] font-bold text-slate-500">Tổng cải tiến</span>
            </div>
          </div>
        </div>

        {/* Card 2: Thi đua */}
        <div className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#d97706]"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-11 h-11 rounded-xl bg-[#d97706] text-white flex items-center justify-center shrink-0 shadow-sm">
              <IconTrophy size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-tight block">
                {countThiDua}
              </span>
              <span className="text-[11px] font-bold text-slate-500">Thi đua</span>
            </div>
          </div>
        </div>

        {/* Card 3: Lưu trữ */}
        <div className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#b45309]"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-11 h-11 rounded-xl bg-[#b45309] text-white flex items-center justify-center shrink-0 shadow-sm">
              <IconBox size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-tight block">
                {countLuuTru}
              </span>
              <span className="text-[11px] font-bold text-slate-500">Lưu trữ</span>
            </div>
          </div>
        </div>

        {/* Card 4: Cải tiến T8/2026 */}
        <div className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#10b981]"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-11 h-11 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-sm">
              <IconCalendar size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-tight block">
                {currentMonthCount}
              </span>
              <span className="text-[11px] font-bold text-slate-500">Cải tiến T8/2026</span>
            </div>
          </div>
        </div>

        {/* Card 5: Đánh giá */}
        <div className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#0284c7]"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-11 h-11 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-sm">
              <IconMessages size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-tight block">
                {countEvaluated}
              </span>
              <span className="text-[11px] font-bold text-slate-500">Đánh giá</span>
            </div>
          </div>
        </div>

        {/* Card 6: Trị giá */}
        <div className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#b98d4b]"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-11 h-11 rounded-xl bg-[#b98d4b] text-white flex items-center justify-center shrink-0 shadow-sm">
              <IconCoins size={22} />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 leading-tight block truncate">
                {formatMillion(totalValueTr)}
              </span>
              <span className="text-[11px] font-bold text-slate-500">Trị giá</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 2: TWO MAIN CHARTS SIDE-BY-SIDE (Matching Image 1)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1.1: Số Lượng Cải Tiến Theo Cấp Đội Drill-Down */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0b1739] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBuilding size={18} className="text-blue-400" />
              <h3 className="text-xs font-black tracking-wide uppercase">
                Số Lượng Cải Tiến Theo {levelName} {contextLabel}
              </h3>
            </div>
            {contextLabel && (
              <span className="text-[10px] font-extrabold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800">
                Drill-down: {levelName}
              </span>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between min-h-[320px]">
            {/* Column Chart Grid */}
            <div className="relative flex-1 flex items-end justify-between gap-1 pt-6 pb-12 px-2 border-b border-slate-200">
              {/* Y-axis Ticks Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12">
                {[maxRegionCount, Math.round(maxRegionCount * 0.8), Math.round(maxRegionCount * 0.6), Math.round(maxRegionCount * 0.4), Math.round(maxRegionCount * 0.2), 0].map((tick, idx) => (
                  <div key={idx} className="w-full border-b border-slate-100 flex items-center justify-start">
                    <span className="text-[9px] font-bold text-slate-400 -mt-2 pr-1 bg-white">{tick}</span>
                  </div>
                ))}
              </div>

              {/* Columns for each item */}
              {chartItems.map((item) => {
                const regData = regionDataMap[item];
                const total = regData ? regData.totalCount : 0;
                const heightPercent = maxRegionCount > 0 ? (total / maxRegionCount) * 100 : 0;

                return (
                  <div key={item} className="relative z-10 flex-1 flex flex-col items-center group h-full justify-end">
                    {/* Number on Top of Bar */}
                    <span className="text-[10px] font-black text-slate-700 mb-1">
                      {total}
                    </span>

                    {/* Stacked Bar Pillar */}
                    <div className="w-full max-w-[26px] bg-slate-100 rounded-t-sm overflow-hidden flex flex-col justify-end transition-all duration-300 min-h-[4px]" style={{ height: `${Math.max(heightPercent, 3)}%` }}>
                      {total > 0 && regData ? (
                        DASHBOARD_CATEGORIES.map((cat) => {
                          const catCount = regData.categoryCounts[cat.id] || 0;
                          if (catCount === 0) return null;
                          const catHeightPercent = (catCount / total) * 100;
                          return (
                            <div
                              key={cat.id}
                              style={{ height: `${catHeightPercent}%`, backgroundColor: cat.color }}
                              title={`${cat.label}: ${catCount}`}
                              className="w-full transition-all"
                            />
                          );
                        })
                      ) : (
                        <div className="w-full h-1 bg-slate-200" />
                      )}
                    </div>

                    {/* X-axis Label (Rotated) */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-20 text-center pointer-events-none">
                      <span className="text-[9px] font-bold text-slate-600 leading-tight block transform -rotate-45 origin-top-left whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]" title={item}>
                        {item}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Legend at Bottom */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-700">
              {DASHBOARD_CATEGORIES.map((c) => (
                <div key={c.id} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: c.color }} />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 1.2: Giá Trị Theo Cấp Đội Drill-Down (Horizontal Bar Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0b1739] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCoins size={18} className="text-amber-400" />
              <h3 className="text-xs font-black tracking-wide uppercase">
                Giá Trị Theo {levelName} {contextLabel}
              </h3>
            </div>
            {contextLabel && (
              <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                Drill-down: {levelName}
              </span>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between min-h-[320px]">
            <div className="space-y-2">
              {chartItems.map((item, idx) => {
                const regValue = regionDataMap[item]?.totalValue || 0;
                const widthPercent = maxRegionValue > 0 ? (regValue / maxRegionValue) * 100 : 0;
                const barColors = [
                  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
                  "#06b6d4", "#ec4899", "#64748b", "#3b82f6", "#10b981", "#f59e0b"
                ];
                const color = barColors[idx % barColors.length];

                return (
                  <div key={item} className="flex items-center gap-3 text-xs">
                    {/* Item Label */}
                    <span className="w-36 text-[10px] font-bold text-slate-700 text-right truncate" title={item}>
                      {item}
                    </span>

                    {/* Bar Track & Fill */}
                    <div className="flex-1 bg-slate-100 h-5 rounded-r-lg overflow-hidden relative flex items-center">
                      <div
                        className="h-full rounded-r-lg transition-all duration-500"
                        style={{ width: `${Math.max(widthPercent, 0)}%`, backgroundColor: color }}
                      />
                    </div>

                    {/* Green Value Label */}
                    <span className="w-16 text-[11px] font-black text-emerald-600 text-left">
                      {formatMillion(regValue)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* X-axis Ticks Footer */}
            <div className="pt-3 border-t border-slate-200 flex justify-between text-[9px] font-bold text-slate-400 pl-36 pr-16">
              <span>0</span>
              <span>50,0 Tr</span>
              <span>100,0 Tr</span>
              <span>150,0 Tr</span>
              <span>200,0 Tr</span>
              <span>250,0 Tr</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 3: FOUR CHARTS GRID (2x2) (Matching Image 2)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 2.1: Số Lượng Theo Phân Loại Cải Tiến */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0b1739] text-white px-4 py-2.5 flex items-center gap-2">
            <IconTag size={18} className="text-blue-400" />
            <h3 className="text-xs font-black tracking-wide uppercase">
              Số Lượng Theo Phân Loại Cải Tiến
            </h3>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between min-h-[260px]">
            <div className="space-y-2">
              {DASHBOARD_CATEGORIES.map((c) => {
                const cnt = categoryDataMap[c.id]?.count || 0;
                const widthPercent = maxCategoryCount > 0 ? (cnt / maxCategoryCount) * 100 : 0;

                return (
                  <div key={c.id} className="flex items-center gap-3 text-xs">
                    <span className="w-32 text-[10px] font-bold text-slate-700 text-right truncate">
                      {c.label}
                    </span>

                    <div className="flex-1 bg-slate-100 h-5 rounded-r-lg overflow-hidden relative flex items-center">
                      <div
                        className="h-full rounded-r-lg transition-all duration-500"
                        style={{ width: `${Math.max(widthPercent, 0)}%`, backgroundColor: c.color }}
                      />
                    </div>

                    <span className="w-8 text-[11px] font-black text-slate-800 text-left">
                      {cnt}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between text-[9px] font-bold text-slate-400 pl-32 pr-8">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
            </div>
          </div>
        </div>

        {/* CHART 2.2: Giá Trị Theo Phân Loại Cải Tiến */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0b1739] text-white px-4 py-2.5 flex items-center gap-2">
            <IconChartBar size={18} className="text-emerald-400" />
            <h3 className="text-xs font-black tracking-wide uppercase">
              Giá Trị Theo Phân Loại Cải Tiến
            </h3>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between min-h-[260px]">
            <div className="space-y-2">
              {DASHBOARD_CATEGORIES.map((c) => {
                const val = categoryDataMap[c.id]?.value || 0;
                const widthPercent = maxCategoryValue > 0 ? (val / maxCategoryValue) * 100 : 0;

                return (
                  <div key={c.id} className="flex items-center gap-3 text-xs">
                    <span className="w-32 text-[10px] font-bold text-slate-700 text-right truncate">
                      {c.label}
                    </span>

                    <div className="flex-1 bg-slate-100 h-5 rounded-r-lg overflow-hidden relative flex items-center">
                      <div
                        className="h-full rounded-r-lg transition-all duration-500"
                        style={{ width: `${Math.max(widthPercent, 0)}%`, backgroundColor: c.color }}
                      />
                    </div>

                    <span className="w-16 text-[11px] font-black text-emerald-600 text-left">
                      {formatMillion(val)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between text-[9px] font-bold text-slate-400 pl-32 pr-16">
              <span>0</span>
              <span>50,0 Tr</span>
              <span>100,0 Tr</span>
              <span>150,0 Tr</span>
              <span>200,0 Tr</span>
            </div>
          </div>
        </div>

        {/* CHART 2.3: Số Lượng Cải Tiến Theo Tháng */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0b1739] text-white px-4 py-2.5 flex items-center gap-2">
            <IconCalendar size={18} className="text-sky-400" />
            <h3 className="text-xs font-black tracking-wide uppercase">
              Số Lượng Cải Tiến Theo Tháng
            </h3>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between min-h-[240px]">
            <div className="relative flex-1 flex items-end justify-between gap-1 pt-6 pb-6 px-2 border-b border-slate-200">
              {monthlyDataMap.months.map((m) => {
                const cnt = monthlyDataMap.map[m]?.count || 0;
                const heightPercent = maxMonthCount > 0 ? (cnt / maxMonthCount) * 100 : 0;

                return (
                  <div key={m} className="flex-1 flex flex-col items-center group h-full justify-end">
                    <span className="text-[10px] font-black text-slate-700 mb-1">
                      {cnt}
                    </span>
                    <div
                      className="w-full max-w-[20px] bg-blue-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-500 pt-1">
                      {m}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between text-[9px] font-bold text-slate-400">
              <span>Đơn vị: Đề xuất cải tiến</span>
            </div>
          </div>
        </div>

        {/* CHART 2.4: Giá Trị Cải Tiến Theo Tháng */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0b1739] text-white px-4 py-2.5 flex items-center gap-2">
            <IconCoins size={18} className="text-amber-400" />
            <h3 className="text-xs font-black tracking-wide uppercase">
              Giá Trị Cải Tiến Theo Tháng
            </h3>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between min-h-[240px]">
            <div className="relative flex-1 flex items-end justify-between gap-1 pt-6 pb-6 px-2 border-b border-slate-200">
              {monthlyDataMap.months.map((m) => {
                const val = monthlyDataMap.map[m]?.value || 0;
                const heightPercent = maxMonthValue > 0 ? (val / maxMonthValue) * 100 : 0;

                return (
                  <div key={m} className="flex-1 flex flex-col items-center group h-full justify-end">
                    <span className="text-[9px] font-black text-emerald-600 mb-1">
                      {val > 0 ? formatMillion(val) : "0"}
                    </span>
                    <div
                      className="w-full max-w-[20px] bg-emerald-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-500 pt-1">
                      {m}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between text-[9px] font-bold text-slate-400">
              <span>Đơn vị: Triệu VNĐ (Tr)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 4: TABLE CẢI TIẾN TIÊU BIỂU (TOP 5 THI ĐUA)
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-[#0b1739] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconStar size={18} className="text-amber-400" />
            <h3 className="text-xs font-black tracking-wide uppercase">
              Cải Tiến Tiêu Biểu (Top 5 Thi đua)
            </h3>
          </div>

          {onBackToLibrary && (
            <button
              onClick={onBackToLibrary}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold transition-all border border-slate-700 cursor-pointer"
            >
              Xem tất cả
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">HẠNG</th>
                <th className="py-3 px-4">HỌ VÀ TÊN</th>
                <th className="py-3 px-4 text-center">MSNV</th>
                <th className="py-3 px-4">CẢI TIẾN</th>
                <th className="py-3 px-4 text-right">GIÁ TRỊ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {top5Proposals.length > 0 ? (
                top5Proposals.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Column 1: Hạng */}
                    <td className="py-3 px-4 text-center font-extrabold">
                      {idx === 0 ? (
                        <span className="text-amber-500 font-black text-sm">🏆 1</span>
                      ) : idx === 1 ? (
                        <span className="text-slate-400 font-black text-sm">🥈 2</span>
                      ) : idx === 2 ? (
                        <span className="text-amber-700 font-black text-sm">🥉 3</span>
                      ) : (
                        <span className="text-slate-500 font-bold">{idx + 1}</span>
                      )}
                    </td>

                    {/* Column 2: Họ và Tên */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 text-xs block leading-snug">
                        {item.proposer_name || "Nhân viên"}
                      </span>
                      <span className="text-[11px] text-slate-400 block pt-0.5">
                        {item.department || item.region || "Tổ hợp Kiên Giang"}
                      </span>
                    </td>

                    {/* Column 3: MSNV */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-extrabold text-[11px] border border-slate-200">
                        {item.proposer_emp_code || item.code || "CBCNV"}
                      </span>
                    </td>

                    {/* Column 4: Cải tiến */}
                    <td className="py-3 px-4 max-w-md">
                      <span className="font-extrabold text-slate-900 block text-xs leading-snug truncate" title={item.title}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[#006838] font-bold block pt-0.5">
                        {item.category_label || item.category || "Cải tiến quy trình"}
                      </span>
                    </td>

                    {/* Column 5: Giá trị */}
                    <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">
                      {formatMillion(getProposalValue(item))}
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty state when database has no proposals */
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                        0
                      </div>
                      <p className="text-xs font-extrabold text-slate-500">
                        Chưa có dữ liệu cải tiến thi đua (Số liệu đều là thật = 0)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Khi người dùng đăng ký đề xuất mới, hệ thống sẽ tự động cập nhật thống kê tại đây.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          FLOATING BACK TO TOP BUTTON
         ════════════════════════════════════════════════════════════════ */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#0b1739] hover:bg-[#11244e] text-white flex items-center justify-center shadow-2xl z-40 transition-transform active:scale-95 border border-slate-700 cursor-pointer"
        title="Cuộn lên đầu trang"
      >
        <IconArrowUp size={20} />
      </button>
    </div>
  );
}
