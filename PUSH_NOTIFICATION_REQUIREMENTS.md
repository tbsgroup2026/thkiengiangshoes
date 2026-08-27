# 📋 BƯỚC 2: YÊU CẦU CHỨC NĂNG - Push Notification System

**Date**: August 23, 2026  
**Status**: ✅ SPECIFICATION COMPLETE

---

## 1️⃣ TỔNG QUAN YÊU CẦU

### Mục Đích
Xây dựng hệ thống gửi **toàn bộ thông báo của hệ thống** (đơn hàng, cảnh báo, tin nhắn nội bộ, sự kiện chuỗi cửa hàng) ra **thông báo đẩy (push notification)** hiển thị trên **màn hình khóa điện thoại** của người dùng, như banner "🔔 Thông Báo Chuỗi SKECHERS from SKECHERS-TBS" trong ảnh mẫu.

### Yêu Cầu Cốt Lõi
Mỗi push notification phải hiển thị:
- ✅ **Icon**: Biểu tượng nguồn gửi (TBS, Order, SLA, Alert, etc.)
- ✅ **Title**: Tên chuỗi/nguồn thông báo (ví dụ: "Thông Báo Chuỗi SKECHERS", "Cảnh báo SLA", "Đơn hàng mới")
- ✅ **Body**: Nội dung ngắn gọn (ví dụ: "Đã có sự cố dừng máy Line 2 — Xưởng 1", "Bạn có công tác mới")
- ✅ **Timestamp**: Thời gian gửi (bây giờ / X phút trước)

### Phạm Vi Thông Báo
Các loại sự kiện cần gửi push:

| Event Type | Source | Example | Target Users | Priority |
|-----------|--------|---------|--------------|----------|
| **New Order** | orders.py | "Có đơn hàng mới: OR-2026-08-001" | Warehouse, QC, Production | HIGH |
| **SLA Alert** | sla_engine.py | "SLA gần hết hạn: Document XXX còn 2h" | Department Manager, Handler | CRITICAL |
| **Machine Issue** | incidents.py | "Sự cố dừng máy Line 2 — Xưởng 1" | Maintenance, Factory Manager | HIGH |
| **Kaizen Submission** | web/KaizenPublicSubmitForm | "Có ý tưởng cải tiến mới từ Công Nhân" | CI Team, Department Lead | MEDIUM |
| **Business Trip** | business-trip page | "Đề xuất công tác cần duyệt" | Manager, Director | MEDIUM |
| **Room Booking** | room_bookings.py | "Phòng họp đã được xác nhận" | Booker | LOW |
| **Document Workflow** | workflow | "Tài liệu cần bạn duyệt: HR-2026-08-XXX" | Assignee | MEDIUM |
| **Department News** | news.py | "Tin tức từ Văn phòng chuỗi" | All Dept Staff | LOW |
| **Team Chat** | chat.ts | "Tin nhắn mới từ Leader" | Chat Members | MEDIUM |
| **AI Response** | ai-chat.ts | "Trợ lý AI đã trả lời câu hỏi của bạn" | User | LOW |

---

## 2️⃣ LUỒNG CHỨC NĂNG CHI TIẾT

### Use Case 1: Gửi Push khi có Đơn Hàng Mới

**Actors**: System, User (Warehouse Staff, QC, Production)

**Flow**:
```
1. Hệ thống tạo Order mới (POST /api/orders)
2. Order service trigger event: "ORDER_CREATED"
3. NotificationDispatcher nhận event
4. Dispatcher query: 
   - Find device_tokens WHERE user_id IN (warehouse_staff, qc_staff, production_staff)
   - Check user notification_preferences.push_enabled = true
   - Filter channel_types contain "ORDER"
5. For each device_token:
   - Build payload: { title: "Đơn hàng mới", body: "OR-2026-08-001 từ SKECHERS" }
   - Send to FCM (if platform = ANDROID)
   - Send to APNs (if platform = IOS)
   - Log to PushNotification table with status = "SENT"
6. FCM/APNs deliver to device
7. Device displays on lock screen
8. User taps → Opens app to order detail
9. App marks as "read" in notification history
```

