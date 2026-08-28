"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface BadgeStats {
  thiDua: number;
  choReview: number;
  choDanhGia: number;
  daDanhGia: number;
  luuTru: number;
  regions: Record<string, number>;
}

interface KaizenStatsContextType {
  stats: BadgeStats;
  isLoading: boolean;
  refetchStats: () => Promise<void>;
  updateStatsFromProposals: (proposals: any[]) => void;
}

const DEFAULT_STATS: BadgeStats = {
  thiDua: 0,
  choReview: 0,
  choDanhGia: 0,
  daDanhGia: 0,
  luuTru: 0,
  regions: {},
};

const KaizenStatsContext = createContext<KaizenStatsContextType>({
  stats: DEFAULT_STATS,
  isLoading: false,
  refetchStats: async () => {},
  updateStatsFromProposals: () => {},
});

const CACHE_KEY = "tbs_kaizen_global_stats_v3";

export const KaizenStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous read from localStorage to eliminate 0 flicker on initial load
  const [stats, setStats] = useState<BadgeStats>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object") {
            return {
              thiDua: Number(parsed.thiDua || 0),
              choReview: Number(parsed.choReview || 0),
              choDanhGia: Number(parsed.choDanhGia || 0),
              daDanhGia: Number(parsed.daDanhGia || 0),
              luuTru: Number(parsed.luuTru || 0),
              regions: parsed.regions || {},
            };
          }
        }
      } catch (e) {}
    }
    return DEFAULT_STATS;
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchStatsFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ci-kaizen/stats");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) {
          const newStats: BadgeStats = {
            thiDua: Number(json.stats.thiDua || 0),
            choReview: Number(json.stats.choReview || 0),
            choDanhGia: Number(json.stats.choDanhGia || 0),
            daDanhGia: Number(json.stats.daDanhGia || 0),
            luuTru: Number(json.stats.luuTru || 0),
            regions: json.stats.regions || {},
          };
          setStats(newStats);
          if (typeof window !== "undefined") {
            localStorage.setItem(CACHE_KEY, JSON.stringify(newStats));
          }
        }
      }
    } catch (err) {
      console.warn("[Global KaizenStats] Error fetching stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update global stats synchronously when any proposal list is fetched or loaded
  const updateStatsFromProposals = useCallback((proposals: any[]) => {
    if (!Array.isArray(proposals) || proposals.length === 0) return;

    let thiDua = 0;
    let choReview = 0;
    let choDanhGia = 0;
    let daDanhGia = 0;
    let luuTru = 0;
    const regionMap: Record<string, number> = {};

    for (const p of proposals) {
      const appStatus = String(p.approval_status || "").toUpperCase();
      const subStatus = String(p.sub_status || "").toUpperCase();
      const mainStatus = String(p.status || "").toUpperCase();
      const regType = String(p.registration_type || "").toUpperCase();

      if (p.region) {
        regionMap[p.region] = (regionMap[p.region] || 0) + 1;
      }

      // 1. Thi đua
      if (
        Number(p.is_thi_dua) === 1 ||
        regType === "THI_DUA" ||
        subStatus === "CHO_DANH_GIA" ||
        subStatus === "DA_DANH_GIA" ||
        appStatus === "PHE_DUYET"
      ) {
        thiDua++;
      }

      // 2. Chờ phê duyệt
      const isNotChoReview =
        appStatus === "PHE_DUYET" ||
        appStatus === "TU_CHOI" ||
        subStatus === "CHO_DANH_GIA" ||
        subStatus === "DA_DANH_GIA" ||
        subStatus === "LUU_TRU" ||
        mainStatus === "APPROVED" ||
        mainStatus === "REJECTED" ||
        mainStatus === "ARCHIVED";
      if (!isNotChoReview) {
        choReview++;
      }

      // 3. Chờ đánh giá
      const isChoDanhGia =
        subStatus === "CHO_DANH_GIA" ||
        appStatus === "PHE_DUYET" ||
        mainStatus === "APPROVED" ||
        mainStatus === "IMPLEMENTED" ||
        regType === "CHO_DANH_GIA";
      const isExcludedFromChoDanhGia =
        subStatus === "DA_DANH_GIA" ||
        subStatus === "LUU_TRU" ||
        appStatus === "DA_DANH_GIA" ||
        appStatus === "TU_CHOI";
      if (isChoDanhGia && !isExcludedFromChoDanhGia) {
        choDanhGia++;
      }

      // 4. Đã đánh giá
      if (
        subStatus === "DA_DANH_GIA" ||
        appStatus === "DA_DANH_GIA" ||
        Number(p.average_score || p.score || 0) > 0 ||
        Boolean(p.award_title)
      ) {
        daDanhGia++;
      }

      // 5. Lưu trữ
      if (subStatus === "LUU_TRU" || regType === "LUU_TRU" || mainStatus === "ARCHIVED") {
        luuTru++;
      }
    }

    const computedStats: BadgeStats = {
      thiDua,
      choReview,
      choDanhGia,
      daDanhGia,
      luuTru,
      regions: regionMap,
    };

    setStats(computedStats);
    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(computedStats));
    }
  }, []);

  useEffect(() => {
    fetchStatsFromServer();
  }, [fetchStatsFromServer]);

  return (
    <KaizenStatsContext.Provider
      value={{
        stats,
        isLoading,
        refetchStats: fetchStatsFromServer,
        updateStatsFromProposals,
      }}
    >
      {children}
    </KaizenStatsContext.Provider>
  );
};

export const useKaizenStats = () => useContext(KaizenStatsContext);
