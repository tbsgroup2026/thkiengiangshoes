"use client";

import React from "react";
import { usePerformance } from "@/context/PerformanceContext";

export interface AdaptiveAnimationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  forceDisableOnLow?: boolean;
}

/**
 * AdaptiveAnimation wrapper that automatically pauses or disables heavy animations
 * on low-tier hardware, poor network connections, or when prefers-reduced-motion is active.
 */
export function AdaptiveAnimation({
  children,
  fallback,
  className = "",
  forceDisableOnLow = true,
}: AdaptiveAnimationProps) {
  const { shouldAnimate, profile } = usePerformance();

  const isLowProfile = profile === "low";
  const isDisabled = forceDisableOnLow && (isLowProfile || !shouldAnimate);

  if (isDisabled) {
    return fallback ? <>{fallback}</> : <div className={`${className} animate-none transition-none`}>{children}</div>;
  }

  return <div className={className}>{children}</div>;
}