### Use Case 2: Gửi Push khi SLA Gần Hết Hạn

**Actors**: System, SLA Engine, User (Document Handler)

**Flow**:
```
1. Cron job chạy hàng giờ (sla_engine.py)
2. Check documents: deadline_time - now < 2 hours
3. For each SLA breach:
   - NotificationDispatcher.send({
       userId: handler_id,
       type: "SLA_ALERT",
       priority: "CRITICAL",
       body: "Document XXX còn 2 giờ đến hạn"
     })
4. Same flow as Use Case 1
5. User receives CRITICAL priority notification
```

### Use Case 3: Gửi Push khi Có Ý Tưởng Cải Tiến Mới

**Actors**: User (Kaizen Submitter), System, CI Manager

**Flow**:
```
1. User submits Kaizen idea (web/KaizenPublicSubmitForm.tsx)
2. Form submit → POST /api/kaizen/submit
3. Backend creates document & triggers event: "KAIZEN_SUBMITTED"
4. NotificationDispatcher.send({
     targetUserIds: [ci_team_lead, department_manager],
     type: "KAIZEN",
     title: "Ý tưởng cải tiến mới",
     body: `"${idea.title}" từ ${submitter.name}`,
     deepLink: "/work/kaizen/detail/" + id
   })
5. Push sent to CI team's devices
6. They receive notification on lock screen
7. Tap → App opens to Kaizen detail page
```

### Use Case 4: Multi-Device User

**Actors**: System, User (có 2 device: iPhone + iPad)

**Flow**:
```
1. User login on iPhone → Register device_token_A
2. User login on iPad → Register device_token_B
3. Event triggered (e.g., SLA alert)
4. NotificationDispatcher finds both tokens
5. Send push to BOTH device_token_A (APNs) AND device_token_B (APNs)
6. Both devices receive notification
7. User reads on iPhone → Mark as read
8. iPad also updates (via sync)
```

---

## 3️⃣ YÊU CẦU CHỨC NĂNG CHI TIẾT

### 3.1 User Registration & Device Token Management

**Endpoint: POST /api/notifications/register-device**
```json
Request:
{
  "platform": "ANDROID|IOS",       // Required: ANDROID or IOS
  "device_token": "fcm_token_xyz", // Required: FCM token or APNs token
  "device_id": "device-uid-123",   // Optional: Unique device identifier
  "device_name": "iPhone 14 Pro",  // Optional: Human readable name
  "user_agent": "..."              // Optional: User agent string
}

Response (200 OK):
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "device_token_id": "dt-uuid-123",
    "user_id": "user-uuid",
    "platform": "IOS",
    "registered_at": "2026-08-23T10:30:00Z"
  }
}
```

**Behavior**:
- ✅ Store device token in `DeviceToken` table
- ✅ If device_id already exists: update token (in case it rotates)
- ✅ Set is_active = true
- ✅ Require authentication (JWT token from header)
- ✅ One user can have multiple device tokens (phone + tablet)

---

**Endpoint: DELETE /api/notifications/unregister-device**
```json
Request:
{
  "device_id": "device-uid-123"  // Optional: if not provided, use current device
}

Response (200 OK):
{
  "success": true,
  "message": "Device unregistered"
}
```

**Behavior**:
- ✅ Set is_active = false (soft delete)
- ✅ Don't delete record (keep history)
- ✅ Or delete by device_token if device_id not provided

---

### 3.2 Sending Push Notifications

