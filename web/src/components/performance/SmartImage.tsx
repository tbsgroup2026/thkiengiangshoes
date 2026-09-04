"use client";

import React from "react";
import { SmartCloudinaryImage, SmartCloudinaryImageProps } from "../SmartCloudinaryImage";

export interface SmartImageProps extends SmartCloudinaryImageProps {}

/**
 * SmartImage — Wrapper chuyển tiếp tới SmartCloudinaryImage để đảm bảo tương thích ngược.
 */
export function SmartImage(props: SmartImageProps) {
  return <SmartCloudinaryImage {...props} />;
}

export default SmartImage;
