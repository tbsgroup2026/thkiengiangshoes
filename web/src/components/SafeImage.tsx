"use client";

import React, { useState, useEffect } from "react";
import { formatCloudinaryUrl } from "@/lib/cloudinary";
import { IconPhoto, IconPhotoOff, IconRefresh } from "@tabler/icons-react";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  productId?: string | number;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  containerClassName?: string;
  cloudinaryWidth?: number;
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
  cloudinaryWidth,
  ...restProps
}: SafeImageProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);

  const formattedUrl = React.useMemo(
    () => formatCloudinaryUrl(src, undefined, cloudinaryWidth),
    [src, cloudinaryWidth]
  );

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