**Internal Service: NotificationDispatcher**
```typescript
// Usage inside other services (orders.py, sla_engine.py, etc.)
NotificationDispatcher.send({
  userId: string | string[],        // Single user or array of user IDs
  type: "ORDER" | "ALERT" | "KAIZEN" | "BOOKING" | "SLA" | "DOCUMENT" | "CHAT" | "NEWS",
  title: string,                    // "Thông Báo Chuỗi SKECHERS"
  body: string,                     // "Đã có sự cố dừng máy Line 2"
  data?: {
    action: string,                 // "open_order", "open_kaizen"
    deepLink?: string,              // "/work/orders/OR-123"
    extraData?: Record<string, any>
  },
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL", // Default: MEDIUM
  ttl?: number                      // Time to live in seconds (default: 86400)
})

// Example:
NotificationDispatcher.send({
  userId: ["user-123", "user-456"],
  type: "ORDER",
  title: "Đơn hàng mới",
  body: "Có đơn hàng mới từ SKECHERS: OR-2026-08-001",
  data: {
    action: "open_order",
    deepLink: "/work/orders/OR-2026-08-001",
    orderId: "OR-2026-08-001",
    customerName: "Skechers Vietnam"
  },
  priority: "HIGH"
})
```

**Internal Logic**:
```
NotificationDispatcher.send(params)
  ↓
1. Validate params
2. Normalize userId to array
3. For each userId:
   a. Find all DeviceToken records where user_id = userId AND is_active = true
   b. Check NotificationPreference:
      - push_enabled = true
      - type in channel_types
   c. Group tokens by platform (ANDROID, IOS)
4. For each platform group:
   a. Build FCM/APNs payload
   b. Add to message queue (BullMQ)
   c. Log to PushNotification table (status: PENDING)
5. Return immediately (async processing)
6. Queue worker:
   a. Send to FCM/APNs
   b. Update PushNotification status
   c. Retry if failed (exponential backoff: 1min, 5min, 15min)
   d. Mark as FAILED after 3 retries
```

---

**Endpoint: GET /api/notifications/history**
```json
Request:
{
  "limit": 20,              // Optional: default 20
  "offset": 0,              // Optional: pagination
  "type": "ORDER",          // Optional: filter by type
  "status": "DELIVERED"     // Optional: filter by status
}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid-1",
      "title": "Đơn hàng mới",
      "body": "Có đơn hàng mới từ SKECHERS: OR-2026-08-001",
      "type": "ORDER",
      "status": "DELIVERED",      // PENDING | SENT | DELIVERED | FAILED | READ
      "created_at": "2026-08-23T10:30:00Z",
      "sent_at": "2026-08-23T10:31:00Z",
      "read_at": "2026-08-23T10:35:00Z",
      "data": {
        "deepLink": "/work/orders/OR-2026-08-001",
        "orderId": "OR-2026-08-001"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150
  }
}
```

---

### 3.3 Notification Preferences

**Endpoint: PUT /api/notifications/preferences**
```json
Request:
{
  "push_enabled": true,
  "email_enabled": true,
  "sms_enabled": false,
  "channel_types": ["ORDER", "ALERT", "KAIZEN", "BOOKING"]  // Array of types to receive
}

Response (200 OK):
{
  "success": true,
  "data": {
    "push_enabled": true,
    "email_enabled": true,
    "channel_types": ["ORDER", "ALERT", "KAIZEN"]
  }
}
```

**Endpoint: GET /api/notifications/preferences**
```json
Response (200 OK):
{
  "success": true,
  "data": {
    "push_enabled": true,
    "email_enabled": true,
    "sms_enabled": false,
    "channel_types": ["ORDER", "ALERT", "KAIZEN", "BOOKING", "DOCUMENT"]
  }
}
```

---

### 3.4 Mark Notification as Read

**Endpoint: POST /api/notifications/:id/read**
```json
Response (200 OK):
{
  "success": true,
  "data": {
    "id": "notif-uuid-1",
    "read_at": "2026-08-23T10:35:00Z"
  }
}
```

---

### 3.5 Admin: Send Custom Push

