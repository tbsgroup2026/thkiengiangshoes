# 🏗️ BƯỚC 3: THIẾT KẾ KỸ THUẬT - Push Notification Architecture

**Date**: August 23, 2026  
**Status**: ✅ TECHNICAL DESIGN COMPLETE

---

## 1️⃣ GIẢI PHÁP PUSH ĐƯỢC CHỌN

### Recommended Solution: **Firebase Cloud Messaging (FCM) + Apple Push Notification service (APNs)**

### Why FCM + APNs?

| Criteria | FCM | OneSignal | AWS SNS | Verdict |
|----------|-----|-----------|---------|--------|
| **Cost** | Free tier + pay-as-you-go | Free 10K contacts | Expensive | ✅ FCM (Cheapest) |
| **Android Support** | ✅ Native FCM | ✅ FCM wrapper | ✅ SNS | ✅ FCM (Direct) |
| **iOS Support** | ✅ APNs integration | ✅ APNs wrapper | ✅ APNs | ✅ FCM (Integrated) |
| **Ease of Setup** | Medium (need Firebase account) | Easy (all-in-one) | Hard (AWS account) | ✅ FCM |
| **Retry Logic** | ✅ Built-in | ✅ Built-in | ✅ Built-in | Tie |
| **Analytics** | ✅ Good | ✅ Excellent | ✅ Good | OneSignal |
| **Free Tier** | Yes (500/month) | Yes (limited) | No (pay only) | ✅ FCM |
| **Node.js Integration** | ✅ firebase-admin | ✅ node-onesignal | ✅ @aws-sdk | ✅ FCM |

