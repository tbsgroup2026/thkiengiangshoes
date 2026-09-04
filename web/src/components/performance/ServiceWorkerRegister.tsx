"use client";

import { useEffect } from "react";
import { usePerformance } from "@/context/PerformanceContext";
import { PERFORMANCE_CONFIG } from "@/config/performance.config";

export function ServiceWorkerRegister() {
  const { setSwActive } = usePerformance();

  useEffect(() => {
    if (!PERFORMANCE_CONFIG.enableServiceWorker) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleRegister = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        // Force update registration to purge old active worker
        await registration.update().catch(() => {});
        if (registration.active || registration.installing || registration.waiting) {
          setSwActive(true);
        }
      } catch (err) {
        console.warn("[ServiceWorkerRegister] Registration failed:", err);
        setSwActive(false);
      }
    };

    if (document.readyState === "complete") {
      handleRegister();
    } else {
      window.addEventListener("load", handleRegister);
      return () => window.removeEventListener("load", handleRegister);
    }
  }, [setSwActive]);

  return null;
}
