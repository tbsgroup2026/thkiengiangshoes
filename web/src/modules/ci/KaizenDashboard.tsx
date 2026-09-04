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
  IconX,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";

interface KaizenDashboardProps {
  proposals: KaizenProposal[];
  onBackToLibrary?: () => void;
  onNavigateToStatus?: (regTypeStatus: string) => void;
  onSelectProposal?: (p: KaizenProposal) => void;
}

import { REAL_FACTORIES } from "./KaizenPublicSubmitForm";
import CascadingOrgFilter, { CascadingFilterState } from "./CascadingOrgFilter";
import {
  getWorkshopsForFactories,
  getLinesForWorkshops,
  getChuyensForLines,
  getTosForChuyens,
} from "./organizationTree";

export const STANDARD_8_REGIONS = [
  "Kiên Giang 1",
  "Kiên Giang 2",
  "Kiên Giang 3",
  "Hoàn thiện đế",
  "Phòng kế hoạch",
  "Phòng CN-CI",
  "Phòng chất lượng",
  "Phòng nhân sự",
];

export const STANDARD_6_REGIONS = STANDARD_8_REGIONS;

// Authoritative 8 Regions matching System Standard for Dashboard Regional Charts
const DASHBOARD_REGIONS = STANDARD_8_REGIONS;

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

// Award structure configuration (Single source of truth for Kaizen Leaderboard Prizes)
export const KAIZEN_AWARD_STRUCTURE = [
  { maxRank: 1, amountVnd: 1000000, valueTr: 1.0, title: "Giải Nhất" },
  { maxRank: 3, amountVnd: 500000, valueTr: 0.5, title: "Giải Nhì" },
  { maxRank: 8, amountVnd: 300000, valueTr: 0.3, title: "Giải Ba" },
  { maxRank: 18, amountVnd: 200000, valueTr: 0.2, title: "Giải Tư" },
  { maxRank: 38, amountVnd: 100000, valueTr: 0.1, title: "Giải Khuyến Khích" },
];

export function getAwardValueTrByRank(rank: number): number {
  if (rank <= 0) return 0;
  const award = KAIZEN_AWARD_STRUCTURE.find((item) => rank <= item.maxRank);
  return award ? award.valueTr : 0;
}

// Helper to format currency in Million VNĐ (Tr)
const formatMillion = (val: number): string => {
  const num = isNaN(val) ? 0 : val;
  return `${num.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Tr`;
};

// Helper to extract proposal total monetary savings value (in Million VNĐ)
const getProposalValue = (p: any): number => {
  if (!p) return 0;

  // 1. Direct total_savings_vnd field (in VNĐ) -> Convert to Million VNĐ (Tr)
  const directTotalVnd = Number(p.total_savings_vnd || (p as any).tong_tien_tiet_kiem || 0);
  if (directTotalVnd > 0) {
    return directTotalVnd / 1000000;
  }

  // 2. Compute from pair_quantity * saved_seconds * 12.5 VNĐ
  const pairQty = Number(p.pair_quantity || (p as any).so_luong_giay || (p as any).quantity || 0);
  const savedSecs = Number(p.saved_seconds || 0);
  if (pairQty > 0 && savedSecs > 0) {
    const totalVnd = Math.round(savedSecs * 12.5) * pairQty;
    return totalVnd / 1000000;
  }

  // 3. Fallback for non-time financial proposal fields (if value or estimated_value is already in Million VNĐ)
  if (p.value !== undefined && p.value !== null && Number(p.value) > 0) return Number(p.value);
  if (p.estimated_value !== undefined && p.estimated_value !== null && Number(p.estimated_value) > 0) return Number(p.estimated_value);

  return 0;
};

