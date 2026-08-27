"use client";

export type NotificationPermissionState = "granted" | "denied" | "default" | "unsupported";

/**
 * Kiểm tra xem thiết bị PC/Laptop/Điện thoại có hỗ trợ Web Notifications API hay không
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Lấy trạng thái quyền thông báo hiện tại
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission as NotificationPermissionState;
}

/**
 * Tự động đăng ký Service Worker (/sw.js) để hỗ trợ Mobile Push Notification
 */

/**
 * Chuyển đổi VAPID Base64 key thành Uint8Array cho PushManager API
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Đăng ký Push Subscription với PushManager của trình duyệt và đồng bộ với D1 Server
 */
export async function syncPushSubscriptionToServer(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      // Create new subscription if none exists (using standard VAPID public key format)
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa3aey30y5Gvw7K8e3F1P9sT3x4F4t16WuP8k5q9w0y12ABCDEF1234567890abcdef";
      
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey) as unknown as BufferSource,
        });
        console.log("✓ New push subscription created");
      } catch (subErr) {
        console.info("Push subscription skipped (local browser mode or custom VAPID key required)");
        return false;
      }
    }

    if (sub) {
      const subJson = sub.toJSON();
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subJson,
        }),
      });
      
      if (response.ok) {
        console.log("✓ Push subscription synced to server");
        return true;
      } else {
        console.warn("Failed to sync push subscription (server returned " + response.status + ")");
        return false;
      }
    }
  } catch (err) {
    console.warn("Cannot sync PushSubscription to server:", err);
  }
  return false;
}

/**
 * Hủy đăng ký Push Notifications khỏi thiết bị hiện tại
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      return true;
    }
  } catch (e) {
    console.warn("Lỗi khi hủy đăng ký Push Notifications:", e);
  }
  return false;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.warn("Đăng ký Service Worker thất bại:", err);
    return null;
  }
}

/**
 * Phát âm thanh thông báo Facebook-style ngắn gọn bằng Web Audio API
 */
export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Frequency synth cho tiếng "Ding" êm ái
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // ignore audio context restrictions
  }
}

/**
 * Yêu cầu người dùng bật quyền thông báo trên Điện thoại / PC
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    alert("Thiết bị của bạn chưa hỗ trợ thông báo hệ thống.");
    return "unsupported";
  }

  try {
    // Tự động kích hoạt đăng ký Service Worker
    await registerServiceWorker();

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      playNotificationSound();
      await syncPushSubscriptionToServer();
      await sendDesktopNotification({
        title: "🔔 Đã bật thông báo Điện thoại & PC thành công!",
        message: "Hệ thống Tổ hợp Kiên Giang - TBS Group đã kết nối Push Notification với trung tâm thông báo màn hình chính điện thoại của bạn.",
        tag: "welcome_test",
      });
    } else if (permission === "denied") {
      alert("Bạn đã từ chối quyền thông báo. Hãy bấm vào biểu tượng 🔒/⚙️ trên thanh địa chỉ trình duyệt hoặc Cài Đặt ➔ Thông Báo để cho phép lại.");
    }

    return permission as NotificationPermissionState;
  } catch (err) {
    console.error("Lỗi yêu cầu quyền thông báo:", err);
    return "denied";
  }
}

export interface DesktopNotificationPayload {
  title: string;
  message: string;
  icon?: string;
  url?: string;
  tag?: string;
  playSound?: boolean;
}

/**
 * Gửi thông báo trực tiếp về màn hình Điện thoại (Android / iOS PWA) hoặc PC/Laptop
 */
export async function sendDesktopNotification(payload: DesktopNotificationPayload) {
  if (!isNotificationSupported()) return;

  if (Notification.permission === "granted") {
    try {
      const { title, message, icon = "/icon.png", url = "/work", tag, playSound = true } = payload;

      if (playSound) {
        playNotificationSound();
      }

      // 1. Thử gửi qua Service Worker Registration (Chuẩn hỗ trợ Mobile Android & iOS 16.4+ PWA)
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body: message,
            icon: icon,
            badge: "/icon.png",
            vibrate: [200, 100, 200],
            tag: tag || `tbs_push_${Date.now()}`,
            data: { url },
          } as NotificationOptions);
          return;
        }
      }

      // 2. Fallback sang Notification API chuẩn trên Desktop PC
      const notif = new Notification(title, {
        body: message,
        icon: icon,
        badge: "/icon.png",
        tag: tag || `tbs_notif_${Date.now()}`,
        data: { url },
      } as NotificationOptions);

      notif.onclick = function (event) {
        event.preventDefault();
        window.focus();
        if (url) {
          window.location.href = url;
        }
        notif.close();
      };
    } catch (err) {
      console.warn("Không thể gửi Notification:", err);
    }
  }
}