### Conclusion: **FCM is optimal for TBS II**
- ✅ Zero cost setup (Firebase free tier)
- ✅ Direct integration with Android & iOS
- ✅ Excellent Node.js SDK (firebase-admin)
- ✅ Battle-tested (Google's own product)
- ✅ Auto-retry with exponential backoff
- ✅ Rich payload support

---

## 2️⃣ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    TBS II ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  BACKEND SERVICES (Node.js + Python)                        │
│  ├── Order Service → Event: ORDER_CREATED                  │
│  ├── SLA Engine   → Event: SLA_BREACH                       │
│  ├── Incident Svc → Event: INCIDENT_REPORTED               │
│  ├── Kaizen Svc   → Event: KAIZEN_SUBMITTED                │
│  └── Booking Svc  → Event: BOOKING_CONFIRMED               │
│         ↓                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  NotificationDispatcher (Central Hub)               │   │
│  │  ├─ Receive events from all services               │   │
│  │  ├─ Check user notification preferences            │   │
│  │  ├─ Find device tokens for user                    │   │
│  │  ├─ Add to BullMQ job queue                        │   │
│  │  └─ Log to PushNotification table                  │   │
│  └─────────────────────────────────────────────────────┘   │
│         ↓                                                    │
│  BullMQ Job Queue (Redis)                                  │
│  ├─ Job 1: Send to FCM (Android)                           │
│  ├─ Job 2: Send to APNs (iOS)                              │
│  ├─ Retry with backoff (1s, 5s, 15s)                      │
│  └─ Update status in DB                                    │
│         ↓ ↓                                                  │
└─────────────────────────────────────────────────────────────┘
         │ │
    ┌────┴─┴────────────────────────────┐
    │                                    │
┌───▼─────────────────┐        ┌────────▼────────┐
│  Firebase Cloud     │        │   APNs Service  │
│  Messaging (FCM)    │        │  (Apple)        │
│                     │        │                 │
│  ✅ Android only    │        │  ✅ iOS only    │
│  ✅ 500 free/mo     │        │  ✅ Included    │
│  ✅ Auto retry      │        │  ✅ Auto retry  │
└────────────────────┘        └────────────────┘
    │                                    │
    └────────────────────┬───────────────┘
                         │
         ┌───────────────┴──────────────┐
         │                              │
    ┌────▼─────────────┐        ┌───────▼────────┐
    │  Android Device  │        │   iOS Device   │
    │  Lock Screen     │        │  Lock Screen   │
    │                  │        │                │
    │  🔔 Thông báo   │        │  🔔 Thông báo │
    │  Chuỗi SKECHERS │        │  Chuỗi SKECHERS│
    │  Đơn hàng mới   │        │  Đơn hàng mới  │
    │                  │        │                │
    │  [Tap to open]   │        │  [Tap to open] │
    └──────────────────┘        └────────────────┘
```

---

## 3️⃣ COMPONENT DESIGN

### 3.1 Database Schema Changes

**File: `backend/prisma/schema.prisma`**

```prisma
// ============ NEW MODELS ============

model DeviceToken {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Device identification
  platform          String   // "ANDROID" | "IOS"
  token             String   @unique  // FCM token or APNs token
  deviceId          String?  // Unique device identifier (e.g., UUID)
  deviceName        String?  // e.g., "iPhone 14 Pro"
  userAgent         String?
  
  // Status tracking
  isActive          Boolean  @default(true)
  lastUsedAt        DateTime?
  lastFailedAt      DateTime?
  failureCount      Int      @default(0)
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([userId])
  @@index([platform])
  @@index([isActive])
  @@index([createdAt])
}

model PushNotification {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Content
  title             String   // "Đơn hàng mới"
  body              String   // "Có đơn hàng từ SKECHERS..."
  type              String   // "ORDER" | "ALERT" | "KAIZEN" | "BOOKING" | "SLA" | "DOCUMENT" | "CHAT" | "NEWS"
  priority          String   @default("MEDIUM")  // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  
  // Status
  status            String   @default("PENDING")  // "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "READ"
  
  // Payload
  data              String?  // JSON: { action, deepLink, orderId, etc. }
  
  // Timestamps
  createdAt         DateTime @default(now())
  sentAt            DateTime?
  deliveredAt       DateTime?
  readAt            DateTime?
  
  // Retry tracking
  attemptCount      Int      @default(0)
  lastAttemptAt     DateTime?
  lastError         String?
  
  @@index([userId])
  @@index([status])
  @@index([type])
  @@index([priority])
  @@index([createdAt])
}

model NotificationPreference {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Channels
  pushEnabled       Boolean  @default(true)
  emailEnabled      Boolean  @default(true)
  smsEnabled        Boolean  @default(false)
  
  // Notification types to receive
  channelTypes      String   @default("ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT,CHAT")
  
  // Timing preferences
  quietHours        String?  // JSON: { startHour: 22, endHour: 8 } - no notifications
  
  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([userId])
}

// Update existing User model
model User {
  // ... existing fields ...
  
  // Add relations for push notifications
  deviceTokens      DeviceToken[]
  pushNotifications PushNotification[]
  notificationPref  NotificationPreference?
}
```

---

### 3.2 NotificationDispatcher Service

**File: `backend/src/services/NotificationDispatcher.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import { notificationQueue } from './NotificationQueue';
import admin from 'firebase-admin';

interface NotificationParams {
  userId: string | string[];
  type: 'ORDER' | 'ALERT' | 'KAIZEN' | 'BOOKING' | 'SLA' | 'DOCUMENT' | 'CHAT' | 'NEWS';
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

const prisma = new PrismaClient();

export class NotificationDispatcher {
  /**
   * Main method to send notification to user(s)
   * Handles all business logic and queuing
   */
  static async send(params: NotificationParams) {
    try {
      // 1. Normalize userId to array
      const userIds = Array.isArray(params.userId) ? params.userId : [params.userId];
      
      // 2. Set defaults
      const priority = params.priority || 'MEDIUM';
      const ttl = params.ttl || 86400; // 24 hours default
      
      // 3. For each user, process notification
      const results = [];
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
      console.error('NotificationDispatcher.send error:', error);
      throw error;
    }
  }

  /**
   * Process notification for single user
   */
  private static async processUserNotification(
    userId: string,
    params: NotificationParams & { priority: string; ttl: number }
  ) {
    try {
      // 1. Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { notificationPref: true }
      });
      
      if (!user) {
        return { userId, success: false, reason: 'User not found' };
      }
      
      // 2. Check preferences
      const prefs = user.notificationPref || {
        pushEnabled: true,
        channelTypes: 'ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT,CHAT'
      };
      
      if (!prefs.pushEnabled) {
        return { userId, success: false, reason: 'Push notifications disabled' };
      }
      
      if (!prefs.channelTypes.includes(params.type)) {
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
        return { userId, success: false, reason: 'No active devices' };
      }
      
      // 4. Create PushNotification record
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
      
      // 5. Group devices by platform
      const androidDevices = devices.filter(d => d.platform === 'ANDROID');
      const iosDevices = devices.filter(d => d.platform === 'IOS');
      
      // 6. Queue jobs for sending
      const jobs = [];
      
      if (androidDevices.length > 0) {
        const job = await notificationQueue.add({
          type: 'SEND_FCM',
          notificationId: notification.id,
          devices: androidDevices,
          payload: {
            title: params.title,
            body: params.body,
            data: params.data
          },
          ttl: params.ttl
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        });
        jobs.push(job);
      }
      
      if (iosDevices.length > 0) {
        const job = await notificationQueue.add({
          type: 'SEND_APNS',
          notificationId: notification.id,
          devices: iosDevices,
          payload: {
            title: params.title,
            body: params.body,
            data: params.data
          }
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        });
        jobs.push(job);
      }
      
      return {
        userId,
        success: true,
        notificationId: notification.id,
        devicesQueued: devices.length,
        jobIds: jobs.map(j => j.id)
      };
    } catch (error) {
      console.error(`Error processing notification for user ${userId}:`, error);
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
  static async markAsRead(notificationId: string) {
    return await prisma.pushNotification.update({
      where: { id: notificationId },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });
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
  ) {
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
    
    return {
      data: notifications,
      pagination: { limit, offset, total }
    };
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
  ) {
    const channelTypesStr = prefs.channelTypes?.join(',') || undefined;
    
    return await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        pushEnabled: prefs.pushEnabled ?? true,
        emailEnabled: prefs.emailEnabled ?? true,
        smsEnabled: prefs.smsEnabled ?? false,
        channelTypes: channelTypesStr || 'ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT,CHAT'
      },
      update: {
        pushEnabled: prefs.pushEnabled,
        emailEnabled: prefs.emailEnabled,
        smsEnabled: prefs.smsEnabled,
        ...(channelTypesStr && { channelTypes: channelTypesStr })
      }
    });
  }
}

