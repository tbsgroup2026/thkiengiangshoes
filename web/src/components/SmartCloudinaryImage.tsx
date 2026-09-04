"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { IconPhotoOff, IconPhoto, IconRefresh } from "@tabler/icons-react";
import { useNetworkQuality } from "@/hooks/useNetworkQuality";
import {
  getCloudinaryUrl,
  getCloudinarySrcSet,
  getCloudinaryLQIP,
  preloadCloudinaryImage,
  getRawCloudinaryUrl,
} from "@/lib/cloudinary";
import { imageConcurrencyQueue } from "@/lib/imageConcurrencyQueue";

export interface SmartCloudinaryImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** Public ID Cloudinary hoặc URL đầy đủ */
  publicId?: string;
  /** URL ảnh gốc (fallback nếu không truyền publicId) */
  src?: string;
  /** ID sản phẩm / thực thể (dùng cho tương thích ngược 100%) */
  productId?: string | number;
  /** Thẻ mô tả alt bắt buộc để tối ưu SEO & Accessibility */
  alt: string;
  /** Chiều rộng mong muốn (pixel) */
  width?: number;
  /** Chiều cao mong muốn (pixel) */
  height?: number;
  /** Tỷ lệ khung hình cố định chống vỡ trang (ví dụ: "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Ưu tiên tải ngay (ảnh LCP above-the-fold) -> chèn <link rel="preload"> */
  priority?: boolean;
  /** Ghi đè preset chất lượng Cloudinary (ví dụ 'q_auto:eco', 'q_auto:best') */
  quality?: string;
  /** Kiểu cắt ảnh Cloudinary ('fill' | 'limit' | 'fit' | 'thumb' | 'scale') */
  crop?: "fill" | "limit" | "fit" | "thumb" | "scale" | string;
  /** Thuộc tính sizes cho responsive HTML srcset */
  sizes?: string;
  /** Kiểu hiển thị ảnh trong khung */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /** Class CSS cho container bên ngoài */
  containerClassName?: string;
  /** Tiêu đề báo lỗi khi tải thất bại */
  fallbackTitle?: string;
  /** Đường dẫn ảnh thay thế khi không tải được ảnh Cloudinary */
  fallbackSrc?: string;
  /** Cho phép bật/tắt hiệu ứng làm mờ LQIP */
  enableBlur?: boolean;
}

/**
 * SmartCloudinaryImage — Component tải ảnh thông minh tối ưu toàn diện:
 * 1. URL transformation tự động: f_auto, q_auto theo chất lượng mạng/thiết bị.
 * 2. Progressive loading: Hiển thị blur LQIP mượt mà, chống vỡ layout (CLS = 0).
 * 3. Lazy load qua IntersectionObserver & Preload ảnh LCP (priority=true).
 * 4. Tự động thử lại (Retry backoff) khi mạng chập chờn hoặc timeout.
 * 5. Tích hợp hàng đợi điều tiết tải ảnh song song cho thiết bị cấu hình yếu.
 */