**Endpoint: POST /api/admin/notifications/broadcast** (Admin Only)
```json
Request:
{
  "target": "ALL" | "DEPARTMENT" | "ROLE" | "USER_LIST",
  "department_id": "dept-uuid",    // if target = DEPARTMENT
  "role_id": "role-uuid",           // if target = ROLE
  "user_ids": ["user-1", "user-2"], // if target = USER_LIST
  "title": "Thông báo quan trọng",
  "body": "Bảo trì hệ thống từ 8-10 PM hôm nay",
  "type": "ANNOUNCEMENT"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "broadcast_id": "broadcast-uuid",
    "target_count": 150,
    "queued": 150
  }
}
```

---

## 4️⃣ INTEGRATION POINTS

### 4.1 Order System Integration

**File**: `backend/routers/orders.py` (Python) or `backend/src/routes/...` (Node)

```python
# When order is created
def create_order(order_data):
    order = Order.create(order_data)
    
    # Trigger notification
    NotificationDispatcher.send(
        userId=get_warehouse_and_qc_users(),
        type="ORDER",
        title="Đơn hàng mới",
        body=f"Có đơn hàng từ {order.customer}: {order.code}",
        data={
            "action": "open_order",
            "deepLink": f"/work/orders/{order.id}",
            "orderId": order.id,
            "customerName": order.customer
        },
        priority="HIGH"
    )
    
    return order
```

---

### 4.2 SLA Engine Integration

**File**: `backend/services/sla_engine.py`

```python
# Cron job: Check SLA breaches every hour
def check_sla_breaches():
    documents = Document.query.filter(
        sla_deadline < datetime.now() + timedelta(hours=2),
        status != "COMPLETED"
    ).all()
    
    for doc in documents:
        hours_remaining = (doc.sla_deadline - datetime.now()).total_seconds() / 3600
        
        # Determine priority based on time remaining
        priority = "CRITICAL" if hours_remaining < 1 else "HIGH"
        
        NotificationDispatcher.send(
            userId=doc.current_assignee_id,
            type="SLA",
            title="⚠️ Hạn chót SLA",
            body=f"{doc.title} còn {int(hours_remaining)}h đến hạn",
            data={
                "action": "open_document",
                "deepLink": f"/work/documents/{doc.id}",
                "documentId": doc.id
            },
            priority=priority
        )
```

---

### 4.3 Incident/Machine Alert Integration

**File**: `backend/routers/incidents.py` (Python)

```python
def report_machine_incident(incident_data):
    incident = Incident.create(incident_data)
    machine = incident.machine
    
    # Find maintenance and factory manager
    target_users = get_maintenance_team() + [machine.factory.manager_id]
    
    NotificationDispatcher.send(
        userId=target_users,
        type="ALERT",
        title="🚨 Sự cố thiết bị",
        body=f"{machine.name} tại {machine.area}: {incident.description}",
        data={
            "action": "open_incident",
            "deepLink": f"/work/incidents/{incident.id}",
            "machineId": machine.id
        },
        priority="CRITICAL"
    )
    
    return incident
```

---

### 4.4 Kaizen Submission Integration

**File**: `web/src/modules/ci/KaizenPublicSubmitForm.tsx` (Web)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch("/api/kaizen/submit", {
      method: "POST",
      body: JSON.stringify(form)
    });
    
    if (response.ok) {
      const { data } = await response.json();
      
      // Trigger notification to CI team
      await fetch("/api/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          userIds: getCITeamUsers(),  // CI Manager, Team Lead
          type: "KAIZEN",
          title: "Ý tưởng cải tiến mới",
          body: `"${form.title}" từ ${getUserName()}`,
          data: {
            action: "open_kaizen",
            deepLink: `/work/kaizen/detail/${data.id}`,
            kaizenId: data.id
          },
          priority: "MEDIUM"
        })
      });
      
      showToast("Gửi ý tưởng thành công!");
    }
  } catch (error) {
    showToast("Lỗi: " + error.message);
  }
};
```

---

### 4.5 Room Booking Integration

**File**: `backend/routers/room_bookings.py` (Python)

```python
def confirm_room_booking(booking_id):
    booking = RoomBooking.query.get(booking_id)
    booking.status = "CONFIRMED"
    booking.approved_at = datetime.now()
    db.session.commit()
    
    # Notify booker that room is confirmed
    NotificationDispatcher.send(
        userId=booking.creator_id,
        type="BOOKING",
        title="✅ Phòng họp đã xác nhận",
        body=f"Phòng {booking.room_name} - {booking.booking_date} {booking.time_slot}",
        data={
            "action": "open_booking",
            "deepLink": f"/work/bookings/{booking.id}",
            "bookingId": booking.id
        },
        priority="LOW"
    )
