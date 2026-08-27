"use client";

import React, { useState, useEffect } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "custom";
  className?: string;
  style?: React.CSSProperties;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  showOnlineBadge?: boolean;
}

export default function UserAvatar({
  src,
  name = "User",
  size = "md",
  className = "",
  style = {},
  zoom = 1.0,
  offsetX = 0,
  offsetY = 0,
  showOnlineBadge = false,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const sizeClasses: Record<string, string> = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-14 h-14 text-base",
    "2xl": "w-24 h-24 text-2xl",
    custom: "",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // Luôn luôn hiển thị ảnh Avatar (không bao giờ hiển thị chữ viết tắt HA / LA)
  const hasValidSrc =
    !imgError &&
    src &&
    typeof src === "string" &&
    src.trim().length > 4 &&
    src !== "undefined" &&
    src !== "null";

  const displaySrc = hasValidSrc ? src : "/images/tbs-logo.png";

  return (
    <div className={`relative inline-block flex-shrink-0 ${currentSizeClass} ${className}`}>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center select-none shadow-2xs border border-emerald-600/30 bg-white">
        <img
          src={displaySrc}
          alt={name || "User Avatar"}
          onError={() => setImgError(true)}
          style={{
            transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
            transformOrigin: "center center",
            ...style,
          }}
          className="w-full h-full object-cover transition-transform duration-100"
        />
      </div>

      {showOnlineBadge && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-600/20" />
      )}
    </div>
  );
}
