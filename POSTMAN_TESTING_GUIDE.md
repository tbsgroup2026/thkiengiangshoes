# 📮 POSTMAN TESTING GUIDE - Push Notifications Phase 1

**Date**: August 23, 2026  
**Purpose**: Test all push notification endpoints after backend setup  
**Estimated Time**: 15-20 minutes

---

## 📋 PRE-TESTING CHECKLIST

Before starting, ensure:

- ✅ Backend server is running (`npm run dev` in backend folder)
- ✅ PostgreSQL/SQLite database is accessible
- ✅ Redis server is running (for queue)
- ✅ Prisma migration has been run (`npx prisma migrate deploy`)
- ✅ All npm dependencies installed (`npm install`)
- ✅ You have a valid JWT token from authentication
- ✅ Postman is installed and open

---

## 🚀 STEP-BY-STEP TESTING

### Step 1: Import Postman Collection

1. Open Postman
2. Click **"Import"** button (top left)
3. Select **"File"** tab
4. Upload: `POSTMAN_TEST_COLLECTION.json`
5. Click **"Import"**

✅ You should now see a collection called "TBS II Push Notifications - Phase 1 Testing"

---

### Step 2: Configure Variables

In Postman, set these environment variables:

1. Click **"Variables"** (top left)
2. Set these values:

| Variable | Value | Example |
|----------|-------|---------|
| `base_url` | Your backend URL | `http://localhost:3000` |
| `token` | Your JWT token | `eyJhbGc...` (from login) |

---

### Step 3: Test Device Registration

#### Test 3A: Register Android Device

1. Go to **"Device Management"** folder
2. Click **"Register Device Token (Android)"**
3. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "device_token_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "platform": "ANDROID",
    "device_name": "Samsung Galaxy S23",
    "registered_at": "2026-08-23T12:34:56.000Z"
  }
}
```

✅ **Status**: PASS if HTTP 200 and `success: true`

#### Test 3B: Register iOS Device

1. Click **"Register Device Token (iOS)"**
2. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "device_token_id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "user-123",
    "platform": "IOS",
    "device_name": "iPhone 14 Pro",
    "registered_at": "2026-08-23T12:34:57.000Z"
  }
}
```

✅ **Status**: PASS if HTTP 200 and `success: true`

---

### Step 4: Get User Devices

1. Go to **"Device Management"** folder
2. Click **"Get User Devices"**
3. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "platform": "ANDROID",
      "device_name": "Samsung Galaxy S23",
      "device_id": "device-uuid-android-001",
      "is_active": true,
      "last_used_at": "2026-08-23T12:34:56.000Z",
      "created_at": "2026-08-23T12:34:56.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "platform": "IOS",
      "device_name": "iPhone 14 Pro",
      "device_id": "device-uuid-ios-002",
      "is_active": true,
      "last_used_at": "2026-08-23T12:34:57.000Z",
      "created_at": "2026-08-23T12:34:57.000Z"
    }
  ]
}
```

✅ **Status**: PASS if you see 2 devices

**💡 Tip**: Save the first device ID (Android) to test unregister later

---

### Step 5: Send Test Notifications

#### Test 5A: Send ORDER Notification

1. Go to **"Notification Management"** folder
2. Click **"Send Test Notification (ORDER)"**
3. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Test notification queued successfully",
  "data": {
    "success": true,
    "processed": 1,
    "details": [
      {
        "userId": "user-123",
        "success": true,
        "notificationId": "550e8400-e29b-41d4-a716-446655440002",
        "devicesQueued": 2,
        "jobIds": [
          "job-fcm-550e8400-e29b-41d4-a716-446655440002",
          "job-apns-550e8400-e29b-41d4-a716-446655440002"
        ]
      }
    ]
  }
}
```

✅ **Status**: PASS if `success: true` and `devicesQueued: 2`

**🔍 What happened**:
- Notification created in database
- Added to queue for Android (FCM) and iOS (APNs)
- Both queued successfully (mock mode in dev)

#### Test 5B: Send CRITICAL ALERT Notification

