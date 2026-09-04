"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Throttles a callback function using requestAnimationFrame or timer.
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number = 100
): T {
  const lastCallRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delayMs) {
        lastCallRef.current = now;
        callback(...args);
      } else if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          lastCallRef.current = Date.now();
          rafIdRef.current = null;
          callback(...args);
        });
      }
    },
    [callback, delayMs]
  ) as T;

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return throttledFn;
}

/**
 * Debounces a callback function.
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number = 250
): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delayMs);
    },
    [callback, delayMs]
  ) as T;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

/**
 * Optimized Window Scroll listener with RAF throttling.
 */
export function useOptimizedScrollListener(
  onScroll: (e: Event) => void,
  options: AddEventListenerOptions = { passive: true }
) {
  const throttledOnScroll = useThrottle(onScroll, 50);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("scroll", throttledOnScroll, options);
    return () => window.removeEventListener("scroll", throttledOnScroll);
  }, [throttledOnScroll, options]);
}

/**
 * Optimized Window Resize listener with debounce.
 */
export function useOptimizedResizeListener(
  onResize: () => void,
  delayMs: number = 200
) {
  const debouncedOnResize = useDebounce(onResize, delayMs);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("resize", debouncedOnResize, { passive: true });
    return () => window.removeEventListener("resize", debouncedOnResize);
  }, [debouncedOnResize]);
}