```

---

### 4.6 Business Trip Registration Integration

**File**: `web/src/app/business-trip/page.tsx` (Web)

```typescript
const handleSubmitTrip = async () => {
  try {
    const res = await fetch("/api/business-trip/submit", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      const { data } = await res.json();
      
      // Notify manager
      await fetch("/api/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          userId: getCurrentUserManager(),
          type: "BUSINESS_TRIP",
          title: "Đề xuất công tác cần duyệt",
          body: `${formData.tripName} - Từ ${formData.startDate} đến ${formData.endDate}`,
          data: {
            action: "open_trip",
            deepLink: `/work/business-trip/${data.id}`,
            tripId: data.id
          },
          priority: "MEDIUM"
        })
      });
      
      showToast("Gửi đề xuất công tác thành công!");
    }
  } catch (error) {
    showToast("Lỗi: " + error.message);
  }
};
```

---

## 5️⃣ PAYLOAD FORMAT

### 5.1 FCM Payload (Android)

```json
{
  "notification": {
    "title": "Đơn hàng mới",
    "body": "Có đơn hàng từ SKECHERS: OR-2026-08-001",
    "icon": "ic_notification_tbs",
    "color": "#006838",
    "sound": "default",
    "priority": "high"
  },
  "data": {
    "type": "ORDER",
    "action": "open_order",
    "deepLink": "/work/orders/OR-2026-08-001",
    "orderId": "OR-2026-08-001",
    "timestamp": "2026-08-23T10:30:00Z"
  },
  "android": {
    "priority": "high",
    "notification": {
      "click_action": "FLUTTER_NOTIFICATION_CLICK",
      "channel_id": "orders"
    }
  }
}
```

### 5.2 APNs Payload (iOS)

```json
{
  "aps": {
    "alert": {
      "title": "Đơn hàng mới",
      "body": "Có đơn hàng từ SKECHERS: OR-2026-08-001",
      "sound": "default"
    },
    "badge": 1,
    "sound": "default",
    "category": "ORDER_NOTIFICATION",
    "mutable-content": true,
    "custom-data": {
      "orderId": "OR-2026-08-001",
      "deepLink": "/work/orders/OR-2026-08-001"
    }
  }
}
```

---

## 6️⃣ DATA MODEL REQUIREMENTS

```prisma
model DeviceToken {
  id String @id @default(uuid())
  user_id String
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  platform String // "ANDROID", "IOS"
  token String @unique
  device_id String?
  device_name String?
  
  is_active Boolean @default(true)
  last_used_at DateTime?
  
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  @@index([user_id])
  @@index([platform])
  @@index([is_active])
}

model PushNotification {
  id String @id @default(uuid())
  user_id String
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  title String
  body String
  type String // "ORDER", "ALERT", "KAIZEN", "BOOKING", "SLA", etc.
  status String // "PENDING", "SENT", "DELIVERED", "FAILED", "READ"
  
  data String? // JSON payload: { deepLink, action, etc. }
  
  created_at DateTime @default(now())
  sent_at DateTime?
  delivered_at DateTime?
  read_at DateTime?
  
  @@index([user_id])
  @@index([status])
  @@index([type])
  @@index([created_at])
}

