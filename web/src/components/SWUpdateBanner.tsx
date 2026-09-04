"use client";

import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

/**
 * SWUpdateBanner
 *
 * FIX: Thay thế pattern cũ tự reload khi controllerchange.
 * Banner xuất hiện ở góc dưới màn hình khi có SW version mới.
 * User tự bấm "Cập Nhật Ngay" — không tự reload bất ngờ.
 */
export default function SWUpdateBanner() {
  const { updateAvailable, isApplying, applyUpdate, dismissUpdate } =
    useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "80px", // Tránh MobileBottomNav
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "#00381e",
        border: "1px solid rgba(0,168,90,0.4)",
        borderRadius: "16px",
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        maxWidth: "calc(100vw - 32px)",
        width: "max-content",
        animation: "sw-banner-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <style>{`
        @keyframes sw-banner-in {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(0,168,90,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        🔄
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#e2f0e8",
            lineHeight: 1.3,
          }}
        >
          Có phiên bản mới
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(226,240,232,0.6)",
            marginTop: 2,
          }}
        >
          Cập nhật để có trải nghiệm tốt nhất
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={dismissUpdate}
          disabled={isApplying}
          style={{
            background: "transparent",
            border: "1px solid rgba(226,240,232,0.2)",
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(226,240,232,0.6)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.color = "#e2f0e8";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = "rgba(226,240,232,0.6)";
          }}
        >
          Để sau
        </button>

        <button
          onClick={applyUpdate}
          disabled={isApplying}
          style={{
            background: "#006838",
            border: "none",
            borderRadius: 10,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            cursor: isApplying ? "wait" : "pointer",
            transition: "background 0.15s",
            opacity: isApplying ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isApplying)
              (e.target as HTMLButtonElement).style.background = "#00522c";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "#006838";
          }}
        >
          {isApplying ? "Đang cập nhật..." : "Cập Nhật Ngay"}
        </button>
      </div>
    </div>
  );
}
