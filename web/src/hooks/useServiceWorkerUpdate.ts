"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useServiceWorkerUpdate
 *
 * FIX: Thay thế pattern cũ (controllerchange → location.reload tự động).
 *
 * Behavior:
 *  - Lắng nghe `updatefound` + `statechange` trên SW registration
 *  - Khi phát hiện SW mới đang "waiting" → set updateAvailable = true
 *  - KHÔNG tự reload — để user quyết định qua banner
 *  - applyUpdate(): postMessage SKIP_WAITING → lắng nghe controllerchange
 *    một lần → reload với sessionStorage guard để tránh vòng lặp tuyệt đối
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Guard: nếu vừa reload do update, xóa flag và không làm gì thêm
    if (sessionStorage.getItem("sw-update-reload") === "1") {
      sessionStorage.removeItem("sw-update-reload");
      return;
    }

    const checkForWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        // SW mới đang chờ — hiện banner cho user
        setUpdateAvailable(true);
        registrationRef.current = reg;
      }
    };

    const onUpdateFound = (reg: ServiceWorkerRegistration) => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && reg.waiting) {
          // SW mới đã installed và đang chờ activate
          setUpdateAvailable(true);
          registrationRef.current = reg;
        }
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      // Kiểm tra ngay nếu đã có waiting worker (ví dụ từ lần trước chưa apply)
      checkForWaiting(reg);

      // Lắng nghe update mới trong tương lai
      reg.addEventListener("updatefound", () => onUpdateFound(reg));

      // Trigger update check để phát hiện bản SW mới ngay
      reg.update().catch(() => {});
    });

    // Không cần cleanup vì effect chỉ chạy 1 lần
  }, []);

  const applyUpdate = useCallback(() => {
    const reg = registrationRef.current;
    if (!reg?.waiting) return;

    setIsApplying(true);

    // Bước 1: Lắng nghe controllerchange — chỉ một lần, không tạo vòng lặp
    const handleControllerChange = () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      // Bước 3: Đánh dấu đây là reload do update (guard chống loop)
      sessionStorage.setItem("sw-update-reload", "1");
      // Bước 4: Reload một lần duy nhất
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // Bước 2: Yêu cầu SW mới bỏ qua trạng thái waiting
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return { updateAvailable, isApplying, applyUpdate, dismissUpdate };
}
