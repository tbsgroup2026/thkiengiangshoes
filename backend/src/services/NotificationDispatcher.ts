import prisma from '../utils/prisma';

export interface NotificationParams {
  userId: string | string[];
  type: 'ORDER' | 'ALERT' | 'KAIZEN' | 'BOOKING' | 'SLA' | 'DOCUMENT' | 'CHAT' | 'NEWS' | 'INCIDENT' | 'BUSINESS_TRIP';
  title: string;
  body: string;
  data?: {
    action?: string;
    deepLink?: string;
    [key: string]: any;
  };
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ttl?: number; // Time to live in seconds
}

interface DispatchResult {
  userId: string;
  success: boolean;
  notificationId?: string;
  devicesQueued?: number;
  jobIds?: string[];
  reason?: string;
}

interface DispatchResponse {
  success: boolean;
  processed: number;
  details: DispatchResult[];
}

/**
 * NotificationDispatcher - Central Hub for All Notifications
 * 
 * This is the ONLY entry point that other services (Orders, SLA, Kaizen, etc.) 
 * should call to send notifications. It handles:
 * - User validation
 * - Preference checking
 * - Device token management
 * - Queue creation for async sending
 * - Notification history tracking
 */
export class NotificationDispatcher {
  /**
   * Main method to send notification to user(s)
   * 
   * USAGE EXAMPLE (from Order service):
   * ```typescript
   * await NotificationDispatcher.send({
   *   userId: "user-123",
   *   type: "ORDER",
   *   title: "Đơn hàng mới",
   *   body: "Có đơn hàng từ SKECHERS: OR-2026-08-001",
   *   data: {
   *     action: "open_order",
   *     deepLink: "/work/orders/OR-2026-08-001",
   *     orderId: "OR-2026-08-001"
   *   },
   *   priority: "HIGH"
   * });
   * ```
   */
  static async send(params: NotificationParams): Promise<DispatchResponse> {
    try {
      // 1. Normalize userId to array
      const userIds = Array.isArray(params.userId) ? params.userId : [params.userId];
      
      // 2. Set defaults
      const priority = params.priority || 'MEDIUM';
      const ttl = params.ttl || 86400; // 24 hours default
      
      // 3. For each user, process notification
      const results: DispatchResult[] = [];
      for (const userId of userIds) {
        const result = await this.processUserNotification(userId, {
          ...params,
          priority,
          ttl
        });
        results.push(result);
      }
      
      return {
        success: true,
        processed: results.length,
        details: results
      };
    } catch (error) {
      console.error('❌ NotificationDispatcher.send error:', error);
      throw error;
    }
  }

  /**
   * Process notification for single user
   * Handles: user validation, preference check, device lookup, db record creation
   */
  private static async processUserNotification(
    userId: string,
    params: NotificationParams & { priority: string; ttl: number }
  ): Promise<DispatchResult> {
    try {
      // 1. Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { notificationPref: true }
      });
      
      if (!user) {
        console.log(`⚠️  User ${userId} not found`);
        return { userId, success: false, reason: 'User not found' };
      }
      
      // 2. Check preferences
      const prefs = user.notificationPref || {
        pushEnabled: true,
        channelTypes: 'ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT,CHAT,NEWS,INCIDENT,BUSINESS_TRIP'
      };
      
      if (!prefs.pushEnabled) {
        console.log(`⚠️  Push notifications disabled for user ${userId}`);
        return { userId, success: false, reason: 'Push notifications disabled' };
      }
      
      if (!prefs.channelTypes.includes(params.type)) {
        console.log(`⚠️  Channel type ${params.type} not enabled for user ${userId}`);
        return { userId, success: false, reason: `Channel type ${params.type} not enabled` };
      }
      
      // 3. Get user's device tokens
      const devices = await prisma.deviceToken.findMany({
        where: {
          userId: userId,
          isActive: true
        }
      });
      
      if (devices.length === 0) {
        console.log(`⚠️  No active devices for user ${userId}`);
        return { userId, success: false, reason: 'No active devices' };
      }
      
      // 4. Create PushNotification record in database
      const notification = await prisma.pushNotification.create({
        data: {
          userId,
          title: params.title,
          body: params.body,
          type: params.type,
          priority: params.priority,
          status: 'PENDING',
          data: params.data ? JSON.stringify(params.data) : null
        }
      });
      
      console.log(`✅ Created notification record: ${notification.id}`);
      
      // 5. Group devices by platform
      const androidDevices = devices.filter((d: any) => d.platform === 'ANDROID');
      const iosDevices = devices.filter((d: any) => d.platform === 'IOS');
      
      console.log(`📱 Found ${androidDevices.length} Android devices, ${iosDevices.length} iOS devices`);
      