1. Click **"Send Test Notification (ALERT - CRITICAL)"**
2. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Test notification queued successfully",
  "data": {
    "success": true,
    "processed": 1,
    "details": [...]
  }
}
```

✅ **Status**: PASS if `success: true`

#### Test 5C: Send KAIZEN Notification

1. Click **"Send Test Notification (KAIZEN)"**
2. Click **"Send"**

✅ **Status**: PASS if `success: true`

#### Test 5D: Send BOOKING Notification

1. Click **"Send Test Notification (BOOKING)"**
2. Click **"Send"**

✅ **Status**: PASS if `success: true`

---

### Step 6: Get Notification History

1. Go to **"Notification Management"** folder
2. Click **"Get Notification History"**
3. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "title": "✅ Phòng họp đã được xác nhận",
      "body": "Phòng A3 - Thứ Ba, 24/08/2026 từ 14:00-15:30",
      "type": "BOOKING",
      "priority": "LOW",
      "status": "PENDING",
      "data": {
        "action": "open_booking",
        "deepLink": "/bookings/booking-789",
        "bookingId": "booking-789",
        "roomName": "A3"
      },
      "created_at": "2026-08-23T12:35:00.000Z",
      "sent_at": null,
      "read_at": null
    },
    ...more notifications...
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 4
  }
}
```

✅ **Status**: PASS if you see all 4 notifications (ORDER, ALERT, KAIZEN, BOOKING)

---

### Step 7: Mark Notification as Read

1. Copy a `notification_id` from the history response above
2. Go to **"Notification Management"** folder
3. Click **"Mark Notification as Read"**
4. Replace `{{notification_id}}` with the copied ID
5. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "status": "READ",
    "readAt": "2026-08-23T12:35:15.000Z"
  }
}
```

✅ **Status**: PASS if `status: "READ"` and `readAt` is set

---

### Step 8: Get Preferences

1. Go to **"Preferences Management"** folder
2. Click **"Get Notification Preferences"**
3. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "push_enabled": true,
    "email_enabled": true,
    "sms_enabled": false,
    "channel_types": [
      "ORDER",
      "ALERT",
      "KAIZEN",
      "BOOKING",
      "SLA",
      "DOCUMENT",
      "CHAT",
      "NEWS",
      "INCIDENT",
      "BUSINESS_TRIP"
    ]
  }
}
```

✅ **Status**: PASS if `push_enabled: true`

---

### Step 9: Update Preferences

#### Test 9A: Disable Push Notifications

1. Click **"Update Preferences (Disable Push)"**
2. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "userId": "user-123",
    "pushEnabled": false,
    "emailEnabled": true,
    "smsEnabled": false,
    "channelTypes": "ORDER,ALERT"
  }
}
```

✅ **Status**: PASS if `pushEnabled: false`

#### Test 9B: Re-enable All Preferences

1. Click **"Update Preferences (Enable All)"**
2. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "userId": "user-123",
    "pushEnabled": true,
    "emailEnabled": true,
    "smsEnabled": false,
    "channelTypes": "ORDER,ALERT,KAIZEN,..."
  }
}
```

✅ **Status**: PASS if `pushEnabled: true`

---

### Step 10: Queue Statistics

1. Go to **"Monitoring & Health"** folder
2. Click **"Queue Statistics"**
3. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "queue_stats": {
      "waiting": 0,
      "active": 0,
      "completed": 4,
      "failed": 0,
      "delayed": 0
    },
    "recent_jobs": [
      {
        "id": "1",
        "type": "SEND_FCM",
        "status": "completed",
        "attempts": 1
      },
      ...more jobs...
    ]
  }
}
```

✅ **Status**: PASS if `completed: 4` (from 4 notifications sent)

---

### Step 11: Test Error Cases

#### Test 11A: No Active Devices

After registering devices earlier, if you want to test this:

1. Delete a device via the database
2. Go to **"Error Cases"** folder
3. Click **"Send to User with No Devices"**
4. Click **"Send"**

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "processed": 1,
  "details": [
    {
      "userId": "user-123",
      "success": false,
      "reason": "No active devices"
    }
  ]
}
```

✅ **Status**: PASS if `success: false` with `reason: "No active devices"`

#### Test 11B: Missing Required Fields

1. Click **"Register with Missing Fields"**
2. Click **"Send"**

**Expected Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Missing required fields: platform, device_token"
}
```

✅ **Status**: PASS if HTTP 400

#### Test 11C: Invalid Platform

1. Click **"Register with Invalid Platform"**
2. Click **"Send"**

**Expected Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid platform. Must be ANDROID or IOS"
}
```