model NotificationPreference {
  id String @id @default(uuid())
  user_id String @unique
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  push_enabled Boolean @default(true)
  email_enabled Boolean @default(true)
  sms_enabled Boolean @default(false)
  
  channel_types String // "ORDER,ALERT,KAIZEN,BOOKING,SLA,DOCUMENT"
  
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  @@index([user_id])
}
```

---

## 7️⃣ QUEUE SYSTEM REQUIREMENTS

Use **BullMQ** (Redis-based job queue):

```typescript
// File: backend/src/services/NotificationQueue.ts
import Bull from 'bull';

const notificationQueue = new Bull('notifications', {
  redis: { host: 'localhost', port: 6379 }
});

// Add job when user or admin triggers notification
notificationQueue.add({
  userId: 'user-123',
  type: 'ORDER',
  title: 'Đơn hàng mới',
  body: '...',
  data: { ... }
}, {
  attempts: 3,                    // Retry 3 times
  backoff: {
    type: 'exponential',
    delay: 2000                   // Start with 2 sec, then 4s, 8s
  },
  removeOnComplete: true
});

// Worker process notifications
notificationQueue.process(async (job) => {
  const { userId, type, title, body, data } = job.data;
  
  try {
    // 1. Find device tokens
    const devices = await DeviceToken.findAll({
      where: { user_id: userId, is_active: true }
    });
    
    // 2. Group by platform
    const androidDevices = devices.filter(d => d.platform === 'ANDROID');
    const iosDevices = devices.filter(d => d.platform === 'IOS');
    
    // 3. Send to FCM (Android)
    if (androidDevices.length > 0) {
      await sendToFCM(androidDevices, { title, body, data });
    }
    
    // 4. Send to APNs (iOS)
    if (iosDevices.length > 0) {
      await sendToAPNs(iosDevices, { title, body, data });
    }
    
    // 5. Update PushNotification status
    await PushNotification.update({
      status: 'SENT',
      sent_at: new Date()
    }, {
      where: { id: job.data.notificationId }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Notification send failed:', error);
    throw error; // Will trigger retry
  }
});
```

---

## 8️⃣ SECURITY & RATE LIMITING

- ✅ Device token endpoint: **Rate limit 5 requests/min per user**
- ✅ Notification history endpoint: **Rate limit 10 requests/min per user**
- ✅ Admin broadcast: **Limit to users with ROLE = ADMIN**
- ✅ Validate all user IDs belong to same department (if department-scoped)
- ✅ Encrypt device tokens at rest
- ✅ Use HTTPS/TLS for all API calls
- ✅ Token rotation: Clear old tokens after 30 days of inactivity

---

## 9️⃣ ERROR HANDLING

| Error | Status | Handle |
|-------|--------|--------|
| Invalid device token | 400 | "Device token format invalid" |
| User not found | 404 | "User does not exist" |
| FCM send failed | 502 | Retry via queue (3 attempts) |
| User has no devices | 200 | Return success (but no delivery) |
| Preference disabled | 200 | Skip sending, but log |
| Token expired (APNs) | 410 | Auto-deactivate token |

---

## 🔟 BACKWARDS COMPATIBILITY

- ✅ Existing toast notifications in web UI **continue to work**
- ✅ Email notifications (if implemented later) **same dispatcher**
- ✅ SMS notifications (if implemented later) **same dispatcher**
- ✅ Chat WebSocket notifications **co-exist with push**
- ✅ No breaking changes to existing APIs

---

## ✅ ACCEPTANCE CRITERIA

1. ✅ User can register device token on mobile app
2. ✅ System sends push to all appropriate users on event
3. ✅ Push displays on lock screen (Android & iOS)
4. ✅ User can tap push to deep-link to relevant page
5. ✅ User can configure notification preferences
6. ✅ Failed pushes retry automatically
7. ✅ Notification history is queryable
8. ✅ Admin can send broadcast notifications
9. ✅ No push sent if user disabled channel type
10. ✅ Multi-device support (user with 2 phones gets 2 pushes)

---

**Ready for BƯỚC 3: Technical Implementation** ✅

