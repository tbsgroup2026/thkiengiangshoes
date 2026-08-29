"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface StatusCountsData {
  thi_dua: number;
  cho_phe_duyet: number;
  cho_danh_gia: number;
  da_danh_gia: number;
  luu_tru: number;
  regions: Record<string, number>;
  category_counts: Record<string, number>;
}

interface StatusCountsContextType {
  counts: StatusCountsData | null;
  loading: boolean;
  refetchStatusCounts: () => Promise<void>;
}

const CACHE_KEY = "tbs_status_counts_v2";

const StatusCountsContext = createContext<StatusCountsContextType>({
  counts: null,
  loading: true,
  refetchStatusCounts: async () => {},
});

export const StatusCountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous read from localStorage to avoid initial false 0 flicker
  const [counts, setCounts] = useState<StatusCountsData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object") {
            return {
              thi_dua: Number(parsed.thi_dua || 0),
              cho_phe_duyet: Number(parsed.cho_phe_duyet || 0),
              cho_danh_gia: Number(parsed.cho_danh_gia || 0),
              da_danh_gia: Number(parsed.da_danh_gia || 0),
              luu_tru: Number(parsed.luu_tru || 0),
              regions: parsed.regions || {},
              category_counts: parsed.category_counts || {},
            };
          }
        }
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(counts === null);

  const fetchStatusCounts = useCallback(async () => {
    try {
      if (counts === null) setLoading(true);
      const res = await fetch("/api/ci-kaizen/status-counts");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.counts) {
          const newCounts: StatusCountsData = {
            thi_dua: Number(json.counts.thi_dua || 0),
            cho_phe_duyet: Number(json.counts.cho_phe_duyet || 0),
            cho_danh_gia: Number(json.counts.cho_danh_gia || 0),
            da_danh_gia: Number(json.counts.da_danh_gia || 0),
            luu_tru: Number(json.counts.luu_tru || 0),
            regions: json.regions || {},
            category_counts: json.category_counts || {},
          };
          setCounts(newCounts);
          if (typeof window !== "undefined") {
            localStorage.setItem(CACHE_KEY, JSON.stringify(newCounts));
          }
        }
      }
    } catch (err) {
      console.warn("[StatusCountsProvider] Error fetching counts:", err);
    } finally {
      setLoading(false);
    }
  }, [counts]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  return (
    <StatusCountsContext.Provider
      value={{
        counts,
        loading,
        refetchStatusCounts: fetchStatusCounts,
      }}
    >
      {children}
    </StatusCountsContext.Provider>
  );
};

export const useStatusCounts = () => useContext(StatusCountsContext);
