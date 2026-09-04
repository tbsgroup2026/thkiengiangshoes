"use client";

import { useEffect } from "react";
import { observeWebVitals } from "@/lib/webVitals";

/**
 * WebVitalsReporter — Component kích hoạt đo lường hiệu năng tự động.
 * Đặt vào Root Layout để ghi nhận chỉ số LCP, CLS trên mọi trang.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    observeWebVitals((metric) => {
      // Có thể mở rộng gửi telemetry về Kaizen Analytics tại đây
      if (metric.rating === "poor" && process.env.NODE_ENV === "development") {
        console.warn(`[Performance Warning] Chỉ số ${metric.name} vượt ngưỡng khuyến nghị: ${metric.value}`);
      }
    });
  }, []);

  return null;
}