      // 6. Prepare job IDs for return
      const jobIds: string[] = [];
      
      // For now, just return the notification ID and device count
      // In Step 3 (NotificationQueue), we'll implement the actual queue integration
      if (androidDevices.length > 0) {
        jobIds.push(`job-fcm-${notification.id}`);
      }
      
      if (iosDevices.length > 0) {
        jobIds.push(`job-apns-${notification.id}`);
      }
      
      return {
        userId,
        success: true,
        notificationId: notification.id,
        devicesQueued: devices.length,
        jobIds: jobIds
      };
    } catch (error) {
      console.error(`❌ Error processing notification for user ${userId}:`, error);
      return {
        userId,
        success: false,
        reason: (error as Error).message
      };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<any> {
    try {
      const updated = await prisma.pushNotification.update({
        where: { id: notificationId },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });
      console.log(`✅ Marked notification ${notificationId} as read`);
      return updated;
    } catch (error) {
      console.error(`❌ Error marking notification as read:`, error);
      throw error;
    }
  }

  /**
   * Get notification history for user
   */
  static async getHistory(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: string;
      status?: string;
    } = {}
  ): Promise<any> {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const where: any = { userId };
      if (options.type) where.type = options.type;
      if (options.status) where.status = options.status;
      
      const [notifications, total] = await Promise.all([
        prisma.pushNotification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.pushNotification.count({ where })
      ]);
      
      console.log(`✅ Retrieved ${notifications.length} notifications for user ${userId}`);
      
      return {
        data: notifications.map((n: any) => ({
          ...n,
          data: n.data ? JSON.parse(n.data) : null
        })),
        pagination: { limit, offset, total }
      };
    } catch (error) {
      console.error(`❌ Error getting notification history:`, error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: string,
    prefs: {
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      channelTypes?: string[];
    }
  ): Promise<any> {
    try {
      const channelTypesStr = prefs.channelTypes?.join(',') || undefined;
      
      const updated = await prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          pushEnabled: prefs.pushEnabled ?? true,
          emailEnabled: prefs.emailEnabled ?? true,
          smsEnabled: prefs.smsEnabled ?? false,
          channelTypes: channelTypesStr || 'ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT,CHAT,NEWS,INCIDENT,BUSINESS_TRIP'
        },
        update: {
          pushEnabled: prefs.pushEnabled,
          emailEnabled: prefs.emailEnabled,
          smsEnabled: prefs.smsEnabled,
          ...(channelTypesStr && { channelTypes: channelTypesStr })
        }
      });
      
      console.log(`✅ Updated notification preferences for user ${userId}`);
      return updated;
    } catch (error) {
      console.error(`❌ Error updating notification preferences:`, error);
      throw error;
    }
  }

  /**
   * Register a device token for a user
   */
  static async registerDeviceToken(
    userId: string,
    platform: 'ANDROID' | 'IOS',
    token: string,
    deviceId?: string,
    deviceName?: string
  ): Promise<any> {
    try {
      // Check if token already exists
      const existing = await prisma.deviceToken.findFirst({
        where: { token }
      });
      
      let deviceToken;
      if (existing) {
        // Update existing token
        deviceToken = await prisma.deviceToken.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            lastUsedAt: new Date(),
            deviceId,
            deviceName,
            failureCount: 0
          }
        });
        console.log(`✅ Updated existing device token: ${existing.id}`);
      } else {
        // Create new token
        deviceToken = await prisma.deviceToken.create({
          data: {
            userId,
            platform,
            token,
            deviceId,
            deviceName,
            isActive: true
          }
        });
        console.log(`✅ Created new device token: ${deviceToken.id}`);
      }
      
      return deviceToken;
    } catch (error) {
      console.error(`❌ Error registering device token:`, error);
      throw error;
    }
  }

  /**
   * Unregister (deactivate) a device token
   */
  static async unregisterDeviceToken(deviceTokenId: string): Promise<any> {
    try {
      const updated = await prisma.deviceToken.update({
        where: { id: deviceTokenId },
        data: { isActive: false }
      });
      console.log(`✅ Unregistered device token: ${deviceTokenId}`);
      return updated;
    } catch (error) {
      console.error(`❌ Error unregistering device token:`, error);
      throw error;
    }
  }

  /**
   * Get all active device tokens for a user
   */
  static async getUserDevices(userId: string): Promise<any[]> {
    try {
      const devices = await prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: { lastUsedAt: 'desc' }
      });
      
      console.log(`✅ Retrieved ${devices.length} active devices for user ${userId}`);
      return devices;
    } catch (error) {
      console.error(`❌ Error getting user devices:`, error);
      throw error;
    }
  }
}

export default NotificationDispatcher;