// Helper to match region string to 8 standard region/department buckets
const normalizeRegion = (p: KaizenProposal | any): string => {
  if (!p) return "Kiên Giang 1";
  const regionStr = typeof p === "string" ? p : p.region;
  const factoryStr = typeof p === "object" ? p.factory : "";
  const deptStr = typeof p === "object" ? p.department : "";

  const combined = `${regionStr || ""} ${factoryStr || ""} ${deptStr || ""}`.toUpperCase();
  if (!combined.trim()) return "Kiên Giang 1";

  if (combined.includes("KIÊN GIANG 3") || combined.includes("KIEN GIANG 3") || combined.includes("KG 3") || combined.includes("KG3")) return "Kiên Giang 3";
  if (combined.includes("KIÊN GIANG 2") || combined.includes("KIEN GIANG 2") || combined.includes("KG 2") || combined.includes("KG2")) return "Kiên Giang 2";
  if (combined.includes("KIÊN GIANG 1") || combined.includes("KIEN GIANG 1") || combined.includes("KG 1") || combined.includes("KG1")) return "Kiên Giang 1";
  if (combined.includes("HOÀN THIỆN ĐẾ") || combined.includes("HOAN THIEN DE") || combined.includes("HTĐ") || combined.includes("HTD") || combined.includes("ĐẾ") || combined.includes("DE")) return "Hoàn thiện đế";
  if (combined.includes("KẾ HOẠCH") || combined.includes("KE HOACH") || combined.includes("PPC")) return "Phòng kế hoạch";
  if (combined.includes("CN-CI") || combined.includes("CN CI") || combined.includes("CONTINUOUS IMPROVEMENT") || combined.includes("P. CN-CI")) return "Phòng CN-CI";
  if (combined.includes("CHẤT LƯỢNG") || combined.includes("CHAT LUONG") || combined.includes("QA") || combined.includes("QC")) return "Phòng chất lượng";
  if (combined.includes("NHÂN SỰ") || combined.includes("NHAN SU") || combined.includes("HR") || combined.includes("HÀNH CHÍNH")) return "Phòng nhân sự";

  return "Kiên Giang 1";
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

export default function KaizenDashboard({ proposals, onBackToLibrary, onNavigateToStatus, onSelectProposal }: KaizenDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [statusScope, setStatusScope] = useState<"APPROVED" | "EVALUATED" | "ALL">("APPROVED");
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

  // Filtered proposals by statusScope, selected month, AND 5-level cascading organizational filter
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      // 1. Status Scope Filter
      const subStatus = String(p.sub_status || "").toUpperCase();
      const appStatus = String(p.approval_status || "").toUpperCase();
      const mainStatus = String(p.status || "").toUpperCase();

      // Always exclude rejected proposals
      if (appStatus === "TU_CHOI" || mainStatus === "REJECTED" || subStatus === "TU_CHOI_TRIEN_KHAI") {
        return false;
      }

      if (statusScope === "APPROVED") {
        // Default: Only proposals that passed Step 3 Feasibility Approval or above
        const isApprovedOrAbove =
          subStatus === "CHO_DANH_GIA" ||
          subStatus === "DA_DANH_GIA" ||
          subStatus === "LUU_TRU" ||
          appStatus === "PHE_DUYET" ||
          appStatus === "DA_DANH_GIA" ||
          mainStatus === "APPROVED" ||
          mainStatus === "IMPLEMENTED" ||
          mainStatus === "EVALUATED";
        if (!isApprovedOrAbove) return false;
      } else if (statusScope === "EVALUATED") {
        // Evaluated / Archived proposals only (final evaluated figures)
        const isEvaluated =
          subStatus === "DA_DANH_GIA" ||
          subStatus === "LUU_TRU" ||
          appStatus === "DA_DANH_GIA" ||
          Number(p.score_points || (p as any).scorePoints || 0) > 0;
        if (!isEvaluated) return false;
      }

      // 2. Month Filter
      if (selectedMonth !== "ALL") {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        const mYear = `T${d.getMonth() + 1}/${d.getFullYear()}`;
        if (mYear !== selectedMonth) return false;
      }

      // 3. 5-Level Cascading Organizational Multi-Select Filter
      if (!matchCascadingFilter(p, cascadingFilterState)) return false;

      return true;
    });
  }, [proposals, statusScope, selectedMonth, cascadingFilterState]);

  // Dynamically generate available month options from actual proposals dates
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    proposals.forEach((p) => {
      if (p.created_at) {
        try {
          const d = new Date(p.created_at);
          if (!isNaN(d.getTime())) {
            set.add(`T${d.getMonth() + 1}/${d.getFullYear()}`);
          }
        } catch {}
      }
    });

    set.add("T8/2026");
    set.add("T7/2026");

    return Array.from(set).sort((a, b) => {
      const [mA, yA] = a.replace("T", "").split("/").map(Number);
      const [mB, yB] = b.replace("T", "").split("/").map(Number);
      if (yB !== yA) return yB - yA;
      return mB - mA;
    });
  }, [proposals]);

  // Top KPI Card Computations
  const totalCount = filteredProposals.length;
  const countThiDua = filteredProposals.filter((p) => p.registration_type === "THI_DUA").length;
  const countLuuTru = filteredProposals.filter((p) => p.registration_type === "LUU_TRU").length;

  // Dynamic label & count for Card 4 matching selected month or current month
  const activeMonthLabel = selectedMonth !== "ALL" ? `Cải tiến ${selectedMonth}` : `Cải tiến T8/2026`;

  const activeMonthCount = useMemo(() => {
    if (selectedMonth !== "ALL") {
      return filteredProposals.length;
    }
    return filteredProposals.filter((p) => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      return !isNaN(d.getTime()) && d.getMonth() === 7 && d.getFullYear() === 2026;
    }).length;
  }, [filteredProposals, selectedMonth]);

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

    // Level 1: Default -> Display by Nhà Máy / Khu Vực
    return {
      chartItems: STANDARD_8_REGIONS,
      levelName: "NHÀ MÁY / KHU VỰC",
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

  const [showTop11Modal, setShowTop11Modal] = useState(false);

  // ════════════════════════════════════════════════════════════════
  // SORT STATE FOR RANKING TABLE (shared between inline table & modal)
  // ════════════════════════════════════════════════════════════════
  type SortCol = "rank" | "name" | "empCode" | "title" | "value";
  type SortDir = "asc" | "desc";
  const [sortCol, setSortCol] = useState<SortCol>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Reset sort về mặc định (Hạng ↑) khi người dùng đổi tháng hoặc đổi org filter
  useEffect(() => {
    setSortCol("rank");
    setSortDir("asc");
  }, [selectedMonth, cascadingFilterState]);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "value" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <IconArrowsSort size={12} className="opacity-40" />;
    return sortDir === "asc" ? (
      <IconSortAscending size={12} className="text-amber-400" />
    ) : (
      <IconSortDescending size={12} className="text-amber-400" />
    );
  };

  // 5. Top 38 Thi Đua Proposals with strict Award Quota (Chỉ xếp hạng những bài ĐÃ PHÊ DUYỆT & theo lọc tháng / tổ chức)
  const ranked11Proposals = useMemo(() => {
    let thiDuaList = proposals.filter((p) => {
      if (!p || p.is_archived) return false;

      const appStatus = String(p.approval_status || (p as any).approvalStatus || "").toUpperCase();
      const subStatus = String(p.sub_status || (p as any).subStatus || p.review_status || "").toUpperCase();
      const status = String(p.status || "").toUpperCase();

      // Bài bị từ chối -> Không xếp hạng
      if (appStatus === "TU_CHOI" || subStatus === "TU_CHOI_TRIEN_KHAI" || status === "REJECTED") {
        return false;
      }

      // Bài chưa phê duyệt (Bước 3) -> KHÔNG XẾP HẠNG ("chưa duyệt thì chưa xếp hạng")
      if (subStatus === "CHO_REVIEW" || appStatus === "PENDING" || status === "SUBMITTED") {
        return false;
      }

      // Bắt buộc phải ĐÃ PHÊ DUYỆT tính khả thi
      const isApproved =
        appStatus === "PHE_DUYET" ||
        subStatus === "CHO_DANH_GIA" ||
        subStatus === "DA_DANH_GIA" ||
        status === "UNDER_REVIEW" ||
        status === "APPROVED" ||
        status === "COMPLETED";

      if (!isApproved) return false;

      // 1. Month Filter
      if (selectedMonth !== "ALL") {
        if (!p.created_at) return false;
        try {
          const d = new Date(p.created_at);
          if (isNaN(d.getTime())) return false;
          const mYear = `T${d.getMonth() + 1}/${d.getFullYear()}`;
          if (mYear !== selectedMonth) return false;
        } catch {
          return false;
        }
      }

      // 2. Cascading Org Filter
      if (!matchCascadingFilter(p, cascadingFilterState)) return false;

      return true;
    });

    if (
      thiDuaList.length === 0 &&
      proposals.length > 0 &&
      selectedMonth === "ALL" &&
      cascadingFilterState.factories.length === 0
    ) {
      thiDuaList = proposals;
    }

    const sorted = [...thiDuaList]
      .sort((a, b) => {
        const valA = getProposalValue(a);
        const valB = getProposalValue(b);
        if (valB !== valA) return valB - valA;

        const scoreA = Number(a.score_points || (a as any).scorePoints || 0);
        const scoreB = Number(b.score_points || (b as any).scorePoints || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;

        const voteA = Number(a.vote_count || 0);
        const voteB = Number(b.vote_count || 0);
        if (voteB !== voteA) return voteB - voteA;

        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 38);

    return sorted.map((item, index) => {
      let rank = 1;
      let rankTitle = "Hạng Nhất";
      let prizeValueTr = 1.0;
      let badgeLabel = "🏆 Hạng 1";
      let badgeStyle = "bg-amber-100 text-amber-900 border-amber-300 font-black";

      if (index === 0) {
        rank = 1;
        rankTitle = "Hạng Nhất";
        prizeValueTr = 1.0;
        badgeLabel = "🏆 Hạng 1";
        badgeStyle = "bg-amber-100 text-amber-900 border-amber-300 font-black";
      } else if (index >= 1 && index <= 2) {
        rank = 2;
        rankTitle = "Hạng Nhì";
        prizeValueTr = 0.5;
        badgeLabel = "🥈 Hạng 2";
        badgeStyle = "bg-slate-100 text-slate-800 border-slate-300 font-black";
      } else if (index >= 3 && index <= 7) {
        rank = 3;
        rankTitle = "Hạng Ba";
        prizeValueTr = 0.3;
        badgeLabel = "🥉 Hạng 3";
        badgeStyle = "bg-amber-900/10 text-amber-900 border-amber-800/30 font-black";
      } else if (index >= 8 && index <= 17) {
        rank = 4;
        rankTitle = "Hạng 4";
        prizeValueTr = 0.2;
        badgeLabel = "🎖️ Hạng 4";
        badgeStyle = "bg-blue-50 text-blue-900 border-blue-200 font-black";
      } else if (index >= 18 && index <= 37) {
        rank = 5;
        rankTitle = "Hạng 5";
        prizeValueTr = 0.1;
        badgeLabel = "🎗️ Hạng 5";
        badgeStyle = "bg-emerald-50 text-emerald-900 border-emerald-200 font-black";
      } else {
        rank = index + 1;
        rankTitle = `Hạng ${index + 1}`;
        prizeValueTr = 0;
        badgeLabel = `#${index + 1}`;
        badgeStyle = "bg-slate-100 text-slate-600 border-slate-200 font-bold";
      }

      const curVal = getProposalValue(item);
      const curScore = Number(item?.score_points || (item as any)?.scorePoints || 0);

      let isTied = false;
      if (rank !== 1) {
        if (index > 0) {
          const prevItem = sorted[index - 1];
          if (getProposalValue(prevItem) === curVal && Number(prevItem.score_points || 0) === curScore) {
            isTied = true;
          }
        }
        if (index < sorted.length - 1) {
          const nextItem = sorted[index + 1];
          if (getProposalValue(nextItem) === curVal && Number(nextItem.score_points || 0) === curScore) {
            isTied = true;
          }
        }
      }

      return { item, rank, rankTitle, prizeValueTr, badgeLabel, badgeStyle, isTied };
    });
  }, [proposals, selectedMonth, cascadingFilterState]);

  // Sorted version of ranked11Proposals applied on top of the ranked array
  const sortedRankedProposals = useMemo(() => {
    return [...ranked11Proposals].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "rank") {
        cmp = a.rank - b.rank;
      } else if (sortCol === "name") {
        const nameA = (a.item.proposer_name || (a.item as any).proposerName || "").toLowerCase();
        const nameB = (b.item.proposer_name || (b.item as any).proposerName || "").toLowerCase();
        cmp = nameA.localeCompare(nameB, "vi");
      } else if (sortCol === "empCode") {
        const codeA = (a.item.proposer_emp_code || (a.item as any).proposerEmpCode || a.item.code || "").toLowerCase();
        const codeB = (b.item.proposer_emp_code || (b.item as any).proposerEmpCode || b.item.code || "").toLowerCase();
        cmp = codeA.localeCompare(codeB, "vi");
      } else if (sortCol === "title") {
        const tA = (a.item.title || "").toLowerCase();
        const tB = (b.item.title || "").toLowerCase();
        cmp = tA.localeCompare(tB, "vi");
      } else if (sortCol === "value") {
        cmp = getProposalValue(b.item) - getProposalValue(a.item);
        // Note: default for value is already desc via sortDir
        return sortDir === "desc" ? cmp : -cmp;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [ranked11Proposals, sortCol, sortDir]);

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

          {/* Filter 1: Phạm Vi Trạng Thái */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2">Phạm Vi:</span>
            <select
              value={statusScope}
              onChange={(e) => setStatusScope(e.target.value as any)}
              className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-800 outline-none border border-slate-300 focus:border-[#006838]"
            >
              <option value="APPROVED">🟢 Đã phê duyệt (Chính thức)</option>
              <option value="EVALUATED">⭐ Đã đánh giá / Hoàn thành</option>
              <option value="ALL">📋 Tất cả (Gồm chờ duyệt)</option>
            </select>
          </div>

          {/* Filter 2: Kỳ Báo Cáo */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2">Kỳ Báo Cáo:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 outline-none border border-slate-300 focus:border-[#006838]"
            >
              <option value="ALL">Tất cả thời gian</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  Tháng {m.replace("T", "")}
                </option>
              ))}
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
        <div
          onClick={() => setStatusScope('ALL')}
          className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
        >
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
        <div
          onClick={() => setStatusScope('APPROVED')}
          className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
        >
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
        <div
          onClick={() => setStatusScope('EVALUATED')}
          className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
        >
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

        {/* Card 4: Dynamic Month Card */}
        <div
          onClick={() => setSelectedMonth('ALL')}
          className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
        >
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#10b981]"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-11 h-11 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-sm">
              <IconCalendar size={22} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-tight block">
                {activeMonthCount}
              </span>
              <span className="text-[11px] font-bold text-slate-500">{activeMonthLabel}</span>
            </div>
          </div>
        </div>

        {/* Card 5: Đánh giá */}
        <div
          onClick={() => setStatusScope('EVALUATED')}
          className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
        >
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

        {/* Card 6: Trị giá / Chờ duyệt */}
        <div
          onClick={() => setStatusScope('APPROVED')}
          className="relative overflow-hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
        >
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
          ROW 4: TABLE CẢI TIẾN TIÊU BIỂU (TOP THI ĐUA KHEN THƯỞNG)
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-[#0b1739] text-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconStar size={18} className="text-amber-400 shrink-0" />
            <div>
              <h3 className="text-xs font-black tracking-wide uppercase">
                Một số cải tiến được khen thưởng (Xếp hạng thi đua)
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Filter Lọc Theo Tháng cho Bảng Thi Đua */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-2xs">
              <IconCalendar size={15} className="text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-300 whitespace-nowrap">Lọc tháng:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-950 text-amber-300 text-xs font-extrabold px-2 py-0.5 rounded-lg border border-slate-700 outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="ALL">Tất cả thời gian</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    Tháng {m.replace("T", "")}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowTop11Modal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <IconTrophy size={15} />
              <span>Xem tất cả</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                <th
                  className="py-3 px-4 w-32 text-center cursor-pointer hover:bg-slate-100 select-none transition-colors"
                  onClick={() => handleSort("rank")}
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    HẠNG <SortIcon col="rank" />
                  </span>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <span className="inline-flex items-center gap-1">
                    HỌ VÀ TÊN <SortIcon col="name" />
                  </span>
                </th>
                <th
                  className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 select-none transition-colors"
                  onClick={() => handleSort("empCode")}
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    MSNV <SortIcon col="empCode" />
                  </span>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <span className="inline-flex items-center gap-1">
                    CẢI TIẾN <SortIcon col="title" />
                  </span>
                </th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 select-none transition-colors"
                  onClick={() => handleSort("value")}
                >
                  <span className="inline-flex items-center justify-end gap-1 w-full">
                    GIÁ TRỊ <SortIcon col="value" />
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sortedRankedProposals.length > 0 ? (
                sortedRankedProposals.slice(0, 5).map(({ item, rank, prizeValueTr, badgeLabel, badgeStyle, isTied }) => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectProposal && onSelectProposal(item)}
                      className="hover:bg-amber-50/60 transition-colors cursor-pointer"
                    >
                      {/* Column 1: Hạng */}
                      <td className="py-3 px-4 text-center font-extrabold">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${badgeStyle}`}>
                          {badgeLabel} {isTied && rank !== 1 && <span className="text-[9px] font-bold text-amber-900 bg-amber-200 px-1 rounded">Đồng hạng</span>}
                        </span>
                      </td>

                      {/* Column 2: Họ và Tên */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 text-xs block leading-snug truncate max-w-[180px]" title={item.proposer_name || (item as any).proposerName || "Nhân viên"}>
                          {item.proposer_name || (item as any).proposerName || "Nhân viên"}
                        </span>
                        <span className="text-[11px] text-slate-400 block pt-0.5 truncate max-w-[180px]">
                          {item.department || item.region || "Tổ hợp Kiên Giang"}
                        </span>
                      </td>

                      {/* Column 3: MSNV */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-extrabold text-[11px] border border-slate-200">
                          {item.proposer_emp_code || (item as any).proposerEmpCode || item.code || "CBCNV"}
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
                      <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                        {formatMillion(prizeValueTr)}
                      </td>
                    </tr>
                  );
                })
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
          POPUP MODAL BẢNG XẾP HẠNG ĐỦ 38 SÁNG KIẾN KHEN THƯỞNG THI ĐUA
         ════════════════════════════════════════════════════════════════ */}
      {showTop11Modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-[#0b1739] via-[#0b1739] to-[#006838] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md">
                  <IconTrophy size={24} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    🏆 BẢNG XẾP HẠNG THI ĐUA KHEN THƯỞNG KAIZEN {selectedMonth !== "ALL" ? `(THÁNG ${selectedMonth.replace("T", "")})` : "(38 GIẢI)"}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    1 Hạng Nhất &bull; 2 Hạng Nhì &bull; 5 Hạng Ba &bull; 10 Hạng 4 &bull; 20 Hạng 5
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTop11Modal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs font-bold text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span>
                    <strong>Cơ cấu Giải Khen Thưởng:</strong> 1 Hạng Nhất (1,0 Tr), 2 Hạng Nhì (0,5 Tr), 5 Hạng Ba (0,3 Tr), 10 Hạng 4 (0,2 Tr), 20 Hạng 5 (0,1 Tr).
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-amber-300 shrink-0">
                  <IconCalendar size={14} className="text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-900 whitespace-nowrap">Lọc tháng:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-amber-100 text-amber-950 text-xs font-black px-2 py-0.5 rounded-lg border border-amber-400 outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả thời gian</option>
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>
                        Tháng {m.replace("T", "")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider">
                      <th
                        className="py-3.5 px-4 w-32 text-center cursor-pointer hover:bg-slate-800 select-none transition-colors"
                        onClick={() => handleSort("rank")}
                      >
                        <span className="inline-flex items-center justify-center gap-1">
                          HẠNG <SortIcon col="rank" />
                        </span>
                      </th>
                      <th
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-800 select-none transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <span className="inline-flex items-center gap-1">
                          NGƯỜI ĐỀ XUẤT <SortIcon col="name" />
                        </span>
                      </th>
                      <th
                        className="py-3.5 px-4 text-center cursor-pointer hover:bg-slate-800 select-none transition-colors"
                        onClick={() => handleSort("empCode")}
                      >
                        <span className="inline-flex items-center justify-center gap-1">
                          MSNV <SortIcon col="empCode" />
                        </span>
                      </th>
                      <th
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-800 select-none transition-colors"
                        onClick={() => handleSort("title")}
                      >
                        <span className="inline-flex items-center gap-1">
                          TÊN CẢI TIẾN <SortIcon col="title" />
                        </span>
                      </th>
                      <th
                        className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-800 select-none transition-colors"
                        onClick={() => handleSort("value")}
                      >
                        <span className="inline-flex items-center justify-end gap-1 w-full">
                          GIÁ TRỊ KHEN THƯỞNG <SortIcon col="value" />
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {sortedRankedProposals.length > 0 ? (
                      sortedRankedProposals.map(({ item, rank, badgeLabel, badgeStyle, prizeValueTr, isTied }) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setShowTop11Modal(false);
                            if (onSelectProposal) onSelectProposal(item);
                          }}
                          className="hover:bg-amber-50/70 transition-colors cursor-pointer"
                        >
                          {/* Rank Column with Badges */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shadow-2xs border ${badgeStyle}`}>
                              {badgeLabel} {isTied && rank !== 1 && <span className="text-[9px] text-amber-900 bg-amber-200/80 px-1 rounded font-bold">Đồng hạng</span>}
                            </span>
                          </td>

                          {/* Proposer Column */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {item.proposer_name || (item as any).proposerName || "Nhân viên"}
                            </span>
                            <span className="text-[11px] text-slate-500 block pt-0.5">
                              {item.department || item.region || "Tổ hợp Kiên Giang"}
                            </span>
                          </td>

                          {/* MSNV Column */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-extrabold text-[11px] border border-slate-200">
                              {item.proposer_emp_code || (item as any).proposerEmpCode || item.code || "CBCNV"}
                            </span>
                          </td>

                          {/* Proposal Title & Category */}
                          <td className="py-3.5 px-4 max-w-sm">
                            <span className="font-extrabold text-slate-900 block text-xs line-clamp-1" title={item.title}>
                              {item.title}
                            </span>
                            <span className="text-[11px] text-[#006838] font-bold block pt-0.5">
                              {item.category_label || item.category || "Cải tiến quy trình"}
                            </span>
                          </td>

                          {/* Award Value Column */}
                          <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                            {formatMillion(prizeValueTr)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 font-bold">
                          Chưa có dữ liệu sáng kiến được khen thưởng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold">
                Hiển thị {sortedRankedProposals.length} / 38 sáng kiến khen thưởng thi đua
                {sortCol !== "rank" && (
                  <button
                    onClick={() => { setSortCol("rank"); setSortDir("asc"); }}
                    className="ml-2 text-amber-600 hover:text-amber-700 underline cursor-pointer"
                  >
                    Đặt lại sắp xếp
                  </button>
                )}
              </span>
              <button
                type="button"
                onClick={() => setShowTop11Modal(false)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all cursor-pointer shadow-md"
              >
                ĐÓNG CỬA SỔ
              </button>
            </div>
          </div>
        </div>
      )}

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
