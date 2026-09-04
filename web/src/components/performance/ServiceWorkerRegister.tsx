"use client";

import { useEffect } from "react";
import { usePerformance } from "@/context/PerformanceContext";
import { PERFORMANCE_CONFIG } from "@/config/performance.config";

export function ServiceWorkerRegister() {
  const { setSwActive } = usePerformance();

  useEffect(() => {
    if (!PERFORMANCE_CONFIG.enableServiceWorker) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // /pph-scan là trang quét QR công khai, tự chủ động HUỶ ĐĂNG KÝ mọi Service Worker của domain
    // (xem PphScanClient.tsx) vì SW là nguồn gốc nhiều sự cố cache khó dò trên trang này — nếu
    // component này lại tự ĐĂNG KÝ LẠI ngay sau đó thì coi như huỷ công sức, nên bỏ qua hẳn ở đây.
    if (window.location.pathname.startsWith("/pph-scan")) return;

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
