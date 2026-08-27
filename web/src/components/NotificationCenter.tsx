"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  IconBell,
  IconCheck,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconBulb,
  IconX,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendDesktopNotification,
  NotificationPermissionState,
} from "@/lib/browserNotifications";
import PWAInstallGuide from "@/components/PWAInstallGuide";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "GEMBA" | "KAIZEN";
  is_read: number;
  created_at: string;
  link?: string;
  targetUser?: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>("default");

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  useEffect(() => {
    setPermissionState(getNotificationPermission());

    // 1. Load initial notifications from LocalStorage
    try {
      const stored = localStorage.getItem("tbs_notifications_list");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications((prev) => {
            const combined = [...parsed];
            prev.forEach((p) => {
              if (!combined.some((c) => c.id === p.id)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      }
    } catch (e) {}

    // 2. Poll D1 Database every 5s for remote receiver notification updates
    const fetchRemoteNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const remoteItems: NotificationItem[] = json.data.map((item: any) => ({
            id: item.id || Date.now(),
            title: item.title,
            message: item.message,
            type: item.type || "INFO",
            is_read: item.is_read || 0,
            created_at: item.created_at ? new Date(item.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Vừa xong",
            link: item.record_id || "/work",
            targetUser: item.user_id,
          }));

          setNotifications((prev) => {
            const combined = [...prev];
            let hasNewUnread = false;
            remoteItems.forEach((r) => {
              const existingIdx = combined.findIndex((c) => String(c.id) === String(r.id));
              if (existingIdx === -1) {
                combined.unshift(r);
                if (r.is_read === 0) hasNewUnread = true;
              }
            });
            return combined;
          });
        }
      } catch (e) {}
    };

    fetchRemoteNotifications();
    const pollInterval = setInterval(fetchRemoteNotifications, 5000);

    // 3. Listen to realtime custom notification events
    const handleNewNotif = (e: any) => {
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev]);
      }
    };

    window.addEventListener("tbs_new_notification", handleNewNotif);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("tbs_new_notification", handleNewNotif);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll on mobile when Bottom Sheet is open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleToggleDesktopNotif = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, is_read: 1 }));
      try {
        localStorage.setItem("tbs_notifications_list", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "GEMBA":
      case "WARNING":
        return <IconAlertTriangle size={18} className="text-amber-500 flex-shrink-0" />;
      case "KAIZEN":
        return <IconBulb size={18} className="text-[#006838] flex-shrink-0" />;
      case "SUCCESS":
        return <IconCircleCheck size={18} className="text-emerald-500 flex-shrink-0" />;
      default:
        return <IconInfoCircle size={18} className="text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button (Min 44x44px Touch Target) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#006838] flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shadow-2xs"
        title="Thông báo hệ thống"
        aria-label="Thông báo hệ thống"
      >
        <IconBell size={21} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* ════════════════════════════════════════════════════════════
              MOBILE BOTTOM SHEET PORTAL (Responsive < 768px)
             ════════════════════════════════════════════════════════════ */}
          {isMounted &&
            createPortal(
              <div
                className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200"
                onClick={() => setIsOpen(false)}
              >
                <div
                  className="bg-white rounded-t-3xl max-h-[85vh] w-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250 border-t border-slate-200/90 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drag Handle Top Bar */}
                  <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 flex-shrink-0" />

                  {/* Header Bar with Distinct Touch Targets */}
                  <div className="px-3.5 py-3 bg-gradient-to-r from-[#006838] to-[#004d29] text-white flex items-center justify-between gap-2 flex-shrink-0 border-b border-emerald-800">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <IconBell size={20} className="text-emerald-300 flex-shrink-0" />
                      <h4 className="text-sm sm:text-base font-black tracking-tight truncate">Thông Báo Hệ Thống</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-black flex-shrink-0">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 min-h-[36px] active:scale-95 whitespace-nowrap"
                        >
                          <IconCheck size={14} />
                          <span>Đọc tất cả</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer min-h-[36px] min-w-[36px] active:scale-95 flex-shrink-0"
                        aria-label="Đóng"
                      >
                        <IconX size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Push Notification & PWA Banner */}
                  <div className="px-4 py-3 bg-emerald-50/80 border-b border-slate-200 flex flex-col gap-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-[#006838]">
                        <IconDeviceLaptop size={16} />
                        <span>Thông báo ĐT &amp; PC:</span>
                      </div>

                      {permissionState === "granted" ? (
                        <button
                          onClick={() =>
                            sendDesktopNotification({
                              title: "🔔 Thông Báo Chuỗi SKECHERS",
                              message: "Đã kết nối trực tiếp với trung tâm thông báo điện thoại & PC của bạn!",
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-2xs min-h-[36px]"
                        >
                          ✅ Đã bật (Gửi thử)
                        </button>
                      ) : permissionState === "denied" ? (
                        <span className="text-xs font-black text-rose-600">🔕 Đã bị chặn</span>
                      ) : (
                        <button
                          onClick={handleToggleDesktopNotif}
                          className="px-3 py-1.5 rounded-xl bg-[#006838] text-white text-xs font-bold hover:bg-[#004d29] transition cursor-pointer shadow-2xs min-h-[36px]"
                        >
                          🔔 Bật thông báo
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-emerald-200/60 pt-2">
                      <span className="text-xs font-bold text-slate-700">Thêm vào màn hình chính ĐT:</span>
                      <PWAInstallGuide />
                    </div>
                  </div>

                  {/* List Body on Mobile Bottom Sheet */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-sm text-slate-500 font-medium">
                        Không có thông báo mới nào.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === item.id ? { ...n, is_read: 1 } : n))
                            );
                            setIsOpen(false);
                            if (item.link) {
                              window.location.href = item.link;
                            }
                          }}
                          className={`p-4 rounded-2xl border flex items-start gap-3 transition.all cursor-pointer shadow-2xs active:scale-[0.99] ${
                            item.is_read === 0
                              ? "bg-emerald-50/70 border-emerald-200"
                              : "bg-slate-50/80 border-slate-200/80"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5 border border-slate-100">
                            {getIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-sm font-extrabold text-slate-900 leading-snug">
                                {item.title}
                              </h5>
                              <span className="text-xs text-slate-500 font-mono font-semibold whitespace-nowrap flex-shrink-0">
                                {item.created_at}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words font-medium">
                              {item.message}
                            </p>
                            {item.targetUser && item.targetUser !== "all" && (
                              <div className="pt-1">
                                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs">
                                  👤 Gửi đến: {item.targetUser}
                                </span>
                              </div>
                            )}
                          </div>
                          {item.is_read === 0 && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#006838] flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bottom Sheet Footer */}
                  <div className="p-3 text-center bg-slate-50 border-t border-slate-200 flex-shrink-0">
                    <span className="text-xs text-slate-500 font-bold">
                      Tổ hợp Kiên Giang – TBS Group 24/7
                    </span>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* ════════════════════════════════════════════════════════════
              DESKTOP DROPDOWN PANEL (Responsive >= 768px md:block)
             ════════════════════════════════════════════════════════════ */}
          <div className="hidden md:block absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#006838] to-[#004d29] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconBell size={18} />
                <h4 className="text-sm font-extrabold tracking-tight">Thông Báo Hệ Thống</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-emerald-100 hover:text-white transition-colors cursor-pointer flex items-center gap-1 mr-2"
                  >
                    <IconCheck size={14} />
                    <span>Đọc tất cả</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                  aria-label="Đóng"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>

            {/* Desktop Banner Bar */}
            <div className="px-3.5 py-2 bg-emerald-50/70 border-b border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#006838]">
                  <IconDeviceLaptop size={15} />
                  <span>Thông báo ĐT &amp; PC:</span>
                </div>

                {permissionState === "granted" ? (
                  <button
                    onClick={() =>
                      sendDesktopNotification({
                        title: "🔔 Thông Báo Chuỗi SKECHERS",
                        message: "Đã kết nối trực tiếp với trung tâm thông báo điện thoại & PC của bạn!",
                      })
                    }
                    className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 transition cursor-pointer shadow-2xs"
                  >
                    ✅ Đã bật (Gửi thử)
                  </button>
                ) : permissionState === "denied" ? (
                  <span className="text-[10px] font-black text-rose-600">🔕 Đã bị chặn</span>
                ) : (
                  <button
                    onClick={handleToggleDesktopNotif}
                    className="px-2 py-0.5 rounded-lg bg-[#006838] text-white text-[10px] font-black hover:bg-[#004d29] transition cursor-pointer shadow-2xs"
                  >
                    🔔 Bật thông báo
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-emerald-200/50 pt-1.5">
                <span className="text-[10px] font-bold text-slate-600">Màn hình chính ĐT:</span>
                <PWAInstallGuide />
              </div>
            </div>

            {/* Desktop List Body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">
                  Không có thông báo mới nào.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === item.id ? { ...n, is_read: 1 } : n))
                      );
                      setIsOpen(false);
                      if (item.link) {
                        window.location.href = item.link;
                      }
                    }}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                      item.is_read === 0 ? "bg-emerald-50/40" : "bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {item.created_at}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                      {item.targetUser && item.targetUser !== "all" && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold">
                          👤 Gửi đến: {item.targetUser}
                        </span>
                      )}
                    </div>
                    {item.is_read === 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#006838] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Footer */}
            <div className="p-2.5 text-center bg-slate-50 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                Tổ hợp Kiên Giang - Notification System 24/7
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
