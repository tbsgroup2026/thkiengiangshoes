/**
 * Unit Tests for NotificationDispatcher Service
 * 
 * Tests cover:
 * - Device token registration
 * - Notification sending with preference checking
 * - Device grouping by platform
 * - Error handling
 * - Mock FCM/APNs responses
 */

import { PrismaClient } from '@prisma/client';
import NotificationDispatcher, { NotificationParams } from './NotificationDispatcher';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    },
    deviceToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    pushNotification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    notificationPreference: {
      findUnique: jest.fn(),
      upsert: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('NotificationDispatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  // ============ TEST: Send Notification Success ============
  
  describe('send()', () => {
    it('should successfully send notification to single user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        notificationPref: {
          pushEnabled: true,
          channelTypes: 'ORDER,ALERT'
        }
      };

      const mockDevices = [
        {
          id: 'device-1',
          userId: 'user-123',
          platform: 'ANDROID',
          token: 'fcm-token-123',
          isActive: true
        },
        {
          id: 'device-2',
          userId: 'user-123',
          platform: 'IOS',
          token: 'apns-token-456',
          isActive: true
        }
      ];

      const mockNotification = {
        id: 'notif-123',
        userId: 'user-123',
        title: 'Test Order',
        body: 'New order received',
        type: 'ORDER',
        status: 'PENDING',
        createdAt: new Date()
      };

      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.deviceToken.findMany as jest.Mock).mockResolvedValue(mockDevices);
      (prisma.pushNotification.create as jest.Mock).mockResolvedValue(mockNotification);

      // Execute
      const params: NotificationParams = {
        userId: 'user-123',
        type: 'ORDER',
        title: 'Test Order',
        body: 'New order received',
        priority: 'HIGH'
      };

      const result = await NotificationDispatcher.send(params);

      // Assert
      expect(result.success).toBe(true);
      expect(result.processed).toBe(1);
      expect(result.details[0].success).toBe(true);
      expect(result.details[0].devicesQueued).toBe(2);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: { notificationPref: true }
      });
    });

    it('should handle multiple users', async () => {
      const mockUser1 = {
        id: 'user-1',
        notificationPref: { pushEnabled: true, channelTypes: 'ORDER' }
      };
      const mockUser2 = {
        id: 'user-2',
        notificationPref: { pushEnabled: true, channelTypes: 'ORDER' }
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);

      (prisma.deviceToken.findMany as jest.Mock)
        .mockResolvedValueOnce([{ id: 'd1', platform: 'ANDROID' }])
        .mockResolvedValueOnce([{ id: 'd2', platform: 'IOS' }]);

      (prisma.pushNotification.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'n1' })
        .mockResolvedValueOnce({ id: 'n2' });

      const result = await NotificationDispatcher.send({
        userId: ['user-1', 'user-2'],
        type: 'ORDER',
        title: 'Test',
        body: 'Test body'
      });

      expect(result.processed).toBe(2);
      expect(result.details).toHaveLength(2);
    });
  });

  // ============ TEST: Preference Checking ============
  
  describe('preference checking', () => {
    it('should skip sending if push notifications are disabled', async () => {
      const mockUser = {
        id: 'user-123',
        notificationPref: {
          pushEnabled: false,  // Disabled
          channelTypes: 'ORDER,ALERT'
        }
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await NotificationDispatcher.send({
        userId: 'user-123',
        type: 'ORDER',
        title: 'Test',
        body: 'Test'
      });

      expect(result.details[0].success).toBe(false);
      expect(result.details[0].reason).toBe('Push notifications disabled');
      expect(prisma.deviceToken.findMany).not.toHaveBeenCalled();
    });

    it('should skip sending if channel type is not enabled', async () => {
      const mockUser = {
        id: 'user-123',
        notificationPref: {
          pushEnabled: true,
          channelTypes: 'ORDER,ALERT'  // KAIZEN not in list
        }
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await NotificationDispatcher.send({
        userId: 'user-123',
        type: 'KAIZEN',  // Not in enabled types
        title: 'Test',
        body: 'Test'
      });

      expect(result.details[0].success).toBe(false);
      expect(result.details[0].reason).toContain('Channel type KAIZEN not enabled');
    });
  });

  // ============ TEST: No Devices ============
  
  describe('device handling', () => {
    it('should fail gracefully when user has no active devices', async () => {
      const mockUser = {
        id: 'user-123',
        notificationPref: {
          pushEnabled: true,
          channelTypes: 'ORDER'
        }
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.deviceToken.findMany as jest.Mock).mockResolvedValue([]); // No devices

      const result = await NotificationDispatcher.send({
        userId: 'user-123',
        type: 'ORDER',
        title: 'Test',
        body: 'Test'
      });

      expect(result.details[0].success).toBe(false);
      expect(result.details[0].reason).toBe('No active devices');
    });

    it('should group devices by platform', async () => {
      const mockUser = {
        id: 'user-123',
        notificationPref: {
          pushEnabled: true,
          channelTypes: 'ORDER'
        }
      };

      const mockDevices = [
        { id: 'd1', platform: 'ANDROID' },
        { id: 'd2', platform: 'IOS' },
        { id: 'd3', platform: 'ANDROID' }
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.deviceToken.findMany as jest.Mock).mockResolvedValue(mockDevices);
      (prisma.pushNotification.create as jest.Mock).mockResolvedValue({ id: 'n1' });

      const result = await NotificationDispatcher.send({
        userId: 'user-123',
        type: 'ORDER',
        title: 'Test',
        body: 'Test'
      });

      expect(result.details[0].devicesQueued).toBe(3);
      expect(result.details[0].jobIds).toContain('job-fcm-n1'); // FCM for Android
      expect(result.details[0].jobIds).toContain('job-apns-n1'); // APNs for iOS
    });
  });

  // ============ TEST: User Not Found ============
  
  describe('error handling', () => {
    it('should fail when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await NotificationDispatcher.send({
        userId: 'nonexistent-user',
        type: 'ORDER',
        title: 'Test',
        body: 'Test'
      });

      expect(result.details[0].success).toBe(false);
      expect(result.details[0].reason).toBe('User not found');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await NotificationDispatcher.send({
        userId: 'user-123',
        type: 'ORDER',
        title: 'Test',
        body: 'Test'
      });

      expect(result.details[0].success).toBe(false);
      expect(result.details[0].reason).toContain('Database connection failed');
    });
  });

  // ============ TEST: Notification History ============
  
  describe('getHistory()', () => {
    it('should retrieve notification history with pagination', async () => {
      const mockNotifications = [
        {
          id: 'n1',
          title: 'Order 1',
          type: 'ORDER',
          status: 'SENT',
          createdAt: new Date()
        },
        {
          id: 'n2',
          title: 'Alert 1',
          type: 'ALERT',
          status: 'READ',
          createdAt: new Date()
        }
      ];

      (prisma.pushNotification.findMany as jest.Mock).mockResolvedValue(mockNotifications);
      (prisma.pushNotification.count as jest.Mock).mockResolvedValue(2);

      const result = await NotificationDispatcher.getHistory('user-123', {
        limit: 20,
        offset: 0
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        limit: 20,
        offset: 0,
        total: 2
      });
    });

    it('should filter by notification type', async () => {
      (prisma.pushNotification.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pushNotification.count as jest.Mock).mockResolvedValue(0);

      await NotificationDispatcher.getHistory('user-123', {
        type: 'ORDER'
      });

      expect(prisma.pushNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'ORDER' })
        })
      );
    });
  });

  // ============ TEST: Mark as Read ============
  
  describe('markAsRead()', () => {
    it('should mark notification as read with timestamp', async () => {
      const mockUpdated = {
        id: 'notif-123',
        status: 'READ',
        readAt: new Date()
      };

      (prisma.pushNotification.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await NotificationDispatcher.markAsRead('notif-123');

      expect(result.status).toBe('READ');
      expect(result.readAt).toBeDefined();
      expect(prisma.pushNotification.update).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        data: expect.objectContaining({
          status: 'READ'
        })
      });
    });
  });

  // ============ TEST: Update Preferences ============
  
  describe('updatePreferences()', () => {
    it('should update notification preferences', async () => {
      const mockPrefs = {
        userId: 'user-123',
        pushEnabled: false,
        channelTypes: 'ORDER'
      };

      (prisma.notificationPreference.upsert as jest.Mock).mockResolvedValue(mockPrefs);

      const result = await NotificationDispatcher.updatePreferences('user-123', {
        pushEnabled: false,
        channelTypes: ['ORDER']
      });

      expect(result.pushEnabled).toBe(false);
      expect(prisma.notificationPreference.upsert).toHaveBeenCalled();
    });

    it('should create preferences if they do not exist', async () => {
      (prisma.notificationPreference.upsert as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        pushEnabled: true
      });

      await NotificationDispatcher.updatePreferences('user-123', {});

      expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.any(Object),
          update: expect.any(Object)
        })
      );
    });
  });

  // ============ TEST: Register Device Token ============
  
  describe('registerDeviceToken()', () => {
    it('should create new device token', async () => {
      const mockToken = {
        id: 'token-123',
        userId: 'user-123',
        platform: 'ANDROID',
        token: 'fcm-token-xyz'
      };

      (prisma.deviceToken.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.deviceToken.create as jest.Mock).mockResolvedValue(mockToken);

      const result = await NotificationDispatcher.registerDeviceToken(
        'user-123',
        'ANDROID',
        'fcm-token-xyz',
        'device-id-1',
        'iPhone 14'
      );

      expect(result.id).toBe('token-123');
      expect(result.platform).toBe('ANDROID');
    });

    it('should update existing device token', async () => {
      const existing = { id: 'token-456' };
      const mockUpdated = {
        id: 'token-456',
        isActive: true,
        failureCount: 0
      };

      (prisma.deviceToken.findFirst as jest.Mock).mockResolvedValue(existing);
      (prisma.deviceToken.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await NotificationDispatcher.registerDeviceToken(
        'user-123',
        'IOS',
        'apns-token-abc'
      );

      expect(result.id).toBe('token-456');
      expect(prisma.deviceToken.update).toHaveBeenCalled();
    });
  });

  // ============ TEST: Unregister Device Token ============
  
  describe('unregisterDeviceToken()', () => {
    it('should deactivate device token', async () => {
      const mockDeactivated = {
        id: 'token-123',
        isActive: false
      };

      (prisma.deviceToken.update as jest.Mock).mockResolvedValue(mockDeactivated);

      const result = await NotificationDispatcher.unregisterDeviceToken('token-123');

      expect(result.isActive).toBe(false);
      expect(prisma.deviceToken.update).toHaveBeenCalledWith({
        where: { id: 'token-123' },
        data: { isActive: false }
      });
    });
  });

  // ============ TEST: Get User Devices ============
  
  describe('getUserDevices()', () => {
    it('should retrieve active devices for user', async () => {
      const mockDevices = [
        { id: 'd1', platform: 'ANDROID', lastUsedAt: new Date() },
        { id: 'd2', platform: 'IOS', lastUsedAt: new Date() }
      ];

      (prisma.deviceToken.findMany as jest.Mock).mockResolvedValue(mockDevices);

      const result = await NotificationDispatcher.getUserDevices('user-123');

      expect(result).toHaveLength(2);
      expect(prisma.deviceToken.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
            isActive: true
          })
        })
      );
    });
  });
});
