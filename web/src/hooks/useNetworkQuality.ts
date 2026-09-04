"use client";

import { useState, useEffect, useCallback } from "react";

export type NetworkProfile = "low" | "medium" | "high";

export interface NetworkQualityDetails {
  effectiveType: string; // 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
  saveData: boolean;
  downlink?: number; // Mbps
  rtt?: number; // ms
  hardwareConcurrency?: number; // CPU cores
  deviceMemory?: number; // RAM in GB
  profile: NetworkProfile;
  isFallbackMeasured: boolean;
  measuredLatencyMs?: number;
}

export function useNetworkQuality(): NetworkQualityDetails {
  const [details, setDetails] = useState<NetworkQualityDetails>({
    effectiveType: "unknown",
    saveData: false,
    profile: "medium",
    isFallbackMeasured: false,
  });

  const calculateProfile = useCallback(
    (
      effType: string,
      saveData: boolean,
      cores?: number,
      ram?: number,
      rtt?: number,
      downlink?: number,
      latency?: number
    ): NetworkProfile => {
      // 1. Data Saver mode is ON -> Force low
      if (saveData) return "low";

      // 2. Slow connections (2G or slow 3G) -> Force low
      if (effType === "slow-2g" || effType === "2g") return "low";

      // 3. High latency (> 500ms) or low downlink (< 1.5 Mbps) -> Low
      if ((rtt && rtt > 500) || (downlink && downlink < 1.5) || (latency && latency > 600)) {
        return "low";
      }

      // 4. Low hardware specs (<= 2 cores OR <= 2GB RAM) -> Max medium or low
      const isWeakHardware = (cores && cores <= 2) || (ram && ram <= 2);
      if (isWeakHardware) {
        return "low";
      }

      // 5. Medium connections (3G) -> Medium
      if (effType === "3g" || (rtt && rtt > 200) || (downlink && downlink < 4) || (latency && latency > 250)) {
        return "medium";
      }

      // 6. Otherwise 4G / High specs -> High
      return "high";
    },
    []
  );

  const measureFallbackLatency = useCallback(async (): Promise<number> => {
    try {
      const start = performance.now();
      // Fetch small favicon/logo asset or HEAD request to measure latency
      await fetch("/favicon.ico", { method: "HEAD", cache: "no-store" });
      const duration = performance.now() - start;
      return duration;
    } catch {
      return 350; // Fallback estimate
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    const cores = nav.hardwareConcurrency || 4;
    const ram = nav.deviceMemory || 4;

    const updateFromConnection = (measuredLatency?: number) => {
      const effType = conn?.effectiveType || "unknown";
      const saveData = !!conn?.saveData;
      const downlink = conn?.downlink;
      const rtt = conn?.rtt;

      let computedProfile: NetworkProfile;

      if (conn) {
        computedProfile = calculateProfile(effType, saveData, cores, ram, rtt, downlink, measuredLatency);
      } else {
        // Fallback for browsers like Safari that lack Network Information API
        const estLatency = measuredLatency || 150;
        computedProfile = calculateProfile("3g", false, cores, ram, undefined, undefined, estLatency);
      }

      setDetails({
        effectiveType: effType,
        saveData,
        downlink,
        rtt,
        hardwareConcurrency: cores,
        deviceMemory: ram,
        profile: computedProfile,
        isFallbackMeasured: !conn,
        measuredLatencyMs: measuredLatency,
      });
    };

    updateFromConnection();

    // Listen to network status changes if API available
    if (conn) {
      const handleChange = () => updateFromConnection();
      conn.addEventListener("change", handleChange);
      return () => conn.removeEventListener("change", handleChange);
    } else {
      // Run micro-benchmark once for Safari
      let isMounted = true;
      measureFallbackLatency().then((latency) => {
        if (isMounted) updateFromConnection(latency);
      });
      return () => {
        isMounted = false;
      };
    }
  }, [calculateProfile, measureFallbackLatency]);

  return details;
}
