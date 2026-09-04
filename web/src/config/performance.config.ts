/**
 * Central Performance Optimization Toolkit Configuration
 * Next.js + Cloudflare Workers + Cloudinary
 */

export interface NetworkQualityProfileConfig {
  cloudinaryQuality: string;
  maxMarqueeItems: number;
  enableAnimations: boolean;
  enableBlurPlaceholder: boolean;
  preloadLCPCount: number;
  imageRootMargin: string;
}

export interface PerformanceConfig {
  cloudinaryCloudName: string;
  enableLazyLoad: boolean;
  enableAdaptiveQuality: boolean;
  enableReducedMotion: boolean;
  enableServiceWorker: boolean;
  debugParamKey: string;
  debugParamValue: string;
  debugStorageKey: string;
  fallbackTimeoutMs: number;
  breakpoints: number[];
  profiles: {
    low: NetworkQualityProfileConfig;
    medium: NetworkQualityProfileConfig;
    high: NetworkQualityProfileConfig;
  };
}

export const PERFORMANCE_CONFIG: PerformanceConfig = {
  cloudinaryCloudName: "dwl2xtbqa",
  enableLazyLoad: true,
  enableAdaptiveQuality: true,
  enableReducedMotion: true,
  enableServiceWorker: true,
  debugParamKey: "debug",
  debugParamValue: "perf",
  debugStorageKey: "debugPerf",
  fallbackTimeoutMs: 5000,
  breakpoints: [320, 480, 640, 768, 1024, 1280, 1920],
  profiles: {
    low: {
      cloudinaryQuality: "q_auto:eco,f_auto",
      maxMarqueeItems: 4,
      enableAnimations: false,
      enableBlurPlaceholder: false,
      preloadLCPCount: 1,
      imageRootMargin: "100px",
    },
    medium: {
      cloudinaryQuality: "q_auto:good,f_auto",
      maxMarqueeItems: 8,
      enableAnimations: true,
      enableBlurPlaceholder: true,
      preloadLCPCount: 2,
      imageRootMargin: "200px",
    },
    high: {
      cloudinaryQuality: "q_auto,f_auto",
      maxMarqueeItems: 16,
      enableAnimations: true,
      enableBlurPlaceholder: true,
      preloadLCPCount: 3,
      imageRootMargin: "300px",
    },
  },
};
