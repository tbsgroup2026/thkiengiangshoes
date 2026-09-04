"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNetworkQuality, NetworkQualityDetails, NetworkProfile } from "@/hooks/useNetworkQuality";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PERFORMANCE_CONFIG } from "@/config/performance.config";

export interface PerformanceStats {
  lazyLoadedImagesCount: number;
  failedImagesCount: number;
  swActive: boolean;
}

export interface PerformanceContextValue {
  profile: NetworkProfile;
  details: NetworkQualityDetails;
  activeQuality: string; // e.g. 'q_auto:eco,f_auto'
  prefersReducedMotion: boolean;
  shouldAnimate: boolean;
  maxMarqueeItems: number;
  isDebugMode: boolean;
  stats: PerformanceStats;
  incrementLazyLoaded: () => void;
  incrementFailedImages: () => void;
  setSwActive: (active: boolean) => void;
  toggleDebugMode: () => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const details = useNetworkQuality();
  const prefersReducedMotion = useReducedMotion();

  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  const [stats, setStats] = useState<PerformanceStats>({
    lazyLoadedImagesCount: 0,
    failedImagesCount: 0,
    swActive: false,
  });

  // Check URL query param ?debug=perf or localStorage.debugPerf
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const paramMatch = urlParams.get(PERFORMANCE_CONFIG.debugParamKey) === PERFORMANCE_CONFIG.debugParamValue;
    const storageMatch = localStorage.getItem(PERFORMANCE_CONFIG.debugStorageKey) === "true";

    if (paramMatch || storageMatch) {
      setIsDebugMode(true);
    }
  }, []);

  const toggleDebugMode = useCallback(() => {
    setIsDebugMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(PERFORMANCE_CONFIG.debugStorageKey, next ? "true" : "false");
      }
      return next;
    });
  }, []);

  const incrementLazyLoaded = useCallback(() => {
    setStats((prev) => ({ ...prev, lazyLoadedImagesCount: prev.lazyLoadedImagesCount + 1 }));
  }, []);

  const incrementFailedImages = useCallback(() => {
    setStats((prev) => ({ ...prev, failedImagesCount: prev.failedImagesCount + 1 }));
  }, []);

  const setSwActive = useCallback((active: boolean) => {
    setStats((prev) => ({ ...prev, swActive: active }));
  }, []);

  const profileConfig = PERFORMANCE_CONFIG.profiles[details.profile];
  const activeQuality = profileConfig.cloudinaryQuality;
  const shouldAnimate = profileConfig.enableAnimations && !prefersReducedMotion;
  const maxMarqueeItems = profileConfig.maxMarqueeItems;

  const value: PerformanceContextValue = {
    profile: details.profile,
    details,
    activeQuality,
    prefersReducedMotion,
    shouldAnimate,
    maxMarqueeItems,
    isDebugMode,
    stats,
    incrementLazyLoaded,
    incrementFailedImages,
    setSwActive,
    toggleDebugMode,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance(): PerformanceContextValue {
  const context = useContext(PerformanceContext);
  if (!context) {
    // Fallback default context if used outside provider
    return {
      profile: "medium",
      details: { effectiveType: "unknown", saveData: false, profile: "medium", isFallbackMeasured: false },
      activeQuality: PERFORMANCE_CONFIG.profiles.medium.cloudinaryQuality,
      prefersReducedMotion: false,
      shouldAnimate: true,
      maxMarqueeItems: 8,
      isDebugMode: false,
      stats: { lazyLoadedImagesCount: 0, failedImagesCount: 0, swActive: false },
      incrementLazyLoaded: () => {},
      incrementFailedImages: () => {},
      setSwActive: () => {},
      toggleDebugMode: () => {},
    };
  }
  return context;
}
