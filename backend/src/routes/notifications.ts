import express, { Request, Response } from 'express';
import prisma from '../utils/prisma';
import NotificationDispatcher from '../services/NotificationDispatcher';
import { getQueueStats, getRecentJobs } from '../services/NotificationQueue';

const router = express.Router();

/**
 * Middleware to authenticate token
 * Assumes token is validated and user attached to req
 */
function authenticateToken(req: Request, res: Response, next: Function) {
  // This assumes you have middleware that sets req.user
  // If not, you can implement JWT validation here
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
    });
  }
  
  // In a real app, verify the JWT here
  // For now, we'll assume it's validated in main.ts middleware
  next();
}

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * ============ SEND NOTIFICATION TO SPECIFIC USER(S) ============
 */

/**
 * POST /api/notifications
 * Create a notification and send to specific user(s) or groups
 * 
 * Body:
 * {
 *   "title": "Thông báo tiêu đề",
 *   "message": "Nội dung thông báo",
 *   "type": "INFO | WARNING | SUCCESS | GEMBA | KAIZEN",
 *   "targetUser": "username | emp_code | 'Ban Giám Đốc' | 'ALL'",
 *   "link": "/path/to/page"
 * }
 * 
 * Nếu targetUser = "ALL" thì gửi đến toàn bộ
 * Nếu targetUser = tên nhóm/phòng ban thì gửi đến nhóm đó
 * Nếu targetUser = tên/mã nhân viên cụ thể thì chỉ gửi đến người đó
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, message, type, targetUser, link } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, message'
      });
    }
    
    const notificationType = type || 'INFO';
    const targetUserStr = targetUser || 'ALL';
    const notificationLink = link || '/work';
    
    // Tạo notification record trong D1 Database
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: notificationType,
        targetUser: targetUserStr,
        link: notificationLink,
        isRead: false,
        createdAt: new Date()
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        id: notification.id,
        title: notification.title,
        targetUser: notification.targetUser,
        createdAt: notification.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/notifications
 * Get notifications for current user filtered by targetUser
 * 
 * Query params:
 * - limit: number of notifications (default: 50)
 * - offset: pagination offset (default: 0)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Lấy thông tin user hiện tại (từ context hoặc session)
    // Tạm thời trả về tất cả notifications
    const notifications = await prisma.notification.findMany({
      take: parseInt(limit as string) || 50,
      skip: parseInt(offset as string) || 0,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const total = await prisma.notification.count();
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit as string) || 50,
        offset: parseInt(offset as string) || 0
      }
    });
  } catch (error: any) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * ============ DEVICE TOKEN MANAGEMENT ============
 */

/**
 * POST /api/notifications/register-device
 * Register a new device token for receiving push notifications
 * 
 * Body:
 * {
 *   "platform": "ANDROID" | "IOS",
 *   "device_token": "fcm_token_here",
 *   "device_id": "unique_device_id",
 *   "device_name": "iPhone 14 Pro"
 * }
 */