export default NotificationDispatcher;
```

---

### 3.3 Notification Queue (BullMQ)

**File: `backend/src/services/NotificationQueue.ts`**

```typescript
import Bull from 'bull';
import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Redis queue
export const notificationQueue = new Bull('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// Firebase Admin SDK initialization
admin.initializeApp({
  credential: admin.credential.cert(require('../config/firebase-service-account.json'))
});

/**
 * Process FCM notifications (Android)
 */
notificationQueue.process('SEND_FCM', async (job) => {
  const { notificationId, devices, payload } = job.data;
  
  try {
    console.log(`[FCM] Processing notification ${notificationId} for ${devices.length} devices`);
    
    // Build FCM message
    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: {
        type: payload.data?.type || 'NOTIFICATION',
        action: payload.data?.action || 'open',
        deepLink: payload.data?.deepLink || '/',
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          channelId: 'high_importance_channel',
          sound: 'default',
          vibrate: [0, 250, 250, 250]
        },
        ttl: job.data.ttl || 86400
      }
    };
    
    // Send to each device
    const results = [];
    for (const device of devices) {
      try {
        const response = await admin.messaging().send({
          ...message,
          token: device.token
        });
        
        results.push({
          deviceId: device.id,
          token: device.token,
          success: true,
          messageId: response
        });
        
        console.log(`[FCM] ✅ Sent to device ${device.id}: ${response}`);
      } catch (error: any) {
        // Handle specific FCM errors
        if (error.code === 'messaging/invalid-registration-token') {
          // Token is invalid, mark device as inactive
          await prisma.deviceToken.update({
            where: { id: device.id },
            data: { isActive: false }
          });
        }
        
        results.push({
          deviceId: device.id,
          token: device.token,
          success: false,
          error: error.message
        });
        
        console.error(`[FCM] ❌ Failed to send to device ${device.id}:`, error.message);
      }
    }
    
    // Update notification status
    const successCount = results.filter(r => r.success).length;
    await prisma.pushNotification.update({
      where: { id: notificationId },
      data: {
        status: successCount > 0 ? 'SENT' : 'FAILED',
        sentAt: new Date(),
        attemptCount: (job.attempts || 0) - (job.attemptsMade || 1)
      }
    });
    
    return { success: true, sent: successCount, total: devices.length, results };
  } catch (error) {
    console.error('[FCM] Queue processing error:', error);
    throw error; // Trigger retry
  }
});

/**
 * Process APNs notifications (iOS)
 */