export interface TBSNotificationPayload {
  title: string;
  message: string;
  type?: "INFO" | "WARNING" | "SUCCESS" | "GEMBA" | "KAIZEN";
  targetUser?: string;
  link?: string;
}

/**
 * Phát thông báo realtime tới NotificationCenter UI, LocalStorage và Mobile/Desktop Push Notifications
 * 
 * CHỈ hiển thị thông báo cho người được chỉ định (targetUser)
 * - Nếu targetUser là tên của user hiện tại → hiển thị
 * - Nếu targetUser là "ALL" → hiển thị cho toàn bộ
 * - Nếu targetUser là "Ban Giám Đốc" → hiển thị cho nhóm đó
 * - Ngược lại → không hiển thị
 */
export function broadcastNotification(payload: TBSNotificationPayload) {
  if (typeof window === "undefined") return;

  const notifItem = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: payload.title,
    message: payload.message,
    type: payload.type || "INFO",
    targetUser: payload.targetUser || "ALL",
    is_read: 0,
    created_at: "Vừa xong",
    link: payload.link || "/work",
  };

  // 1. Persist in LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem("tbs_notifications_list") || "[]");
    localStorage.setItem("tbs_notifications_list", JSON.stringify([notifItem, ...existing].slice(0, 50)));
  } catch (e) {}

  // 2. Dispatch event for NotificationCenter Component
  // ✅ CHỈ dispatch event nếu thông báo dành cho user này
  const shouldDisplay = isNotificationForCurrentUser(payload.targetUser);
  if (shouldDisplay) {
    window.dispatchEvent(new CustomEvent("tbs_new_notification", { detail: notifItem }));

    // 3. Trigger Browser / Mobile Push Notification & Sound (nếu là cho người này)
    sendDesktopNotification({
      title: payload.title,
      message: payload.message,
      url: payload.link || "/work",
      playSound: true,
    });
  }

  // 4. Remote Sync to Cloudflare D1 Database for cross-device receiver delivery
  try {
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title,
        message: payload.message,
        type: payload.type || "INFO",
        targetUser: payload.targetUser || "ALL",
        link: payload.link || "/work",
      }),
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Kiểm tra xem thông báo này có dành cho user hiện tại không
 * @param targetUser - Tên user, nhóm, hoặc "ALL"
 * @returns true nếu user hiện tại nên nhận thông báo này
 */
function isNotificationForCurrentUser(targetUser?: string): boolean {
  if (!targetUser || targetUser === "ALL") return true;

  try {
    // Lấy thông tin user hiện tại từ localStorage (được set bởi getCurrentUser())
    const currentUserStr = localStorage.getItem("current_user");
    if (!currentUserStr) return false;

    const currentUser = JSON.parse(currentUserStr);
    const currentUserName = currentUser.name || "";
    const currentUserEmpCode = currentUser.empCode || "";
    const currentUserRole = currentUser.roleCode || "";
    const currentUserDept = currentUser.department || "";

    // Nếu targetUser khớp với tên, mã nhân viên, hoặc vai trò của user
    if (
      targetUser.toLowerCase().includes(currentUserName.toLowerCase()) ||
      targetUser.toLowerCase().includes(currentUserEmpCode.toLowerCase()) ||
      targetUser.toLowerCase().includes(currentUserRole.toLowerCase()) ||
      targetUser.toLowerCase().includes(currentUserDept.toLowerCase())
    ) {
      return true;
    }

    // Nếu targetUser là tên nhóm chung (e.g., "Ban Giám Đốc", "Lễ Tân", "Kế Toán")
    // và user có role/department khớp
    const groupNames = ["Ban Giám Đốc", "Lễ Tân", "Kế Toán", "Trưởng Phòng", "Nhân Sự"];
    if (
      groupNames.some(
        (group) =>
          targetUser.toLowerCase().includes(group.toLowerCase()) &&
          currentUserRole.toUpperCase().includes(group.toUpperCase())
      )
    ) {
      return true;
    }

    return false;
  } catch (e) {
    // Nếu có lỗi, mặc định hiển thị (an toàn hơn)
    return true;
  }
}