export function SmartCloudinaryImage({
  publicId,
  src,
  productId,
  alt,
  width,
  height,
  aspectRatio,
  priority = false,
  quality,
  crop = "fill",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  objectFit = "cover",
  className = "",
  containerClassName = "",
  fallbackTitle,
  fallbackSrc = "/images/tbs-logo.png",
  enableBlur = true,
  style,
  onLoad,
  onError,
  ...restProps
}: SmartCloudinaryImageProps) {
  // Lấy thông tin chất lượng mạng & cấu hình phần cứng thiết bị
  const { cloudinaryQuality, profile, maxConcurrency, imageScaleFactor } = useNetworkQuality();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [retryCount, setRetryCount] = useState(0);
  const [isInView, setIsInView] = useState(priority);
  const [canLoadImage, setCanLoadImage] = useState(priority);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Xác định nguồn ảnh chính (publicId ưu tiên hơn src)
  const rawImageSrc = publicId || src || "";

  // Tính toán kích thước sau khi scaled theo mạng yếu
  const scaledWidth = width ? Math.round(width * imageScaleFactor) : undefined;
  const scaledHeight = height ? Math.round(height * imageScaleFactor) : undefined;

  // Chất lượng tự động kết hợp giữa prop truyền vào và chất lượng mạng đo được
  const activeQuality = quality || cloudinaryQuality;

  // 1. Tạo URL ảnh thông minh theo từng giai đoạn thử lại (Retry Strategy)
  const finalSrc = useMemo(() => {
    if (!rawImageSrc || rawImageSrc.trim().length === 0) {
      return fallbackSrc;
    }

    // Lần 0: URL Cloudinary tối ưu đầy đủ (f_auto, q_auto, w_, c_)
    if (retryCount === 0) {
      return getCloudinaryUrl(rawImageSrc, {
        width: scaledWidth,
        height: scaledHeight,
        quality: activeQuality,
        crop,
        format: "f_auto",
      });
    }
    // Lần 1: URL gốc không chứa bộ lọc transform (phòng trường hợp tài khoản chặn transform)
    if (retryCount === 1) {
      return getCloudinaryUrl(rawImageSrc, {
        quality: "q_auto:eco",
        format: "f_auto",
      });
    }
    // Lần >= 2: Dùng ảnh dự phòng cục bộ
    return fallbackSrc;
  }, [rawImageSrc, scaledWidth, scaledHeight, activeQuality, crop, retryCount, fallbackSrc]);

  // 2. Sinh biến thể srcset cho ảnh responsive (chỉ dùng khi ở trạng thái bình thường)
  const srcSet = useMemo(() => {
    if (retryCount > 0 || !rawImageSrc || (!rawImageSrc.includes("res.cloudinary.com") && !publicId)) {
      return undefined;
    }
    return getCloudinarySrcSet(rawImageSrc, { quality: activeQuality, crop });
  }, [rawImageSrc, publicId, activeQuality, crop, retryCount]);

  // 3. Sinh URL mờ mờ LQIP làm placeholder nền
  const blurUrl = useMemo(() => {
    if (!enableBlur || profile === "low" || retryCount > 0 || !rawImageSrc) {
      return "";
    }
    return getCloudinaryLQIP(rawImageSrc);
  }, [rawImageSrc, enableBlur, profile, retryCount]);

  // 4. Tự động Preload ảnh LCP (priority = true)
  useEffect(() => {
    if (priority && finalSrc) {
      preloadCloudinaryImage(finalSrc, srcSet, sizes);
    }
  }, [priority, finalSrc, srcSet, sizes]);

  // 5. Observer Lazy Load cho ảnh nằm dưới fold (priority = false)
  useEffect(() => {
    if (priority || isInView) {
      setIsInView(true);
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: profile === "low" ? "100px" : "300px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView, profile]);

  // 6. Điểm nghẽn điều tiết số ảnh tải đồng thời trên máy yếu qua Concurrency Queue
  useEffect(() => {
    if (!isInView) return;

    if (priority || profile === "high") {
      setCanLoadImage(true);
      return;
    }

    let isCancelled = false;
    imageConcurrencyQueue
      .enqueue(async () => {
        if (!isCancelled) {
          setCanLoadImage(true);
        }
      }, maxConcurrency)
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [isInView, priority, profile, maxConcurrency]);

  // 7. Xử lý timeout và cơ chế thử lại tự động (Exponential Backoff Retry)
  useEffect(() => {
    if (!canLoadImage || !finalSrc) return;

    setStatus("loading");

    const timeoutDuration = retryCount === 0 ? 6000 : 4000;
    timeoutRef.current = setTimeout(() => {
      setStatus((prev) => {
        if (prev === "loading") {
          if (retryCount < 2) {
            setRetryCount((rc) => rc + 1);
          } else {
            setStatus("error");
          }
        }
        return prev;
      });
    }, timeoutDuration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [canLoadImage, finalSrc, retryCount]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("success");
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (retryCount < 2) {
      const backoffDelay = (retryCount + 1) * 1000;
      setTimeout(() => {
        setRetryCount((rc) => rc + 1);
        setStatus("loading");
      }, backoffDelay);
    } else {
      setStatus("error");
      if (onError) onError(e);
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setStatus("loading");
  };

  const containerStyle: React.CSSProperties = {
    aspectRatio: aspectRatio || (width && height ? `${width} / ${height}` : undefined),
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${containerClassName}`}
      style={containerStyle}
    >
      {/* 1. Nền mờ LQIP Placeholder */}
      {blurUrl && status !== "error" && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 transition-opacity duration-700 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${blurUrl})`,
            opacity: status === "success" ? 0 : 0.9,
          }}
        />
      )}

      {/* 2. Skeleton Loading */}
      {status === "loading" && !blurUrl && (
        <div className="absolute inset-0 bg-slate-200/80 dark:bg-slate-700/80 animate-pulse flex items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            <IconPhoto className="w-5 h-5 animate-pulse text-slate-400" />
            <span className="text-[10px] font-bold tracking-wide uppercase">
              {retryCount > 0 ? `Đang thử lại (${retryCount}/2)...` : "Đang tải ảnh..."}
            </span>
          </div>
        </div>
      )}

      {/* 3. Giao diện báo lỗi & nút Thử Lại */}
      {status === "error" ? (
        <div className="w-full h-full min-h-[60px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex flex-col items-center justify-center text-center z-20">
          <IconPhotoOff className="w-5 h-5 text-slate-400 mb-1" />
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-full px-1">
            {fallbackTitle || alt || "Không thể tải ảnh"}
          </span>
          <button
            type="button"
            onClick={handleManualRetry}
            className="mt-1 text-[10px] font-bold text-[#006838] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <IconRefresh size={12} />
            <span>Thử lại</span>
          </button>
        </div>
      ) : canLoadImage ? (
        /* 4. Thẻ <img> HTML chuẩn */
        <img
          key={`${finalSrc}_${retryCount}`}
          src={finalSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          // @ts-ignore fetchpriority khả dụng trên Chrome/Edge
          fetchpriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${
            objectFit === "contain" ? "object-contain" : "object-cover"
          } w-full h-full transition-opacity duration-500 ease-out z-10 ${
            status === "success" ? "opacity-100" : "opacity-0"
          }`}
          {...restProps}
        />
      ) : null}
    </div>
  );
}