router.post('/register-device', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found in token'
      });
    }

    const { platform, device_token, device_id, device_name } = req.body;
    
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
    
    const deviceToken = await NotificationDispatcher.registerDeviceToken(
      userId,
      platform as 'ANDROID' | 'IOS',
      device_token,
      device_id,
      device_name
    );
    
    res.status(200).json({
      success: true,
      message: 'Device registered successfully',
      data: {
        device_token_id: deviceToken.id,
        user_id: deviceToken.userId,
        platform: deviceToken.platform,
        device_name: deviceToken.deviceName,
        registered_at: deviceToken.createdAt
      }
    });
  } catch (error: any) {
    console.error('❌ Register device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * DELETE /api/notifications/unregister-device/:deviceId
 * Unregister (deactivate) a device token
 */
router.delete('/unregister-device/:deviceId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { deviceId } = req.params;
    
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
    
    await NotificationDispatcher.unregisterDeviceToken(deviceId);
    
    res.json({
      success: true,
      message: 'Device unregistered successfully'
    });
  } catch (error: any) {
    console.error('❌ Unregister device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/notifications/devices
 * Get all active devices for the current user
 */
router.get('/devices', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const devices = await NotificationDispatcher.getUserDevices(userId);
    
    res.json({
      success: true,
      data: devices.map(d => ({
        id: d.id,
        platform: d.platform,
        device_name: d.deviceName,
        device_id: d.deviceId,
        is_active: d.isActive,
        last_used_at: d.lastUsedAt,
        created_at: d.createdAt
      }))
    });
  } catch (error: any) {
    console.error('❌ Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * ============ NOTIFICATION HISTORY & STATUS ============
 */

/**
 * GET /api/notifications/history
 * Get notification history for the current user
 * 
 * Query params:
 * - limit: number of notifications (default: 20)
 * - offset: pagination offset (default: 0)
 * - type: filter by notification type (ORDER, ALERT, KAIZEN, etc.)
 * - status: filter by status (PENDING, SENT, DELIVERED, FAILED, READ)
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { limit = 20, offset = 0, type, status } = req.query;
    
    const history = await NotificationDispatcher.getHistory(userId, {
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
      type: type as string,
      status: status as string
    });
    
    res.json({
      success: true,
      data: history.data.map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        priority: n.priority,
        status: n.status,
        data: n.data,
        created_at: n.createdAt,
        sent_at: n.sentAt,
        read_at: n.readAt
      })),
      pagination: history.pagination
    });
  } catch (error: any) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/:notificationId/read
 * Mark a notification as read
 */
router.post('/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { notificationId } = req.params;
    
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
      message: 'Notification marked as read',
      data: updated
    });
  } catch (error: any) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * ============ NOTIFICATION PREFERENCES ============
 */

/**
 * GET /api/notifications/preferences
 * Get notification preferences for the current user
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
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
          channelTypes: 'ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT,CHAT,NEWS,INCIDENT,BUSINESS_TRIP'
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
  } catch (error: any) {
    console.error('❌ Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for the current user
 * 
 * Body:
 * {
 *   "push_enabled": true,
 *   "email_enabled": true,
 *   "sms_enabled": false,
 *   "channel_types": ["ORDER", "ALERT", "KAIZEN"]
 * }
 */
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { push_enabled, email_enabled, sms_enabled, channel_types } = req.body;
    
    const updated = await NotificationDispatcher.updatePreferences(userId, {
      pushEnabled: push_enabled,
      emailEnabled: email_enabled,
      smsEnabled: sms_enabled,
      channelTypes: channel_types
    });
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updated
    });
  } catch (error: any) {
    console.error('❌ Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * ============ TEST ENDPOINT (FOR POSTMAN TESTING) ============
 */

/**
 * POST /api/notifications/test
 * Send a test notification manually (for development/testing)
 * 
 * Body:
 * {
 *   "type": "ORDER",
 *   "title": "Test Notification",
 *   "body": "This is a test notification",
 *   "priority": "HIGH",
 *   "data": {
 *     "deepLink": "/orders/123",
 *     "orderId": "OR-2026-08-001"
 *   }
 * }
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { type, title, body, priority, data } = req.body;
    
    if (!type || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, title, body'
      });
    }
    
    console.log(`📬 Test notification request from user ${userId}:`);
    console.log(`   Type: ${type}`);
    console.log(`   Title: ${title}`);
    console.log(`   Body: ${body}`);
    
    const result = await NotificationDispatcher.send({
      userId,
      type: type as any,
      title,
      body,
      priority: priority || 'MEDIUM',
      data
    });
    
    res.json({
      success: true,
      message: 'Test notification queued successfully',
      data: result
    });
  } catch (error: any) {
    console.error('❌ Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * ============ QUEUE HEALTH CHECK (INTERNAL) ============
 */

/**
 * GET /api/notifications/queue/stats
 * Get notification queue statistics (for monitoring)
 * Returns: waiting, active, completed, failed, delayed job counts
 */
router.get('/queue/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getQueueStats();
    const recentJobs = await getRecentJobs(10);
    
    res.json({
      success: true,
      data: {
        queue_stats: stats,
        recent_jobs: recentJobs
      }
    });
  } catch (error: any) {
    console.error('❌ Queue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue stats'
    });
  }
});

export default router;
