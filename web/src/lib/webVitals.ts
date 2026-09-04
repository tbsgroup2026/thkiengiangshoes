/**
 * Web Vitals Performance Monitor — Module đo lường chỉ số Core Web Vitals
 * 
 * Các chỉ số đo lường chính:
 * 1. LCP (Largest Contentful Paint): Thời gian hiển thị phần tử nội dung lớn nhất (mục tiêu: <= 2.5s)
 * 2. CLS (Cumulative Layout Shift): Tổng điểm dịch chuyển giao diện ngẫu nhiên (mục tiêu: <= 0.1)
 * 3. FID / INP (Interaction to Next Paint): Độ trễ phản hồi tương tác người dùng (mục tiêu: <= 200ms)
 * 4. FCP (First Contentful Paint): Thời gian xuất hiện phần tử đầu tiên (mục tiêu: <= 1.8s)
 * 5. TTFB (Time to First Byte): Thời gian phản hồi byte đầu tiên từ server (mục tiêu: <= 800ms)
 * 
 * Hướng dẫn kiểm thử với Chrome DevTools:
 * 1. Mở Chrome DevTools (F12) -> Thẻ Performance hoặc Network.
 * 2. Trong Network, chọn Throttle: "Slow 3G" hoặc "Fast 3G".
 * 3. Reload trang và kiểm tra console log về thông số LCP/CLS thu được.
 */

export interface MetricResult {
  name: "LCP" | "CLS" | "FID" | "INP" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

export type ReportCallback = (metric: MetricResult) => void;

/**
 * Khởi tạo observer theo dõi Core Web Vitals thông qua trình duyệt PerformanceObserver API
 */
export function observeWebVitals(onReport?: ReportCallback): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // 1. Đo LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      if (lastEntry) {
        const value = Math.round(lastEntry.startTime);
        const rating = value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
        const metric: MetricResult = {
          name: "LCP",
          value,
          rating,
          delta: value,
          id: `lcp-${Date.now()}`,
        };

        if (process.env.NODE_ENV === "development") {
          console.info(`[Web Vitals] 🖼️ LCP: ${value}ms (${rating})`, lastEntry.element);
        }
        if (onReport) onReport(metric);
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  // 2. Đo CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      const rounded = Number(clsValue.toFixed(4));
      const rating = rounded <= 0.1 ? "good" : rounded <= 0.25 ? "needs-improvement" : "poor";
      const metric: MetricResult = {
        name: "CLS",
        value: rounded,
        rating,
        delta: rounded,
        id: `cls-${Date.now()}`,
      };

      if (process.env.NODE_ENV === "development") {
        console.info(`[Web Vitals] 📐 CLS: ${rounded} (${rating})`);
      }
      if (onReport) onReport(metric);
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {}

  // 3. Đo TTFB & FCP
  try {
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          const value = Math.round(entry.startTime);
          const rating = value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
          const metric: MetricResult = {
            name: "FCP",
            value,
            rating,
            delta: value,
            id: `fcp-${Date.now()}`,
          };
          if (process.env.NODE_ENV === "development") {
            console.info(`[Web Vitals] ⚡ FCP: ${value}ms (${rating})`);
          }
          if (onReport) onReport(metric);
        }
      }
    });
    paintObserver.observe({ type: "paint", buffered: true });
  } catch {}
}
