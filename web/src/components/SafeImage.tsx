"use client";

import React, { useState, useEffect } from "react";
import { IconPhotoOff, IconPhoto, IconShoe, IconRefresh } from "@tabler/icons-react";
import { formatCloudinaryUrl } from "@/lib/cloudinary";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  productId?: string | number;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  containerClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  className = "",
  productId,
  fallbackTitle,
  fallbackSubtitle = "Ảnh chưa tải được",
  objectFit = "contain",
  containerClassName = "",
  style,
  ...restProps
}: SafeImageProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);

  // Format URL with Cloudinary cache-busting version parameter — memoized theo `src` (KHÔNG phải
  // useEffect nữa). formatCloudinaryUrl() gắn `?v=Date.now()`, nhưng ảnh Cloudinary thật lại đánh
  // version qua segment đường dẫn "/v1787832565/..." chứ không phải query "?v=" nên hàm không bao
  // giờ nhận ra URL đã có version, và trước đây cứ mỗi lần component re-render (CMS poll 60s,
  // window focus...) lại tính ra 1 URL "?v=" MỚI dù `src` không đổi — key của <img> bên dưới đổi
  // theo, React unmount/mount lại ảnh, tạo hiệu ứng ảnh chớp tắt ẩn/hiện liên tục. Memo hoá theo
  // `src` đảm bảo URL (và key) chỉ đổi khi ảnh thật sự đổi.
  const formattedUrl = React.useMemo(() => formatCloudinaryUrl(src), [src]);

  // Reset loading state whenever src or productId changes (prevents React DOM recycling race conditions)
  useEffect(() => {
    setStatus("loading");
    setRetryCount(0);
  }, [src, productId]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setStatus("success");
    if (restProps.onLoad) restProps.onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryCount < 2) {
      // Auto-retry up to 2 times with cache buster query
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      setStatus("loading");
    } else {
      setStatus("error");
      if (restProps.onError) restProps.onError(e);
    }
  };

  const currentSrc = retryCount > 0 ? `${formattedUrl}${formattedUrl.includes("?") ? "&" : "?"}retry=${retryCount}` : formattedUrl;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${containerClassName}`}>
      {/* Loading Skeleton */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center z-10 rounded-inherit">
          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            <IconPhoto className="w-5 h-5 animate-bounce text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {retryCount > 0 ? `Đang tải lại... (#${retryCount})` : "Đang tải ảnh..."}
            </span>
          </div>
        </div>
      )}

      {/* Error Fallback Badge (NEVER displays wrong product images) */}
      {status === "error" ? (
        <div className="w-full h-full min-h-[70px] bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1 z-10">
          <div className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center">
            <IconPhotoOff size={16} />
          </div>
          <span className="text-[11px] font-extrabold text-slate-700 truncate max-w-full px-1">
            {fallbackTitle || alt || "Sản phẩm"}
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
            {fallbackSubtitle}
          </span>
          <button
            type="button"
            onClick={() => {
              setRetryCount(0);
              setStatus("loading");
            }}
            className="mt-1 text-[10px] font-extrabold text-[#006838] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <IconRefresh size={10} />
            <span>Thử lại</span>
          </button>
        </div>
      ) : (
        /* Real Image Element with strict key binding */
        <img
          key={`${currentSrc}_${productId || ""}`}
          src={currentSrc}
          alt={alt || "Product Image"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`${className} ${objectFit === "contain" ? "object-contain" : "object-cover"} transition-opacity duration-200 ${
            status === "success" ? "opacity-100" : "opacity-0"
          }`}
          style={style}
          {...restProps}
        />
      )}
    </div>
  );
}