notificationQueue.process('SEND_APNS', async (job) => {
  const { notificationId, devices, payload } = job.data;
  
  try {
    console.log(`[APNs] Processing notification ${notificationId} for ${devices.length} devices`);
    
    // Build APNs message
    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: {
        type: payload.data?.type || 'NOTIFICATION',
        action: payload.data?.action || 'open',
        deepLink: payload.data?.deepLink || '/',
        timestamp: new Date().toISOString()
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body
            },
            badge: 1,
            sound: 'default',
            'content-available': 1,
            'mutable-content': true
          },
          customData: payload.data
        }
      }
    };
    
    // Send to each device
    const results = [];
    for (const device of devices) {
      try {
        const response = await admin.messaging().send({
          ...message,
          token: device.token
        });
        
        results.push({
          deviceId: device.id,
          token: device.token,
          success: true,
          messageId: response
        });
        
        console.log(`[APNs] ✅ Sent to device ${device.id}: ${response}`);
      } catch (error: any) {
        // Handle specific APNs errors
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          // Token is invalid or expired, mark device as inactive
          await prisma.deviceToken.update({
            where: { id: device.id },
            data: { isActive: false, lastFailedAt: new Date() }
          });
        }
        
        results.push({
          deviceId: device.id,
          token: device.token,
          success: false,
          error: error.message
        });
        
        console.error(`[APNs] ❌ Failed to send to device ${device.id}:`, error.message);
      }
    }
    
    // Update notification status
    const successCount = results.filter(r => r.success).length;
    await prisma.pushNotification.update({
      where: { id: notificationId },
      data: {
        status: successCount > 0 ? 'SENT' : 'FAILED',
        sentAt: new Date(),
        attemptCount: (job.attempts || 0) - (job.attemptsMade || 1)
      }
    });
    
    return { success: true, sent: successCount, total: devices.length, results };
  } catch (error) {
    console.error('[APNs] Queue processing error:', error);
    throw error; // Trigger retry
  }
});

/**
 * Job completion and failure handlers
 */
notificationQueue.on('completed', (job) => {
  console.log(`[Queue] ✅ Job ${job.id} completed`);
});

notificationQueue.on('failed', (job, error) => {
  console.error(`[Queue] ❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`, error.message);
});

