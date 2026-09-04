"use client";

import React from "react";
import { SmartImage, SmartImageProps } from "./performance/SmartImage";

export interface SafeImageProps extends SmartImageProps {}

/**
 * Enhanced SafeImage component wrapped with adaptive Cloudinary SmartImage loader.
 * Maintains 100% backwards compatibility with previous SafeImage props while auto-applying performance features.
 */
export default function SafeImage(props: SafeImageProps) {
  return <SmartImage {...props} />;
}
