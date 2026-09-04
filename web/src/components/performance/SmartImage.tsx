"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { IconPhotoOff, IconPhoto, IconRefresh } from "@tabler/icons-react";
import { usePerformance } from "@/context/PerformanceContext";
import {
  buildCloudinaryUrl,
  getRawCloudinaryUrl,
  getCloudinaryBlurUrl,
  generateSrcSet,
} from "@/lib/cloudinaryLoader";
import { PERFORMANCE_CONFIG } from "@/config/performance.config";

export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  productId?: string | number;
  priority?: boolean; // Above-the-fold / LCP image
  quality?: string; // Custom override
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  containerClassName?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  aspectRatio?: string;
  enableBlur?: boolean;
  fallbackSrc?: string; // e.g. '/images/tbs-logo.png'
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  productId,
  priority = false,
  quality,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  objectFit = "cover",
  className = "",
  containerClassName = "",
  fallbackTitle,
  fallbackSubtitle = "Không thể tải ảnh",
  aspectRatio,
  enableBlur = true,
  fallbackSrc,
  style,
  onLoad,
  onError,
  ...restProps
}: SmartImageProps) {
  const { activeQuality, incrementLazyLoaded, incrementFailedImages, profile } = usePerformance();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [retryCount, setRetryCount] = useState(0);
  const [isInView, setIsInView] = useState(priority);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSmallImage = (width && width <= 300) || (height && height <= 300) || containerClassName.includes("w-6") || containerClassName.includes("w-8") || containerClassName.includes("w-9") || containerClassName.includes("w-12");

  const activeQualityProfile = quality || activeQuality;

  // 1. Progressive Auto-Fix Src Resolution:
  // Retry 0: Transformed URL (f_auto, q_auto, w_...)
  // Retry 1: Raw original unmodified Cloudinary URL (100% works even if strict transforms are enabled)
  // Retry 2: Fallback image (e.g. /images/tbs-logo.png)
  const currentSrc = useMemo(() => {
    if (!src || typeof src !== "string" || src.trim().length === 0 || src === "undefined" || src === "null") {
      return fallbackSrc || "/images/tbs-logo.png";
    }

    const trimmed = src.trim();

    if (retryCount === 0) {
      return buildCloudinaryUrl({ src: trimmed, width, quality: activeQualityProfile });
    } else if (retryCount === 1) {
      return getRawCloudinaryUrl(trimmed);
    } else {
      return fallbackSrc || "/images/tbs-logo.png";
    }
  }, [src, width, activeQualityProfile, retryCount, fallbackSrc]);

  const srcSet = useMemo(() => {
    // Only use srcset for large images on retry 0
    if (isSmallImage || retryCount > 0 || !src || !src.includes("res.cloudinary.com")) return undefined;
    return generateSrcSet(src, activeQualityProfile);
  }, [src, activeQualityProfile, retryCount, isSmallImage]);

  const blurUrl = useMemo(() => {
    if (isSmallImage || !src || !enableBlur || profile === "low" || retryCount > 0) return "";
    return getCloudinaryBlurUrl(src);
  }, [src, enableBlur, profile, retryCount, isSmallImage]);

  // 2. IntersectionObserver Lazy Loading
  useEffect(() => {
    if (priority || isInView) {
      setIsInView(true);
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const rootMargin = PERFORMANCE_CONFIG.profiles[profile].imageRootMargin;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            incrementLazyLoaded();
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView, profile, incrementLazyLoaded]);

  // Reset loading status when src changes
  useEffect(() => {
    if (!isInView || !src) return;

    setStatus("loading");

    // 5s Timeout fallback
    timeoutRef.current = setTimeout(() => {
      setStatus((prev) => {
        if (prev === "loading") {
          incrementFailedImages();
          setRetryCount((rc) => {
            const nextRc = rc < 2 ? rc + 1 : rc;
            if (nextRc >= 2) {
              setStatus("error");
            }
            return nextRc;
          });
        }
        return prev;
      });
    }, PERFORMANCE_CONFIG.fallbackTimeoutMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isInView, src, incrementFailedImages]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("success");
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (retryCount < 2) {
      setRetryCount((prev) => prev + 1);
      setStatus("loading");
    } else {
      setStatus("error");
      incrementFailedImages();
      if (onError) onError(e);
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setStatus("loading");
  };

  const containerStyle: React.CSSProperties = {
    aspectRatio: aspectRatio || (width && height ? `${width} / ${height}` : undefined),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex items-center justify-center ${containerClassName}`}
      style={containerStyle}
    >
      {/* LQIP Blur Background */}
      {blurUrl && status !== "error" && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-lg scale-105 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `url(${blurUrl})`,
            opacity: status === "success" ? 0 : 0.8,
          }}
        />
      )}

      {/* Loading Skeleton — ONLY for large images */}
      {status === "loading" && !blurUrl && !isSmallImage && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <IconPhoto className="w-5 h-5 animate-bounce text-slate-300" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              {retryCount > 0 ? `Auto Fix (#${retryCount})` : "Đang tải..."}
            </span>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {status === "error" ? (
        <div className="w-full h-full min-h-[50px] bg-slate-50 border border-slate-200/90 rounded-xl p-1.5 flex flex-col items-center justify-center text-center space-y-1 z-10">
          <div className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center">
            <IconPhotoOff size={12} />
          </div>
          {!isSmallImage && (
            <span className="text-[10px] font-extrabold text-slate-700 truncate max-w-full px-1">
              {fallbackTitle || alt || "Tài nguyên"}
            </span>
          )}
          <button
            type="button"
            onClick={handleManualRetry}
            className="mt-0.5 text-[9px] font-extrabold text-[#006838] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <IconRefresh size={10} />
            <span>Thử lại</span>
          </button>
        </div>
      ) : isInView ? (
        /* Real Image Element — Always visible opacity-100 */
        <img
          key={`${currentSrc}_${retryCount}`}
          src={currentSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt || "Image"}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`${className} ${
            objectFit === "contain" ? "object-contain" : "object-cover"
          } transition-opacity duration-200 opacity-100`}
          {...restProps}
        />
      ) : null}
    </div>
  );
}