✅ **Status**: PASS if HTTP 400

---

## 📊 TEST SUMMARY

Print or screenshot this table and fill in after each test:

| # | Test | Expected | Actual | Status |
|---|------|----------|--------|--------|
| 1 | Register Android Device | HTTP 200 | __ | __ |
| 2 | Register iOS Device | HTTP 200 | __ | __ |
| 3 | Get User Devices | 2 devices | __ | __ |
| 4 | Send ORDER Notification | HTTP 200 | __ | __ |
| 5 | Send ALERT Notification | HTTP 200 | __ | __ |
| 6 | Send KAIZEN Notification | HTTP 200 | __ | __ |
| 7 | Send BOOKING Notification | HTTP 200 | __ | __ |
| 8 | Get Notification History | 4 items | __ | __ |
| 9 | Mark as Read | READ status | __ | __ |
| 10 | Get Preferences | push_enabled: true | __ | __ |
| 11 | Disable Preferences | push_enabled: false | __ | __ |
| 12 | Re-enable Preferences | push_enabled: true | __ | __ |
| 13 | Queue Stats | completed: 4+ | __ | __ |
| 14 | Error: Missing Fields | HTTP 400 | __ | __ |
| 15 | Error: Invalid Platform | HTTP 400 | __ | __ |

**Total**: 15 tests  
**Passing**: __ / 15  
**Date Tested**: __________

---

## 🎯 SUCCESS CRITERIA

Phase 1 testing is **COMPLETE** when:

- ✅ All 15 tests pass
- ✅ No HTTP 5xx errors
- ✅ All responses have correct JSON structure
- ✅ Notifications appear in database
- ✅ Queue shows completed jobs
- ✅ Preferences update correctly
- ✅ Error handling works as expected

---

## 📝 NOTES FOR TESTING

### Important

1. **Authentication**: All requests require `Bearer {{token}}` header
   - If you get "401 Unauthorized", your token may be expired
   - Login again and get a new token

2. **Mock Mode**: In development without Firebase credentials, notifications are mocked
   - This is expected and fine for testing
   - Real FCM/APNs sending requires Firebase configuration
   - See `PUSH_NOTIFICATION_IMPLEMENTATION.md` for production setup

3. **Database**: Notifications are persisted in database
   - Query the `PushNotification` table to verify
   - Check `DeviceToken` table for registered devices
   - Check `NotificationPreference` table for preferences

4. **Queue**: Jobs are processed immediately in mock mode
   - In production with real Firebase, they're processed async
   - Use Queue Stats endpoint to monitor

5. **Variables**: Remember to set `base_url` and `token` variables
   - These are used in all requests
   - {{variable_name}} syntax is Postman's way to substitute

---

## 🔍 DEBUGGING

If a test fails:

1. **Check Response Status Code**:
   - 200 = OK
   - 400 = Bad Request (check your JSON)
   - 401 = Unauthorized (check token)
   - 500 = Server Error (check backend logs)

2. **Check Response Body**:
   - Look for `success: false` messages
   - Read the error message carefully
   - Search `PUSH_NOTIFICATION_IMPLEMENTATION.md` troubleshooting section

3. **Check Backend Logs**:
   - Look for `❌` error symbols
   - Look for `✅` success symbols
   - Check Prisma/database errors

4. **Restart Services**:
   - Restart backend: `npm run dev`
   - Restart Redis: `redis-server`
   - Retry the test

---

## ✅ AFTER TESTING

When all 15 tests pass:

1. ✅ Take screenshots of test results
2. ✅ Document any issues encountered
3. ✅ Report success to team
4. ✅ Proceed to Option 2: Service Integration

---

## 📞 SUPPORT

**Issues during testing?**

- Check: `PUSH_NOTIFICATION_IMPLEMENTATION.md` for setup issues
- Check: `IMPLEMENTATION_STATUS.md` for what's installed
- Check: Backend console for error messages
- Contact: Development team with error details

---

**Estimated Time**: 15-20 minutes  
**Difficulty**: Easy (all Postman clicks)  
**No Coding Required**: ✅ Just click "Send"

**Ready to test?** Let's go! 🚀
