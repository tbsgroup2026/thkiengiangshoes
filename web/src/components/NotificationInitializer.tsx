"use client";

import { useEffect } from "react";
import { requestNotificationPermission, registerServiceWorker, syncPushSubscriptionToServer } from "@/lib/browserNotifications";

/**
 * Auto-initialize notification system when app loads
 * Registers Service Worker and syncs push subscriptions
 * Deferred permission request to avoid popup confusion on first load
 */
export default function NotificationInitializer() {
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // 1. Always register Service Worker first (no permission needed)
        const swReg = await registerServiceWorker();
        if (!swReg) {
          console.log("Service Worker registration not available (may be in development or incognito)");
          return;
        }
        console.log("✓ Service Worker registered successfully");

        // 2. Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log("✓ Service Worker is ready");

        // 3. Check notification support
        if (!("Notification" in window)) {
          console.log("This browser doesn't support Web Notifications");
          return;
        }

        // 4. Sync push subscription if permission already granted
        if (Notification.permission === "granted") {
          const synced = await syncPushSubscriptionToServer();
          if (synced) {
            console.log("✓ Push subscription synced to server");
          }
        } else if (Notification.permission === "default") {
          // Permission not yet decided - wait a bit then ask
          // This prevents popup fatigue on first page load
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const result = await requestNotificationPermission();
          if (result === "granted") {
            // After permission granted, sync subscription
            await new Promise(resolve => setTimeout(resolve, 500));
            const synced = await syncPushSubscriptionToServer();
            if (synced) {
              console.log("✓ Push subscription synced to server after permission grant");
            }
          }
        }
      } catch (err) {
        console.warn("Notification initialization warning (non-critical):", err);
        // Don't let notification setup errors break the app
      }
    };

    // Start initialization after a minimal delay to ensure DOM is ready
    const timer = setTimeout(initNotifications, 500);
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}
