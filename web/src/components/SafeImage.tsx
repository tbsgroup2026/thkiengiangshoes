"use client";

import React from "react";
import { SmartCloudinaryImage, SmartCloudinaryImageProps } from "./SmartCloudinaryImage";

export interface SafeImageProps extends SmartCloudinaryImageProps {}

/**
 * SafeImage — Component tải ảnh tương thích ngược toàn dự án KG-KAIZEN.
 * Tự động áp dụng tối ưu Cloudinary URL (f_auto, q_auto), progressive blur LQIP,
 * retry backoff khi mất mạng và chống vỡ layout (CLS = 0).
 */
export default function SafeImage(props: SafeImageProps) {
  return <SmartCloudinaryImage {...props} />;
}
