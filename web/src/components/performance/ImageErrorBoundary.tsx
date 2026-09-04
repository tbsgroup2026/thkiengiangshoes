"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ImageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ImageErrorBoundary] Image/Section render error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-sm">
          <IconAlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-semibold block">Không thể hiển thị phần này</span>
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Đã xảy ra lỗi khi tải tài nguyên hoặc giao diện.
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