export default notificationQueue;
```

---

### 3.4 REST API Routes

**File: `backend/src/routes/notifications.ts`**

```typescript
import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import NotificationDispatcher from '../services/NotificationDispatcher';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ============ Register Device Token ============
router.post('/register-device', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { platform, device_token, device_id, device_name } = req.body;
    const userId = (req as any).user.id;
    
    // Validate
    if (!platform || !device_token) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: platform, device_token'
      });
    }
    
    if (!['ANDROID', 'IOS'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform. Must be ANDROID or IOS'
      });
    }
    
    // Check if token already exists
    const existing = await prisma.deviceToken.findFirst({
      where: { token: device_token }
    });
    
    let deviceToken;
    if (existing) {
      // Update existing token
      deviceToken = await prisma.deviceToken.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          lastUsedAt: new Date(),
          deviceId: device_id,
          deviceName: device_name,
          failureCount: 0
        }
      });
    } else {
      // Create new token
      deviceToken = await prisma.deviceToken.create({
        data: {
          userId,
          platform,
          token: device_token,
          deviceId: device_id,
          deviceName: device_name,
          isActive: true
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Device registered successfully',
      data: {
        device_token_id: deviceToken.id,
        user_id: deviceToken.userId,
        platform: deviceToken.platform,
        registered_at: deviceToken.createdAt
      }
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============ Unregister Device ============
router.delete('/unregister-device/:deviceId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const userId = (req as any).user.id;
    
    // Verify device belongs to user
    const device = await prisma.deviceToken.findUnique({
      where: { id: deviceId }
    });
    
    if (!device || device.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    // Soft delete
    await prisma.deviceToken.update({
      where: { id: deviceId },
      data: { isActive: false }
    });
    
    res.json({
      success: true,
      message: 'Device unregistered'
    });
  } catch (error) {
    console.error('Unregister device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============ Get Notification History ============
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 20, offset = 0, type, status } = req.query;
    
    const history = await NotificationDispatcher.getHistory(userId, {
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
      type: type as string,
      status: status as string
    });
    
    res.json({
      success: true,
      data: history.data,
      pagination: history.pagination
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============ Mark as Read ============
router.post('/:notificationId/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = (req as any).user.id;
    
    // Verify notification belongs to user
    const notification = await prisma.pushNotification.findUnique({
      where: { id: notificationId }
    });
    
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const updated = await NotificationDispatcher.markAsRead(notificationId);
    
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============ Get Preferences ============
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });
    
    // Create default if doesn't exist
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId,
          pushEnabled: true,
          emailEnabled: true,
          smsEnabled: false,
          channelTypes: 'ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT,CHAT'
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        push_enabled: prefs.pushEnabled,
        email_enabled: prefs.emailEnabled,
        sms_enabled: prefs.smsEnabled,
        channel_types: prefs.channelTypes.split(',')
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============ Update Preferences ============
router.put('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { push_enabled, email_enabled, sms_enabled, channel_types } = req.body;
    
    const updated = await NotificationDispatcher.updatePreferences(userId, {
      pushEnabled: push_enabled,
      emailEnabled: email_enabled,
      smsEnabled: sms_enabled,
      channelTypes: channel_types
    });
    
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
```

---

### 3.5 Firebase Configuration

**File: `backend/src/config/firebase-service-account.json`**

```json
{
  "type": "service_account",
  "project_id": "tbs-group-XXXXX",
  "private_key_id": "key_id_here",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tbs-group-xxxxx.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 4️⃣ MOBILE APP IMPLEMENTATION

### Android (Kotlin + Jetpack Compose)

**File: `android/app/build.gradle.kts`**

```gradle
dependencies {
    // Firebase Messaging
    implementation("com.google.firebase:firebase-messaging:23.3.1")
    implementation("com.google.firebase:firebase-bom:32.0.0")
}

plugins {
    id("com.google.gms.google-services")  // Add Google Services plugin
}
```

**File: `android/app/src/main/AndroidManifest.xml`**

```xml
<manifest>
    <!-- Permissions for notifications -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
    
    <application>
        <!-- Firebase Messaging Service -->
        <service
            android:name=".services.MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

**File: `android/app/src/main/java/com/tbsgroup/app/services/MyFirebaseMessagingService.kt`**

```kotlin
package com.tbsgroup.app.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.tbsgroup.app.MainActivity

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to backend
        registerDeviceToken(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Handle notification
        if (remoteMessage.notification != null) {
            val title = remoteMessage.notification!!.title ?: "Thông báo"
            val body = remoteMessage.notification!!.body ?: ""
            val data = remoteMessage.data
            
            // Show notification on lock screen
            showNotification(title, body, data)
        }
    }

    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "orders"
        
        // Create notification channel for Android 8+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Orders & Alerts",
                NotificationManager.IMPORTANCE_HIGH
            )
            channel.description = "Notifications for orders and alerts"
            channel.enableVibration(true)
            channel.enableLights(true)
            notificationManager.createNotificationChannel(channel)
        }
        
        // Build notification
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_notification_overlay)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(longArrayOf(0, 250, 250, 250))
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }

    private fun registerDeviceToken(token: String) {
        // Call backend API to register token
        // POST /api/notifications/register-device
        // body: { platform: "ANDROID", device_token: token }
    }
}
```

---

### iOS (Swift + UIKit)

**File: `ios/TBSGroupApp/AppDelegate.swift`**

```swift
import UIKit
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        
        // Request user permission for notifications
        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
        
        return true
    }

    // Handle remote notification registration
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("Device Token: \(token)")
        
        // Send to backend
        registerDeviceToken(token)
    }

    // Handle incoming APNs notification
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo
        
        // Show notification even when app is in foreground
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        
        // Extract deep link and navigate
        if let deepLink = userInfo["deepLink"] as? String {
            navigateToDeepLink(deepLink)
        }
        
        completionHandler()
    }

    private func registerDeviceToken(_ token: String) {
        // Call backend API to register token
        // POST /api/notifications/register-device
        // body: { platform: "IOS", device_token: token }
    }

    private func navigateToDeepLink(_ link: String) {
        // Handle navigation based on deepLink
        // e.g., /work/orders/OR-123 → Navigate to order detail
    }
}
```

---

## 5️⃣ INTEGRATION CHECKLIST

- [ ] Database migration created and executed
- [ ] NotificationDispatcher service implemented
- [ ] BullMQ queue initialized with FCM/APNs handlers
- [ ] REST API endpoints created
- [ ] Firebase service account JSON configured
- [ ] Android app Firebase setup complete
- [ ] iOS app APNs certificates configured
- [ ] Order service updated to trigger notifications
- [ ] SLA engine updated to send alerts
- [ ] Kaizen system updated
- [ ] Business trip system updated
- [ ] Room booking system updated
- [ ] Tests written for all components
- [ ] Documentation updated
- [ ] Deployed to production

---

## 6️⃣ DEPLOYMENT STEPS

1. **Setup Firebase Project**
   - Create Firebase project
   - Download service account JSON
   - Store securely in backend config

2. **Setup iOS APNs**
   - Create Apple Developer certificates
   - Configure in Firebase Console
   - Add to iOS app bundle

3. **Deploy Backend**
   - Run Prisma migration
   - Deploy NotificationDispatcher & queue
   - Test endpoints with Postman

4. **Deploy Mobile Apps**
   - Build & test Android app with FCM
   - Build & test iOS app with APNs
   - Submit to app stores

5. **Integrate Event Sources**
   - Update all services to call NotificationDispatcher
   - Test end-to-end flows
   - Monitor queue for errors

---

**Ready for Implementation** ✅

