# 🔍 BƯỚC 1: QUÉT HỆ THỐNG - Push Notification Architecture Analysis
**Date**: August 23, 2026  
**Status**: ✅ COMPLETE

---

## 1️⃣ CẤU TRÚC THƯ MỤC DỰ ÁN

```
TBS II (Monorepo - Multi-Platform)
├── backend/                      # Node.js/Express + Python FastAPI
│   ├── src/                      # TypeScript - Express API
│   │   ├── main.ts              # Server setup
│   │   ├── middleware/          # Auth, Security
│   │   ├── routes/              # API endpoints (9 routers)
│   │   ├── services/            # Business logic (sync.ts)
│   │   └── utils/               # websocket.ts, redis.ts
│   ├── routers/                 # Python FastAPI routers (11 files)
│   ├── services/                # Python services (qr, sla, websocket)
│   ├── prisma/                  # Database schema + migrations
│   └── requirements.txt         # Python dependencies
│
├── web/                         # Next.js + Cloudflare Workers
│   ├── src/
│   │   ├── app/                # Pages (home, business-trip, etc.)
│   │   ├── components/         # UI Components (Header, Footer)
│   │   ├── modules/            # Feature modules (CI, HR, Production)
│   │   ├── lib/                # Utilities (translations, userProfiles)
│   │   └── hooks/              # React hooks (useTranslation)
│   ├── public/
│   │   └── _worker.js          # Cloudflare Workers entry
│   └── wrangler.jsonc          # Cloudflare config (D1 database)
│
├── android/                     # Android App (Kotlin + Compose)
│   └── app/
│       ├── src/main/
│       │   ├── cpp/             # C++ JNI bridge
│       │   ├── java/            # Kotlin code
│       │   └── res/             # Resources
│       └── build.gradle.kts    # Gradle configuration
│
├── ios/                        # iOS App (Swift)
│   └── TBSGroupApp/
│       ├── ContentView.swift
│       ├── TBSCoreBridge.mm    # Objective-C++ bridge
│       └── TBSCoreBridge.h
│
├── ios-admin/                  # iOS Admin App
│   └── TBSGroupAdmin/
│
├── mobile/                     # Flutter App (Dart)
│   ├── lib/
│   └── pubspec.yaml
│
├── integration/                # C# Integration Service
│   └── (Message queue / ETL?)
│
└── core-cpp/                   # C++ Core Library
    ├── src/
    ├── include/
    └── tests/
```

---

## 2️⃣ HIỆN TRẠNG HỆ THỐNG THÔNG BÁO

### A. **Backend Architecture**

#### 2.A.1 - Express.js Server (Node.js) - `backend/src/main.ts`
```typescript
// ✅ Technologies:
- Express.js (REST API)
- Prisma (ORM for SQLite)
- Redis (caching - available)
- WebSocket (initWebSocket - for real-time)
- CORS, Helmet, Rate Limiting

// ❌ MISSING: Push Notification Service
- NO Firebase Cloud Messaging (FCM)
- NO Apple Push Notification (APNs)
- NO OneSignal integration
- NO Device token storage model
```

#### 2.A.2 - Database Schema - `backend/prisma/schema.prisma`

**Current Models:**
```prisma
User model:
- id, email, passwordHash, fullName, phone
- departmentId, roleId
- isActive, lastPasswordChange
- createdAt, updatedAt

Department, Role, Document, Workflow, Job, Machine, Ticket, ChatRoom, RoomBooking
```

**Missing for Notifications:**
```prisma
// ❌ NO MODELS FOR:
- DeviceToken (device_id, platform, token, user_id)
- PushNotification (user_id, title, body, type, status)
- NotificationPreference (user_id, channel_type, enabled)
- NotificationLog (device_token_id, sent_at, status)
```

#### 2.A.3 - API Routes (Backend)

**Node.js Express Routes** (backend/src/routes):
- ✅ auth.ts - Authentication
- ✅ departments.ts - Department management
- ✅ documents.ts - Document workflow
- ✅ machines.ts - Equipment
- ✅ chat.ts - Messaging (WebSocket-based)
- ✅ admin.ts - Admin functions
- ✅ recruitment.ts - Job applications
- ✅ ai-chat.ts - AI integration
- ❌ **NO notification routes**

**Python FastAPI Routes** (backend/routers):
- ✅ auth.py, users.py, analytics.py, incidents.py
- ✅ orders.py, room_bookings.py, news.py
- ✅ sla.py (SLA tracking)
- ❌ **NO notification/push routes**

#### 2.A.4 - Existing Event Systems

**Currently:**
- ✅ WebSocket for real-time chat (websocket_manager.py)
- ✅ In-browser toast notifications (React component with setTimeout)
- ✅ Event dispatch in browser (window.dispatchEvent - profile updates)
- ✅ SLA Engine tracking (sla_engine.py - monitors deadlines)
- ❌ **NO persistent notification store**
- ❌ **NO push to mobile devices**

### B. **Frontend (Web) - Next.js + Cloudflare Workers**

#### 2.B.1 - Current Notification Implementation
```typescript
// File: web/src/components/Header.tsx
const [notifications, setNotifications] = useState<NotificationItem[]>([
  {
    id: 1,
    title: "Gemba Walk mới",
    message: "Có sự cố dừng máy Line 2 — Xưởng 1 vừa tạo",
    time: "5 phút trước",
    isRead: false,
    type: "gemba",
  },
  // ... more mock notifications
]);

// Fetches from: /api/notifications (endpoint exists but returns mock data)
const fetchNotifications = async () => {
  try {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setNotifications(json.data.map(...));
      }
    }
  } catch (e) {}
};
```

#### 2.B.2 - Cloudflare Workers Setup
```jsonc
// File: web/wrangler.jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "vpchuoiskechers",
    "database_id": "ae3a7efd-ff5d-45c2-8c49-78d1518e3aa1"
  }],
  "vars": {
    "NEXT_PUBLIC_APP_URL": "https://vpchuoiskechers.tbsgroup2026.workers.dev"
  },
  "triggers": {
    "crons": ["0 8 * * 1"]  // Weekly cron at 8 AM Monday
  }
}
```

**Current API Endpoints** (web/public/_worker.js):
- ✅ `/api/profile` - User profile
- ✅ `/api/notifications` - Returns mock notifications (fetch only, no store)
- ✅ Static file serving via ASSETS binding
- ❌ **NO /api/device-token endpoint**
- ❌ **NO /api/push-send endpoint**

### C. **Mobile Apps**

#### 2.C.1 - Android App
```gradle
// backend/android/app/build.gradle.kts
compileSdk = 34
minSdk = 24
targetSdk = 34
versionName = "1.0.0"

buildFeatures {
  compose = true  // Using Jetpack Compose
}

// ❌ NO Firebase dependencies found
// ❌ NO Firebase Messaging plugin
// ❌ NO FCM configuration
```

#### 2.C.2 - iOS App
```swift
// ios/TBSGroupApp/
- ContentView.swift (main UI)
- TBSCoreBridge.mm (Objective-C++ bridge to C++)
- TBSGroupApp-Bridging-Header.h

// ❌ NO APNs configuration
// ❌ NO Push notification entitlements
// ❌ NO UserNotifications framework setup
```

#### 2.C.3 - Flutter Mobile App
```yaml
// mobile/pubspec.yaml
// ❌ NO Firebase plugins (firebase_messaging)
// ❌ NO push notification packages
```

---

## 3️⃣ HỆ THỐNG HIỆN CÓ GÌ

### ✅ ASSETS ĐANG CÓ:

1. **Backend Infrastructure**
   - ✅ Express.js + Node.js server (TypeScript)
   - ✅ Python FastAPI routers
   - ✅ Prisma ORM with SQLite database
   - ✅ Redis connection available
   - ✅ WebSocket infrastructure for real-time chat
   - ✅ CORS, Security middleware, Rate limiting
   - ✅ JWT-based authentication

2. **Frontend Infrastructure**
   - ✅ Next.js app with Cloudflare Workers
   - ✅ D1 database binding in Cloudflare
   - ✅ Toast notification UI component
   - ✅ Event system (window.dispatchEvent)
   - ✅ Browser localStorage for persistence

3. **Event Triggers Already in System**
   - ✅ New room booking (`/api/room_bookings`)
   - ✅ Document workflow status changes (sla_engine.py)
   - ✅ New orders (`orders.py`)
   - ✅ Incidents/machine problems (incidents.py)
   - ✅ SLA deadline approaching (sla_engine.py)
   - ✅ Kaizen proposals submitted (from previous features)
   - ✅ Business trip requests (from previous features)

4. **User Management**
   - ✅ User profiles (with departments, roles)
   - ✅ Role-based access control
   - ✅ Department hierarchy

---

## 4️⃣ HỆ THỐNG THIẾU GÌ

### ❌ CẦN THÊM:

| Component | Status | Impact |
|-----------|--------|--------|
| **Device Token Model** | ❌ Missing | Cannot identify mobile devices |
| **Push Notification API** | ❌ Missing | No way to send push to mobile |
| **FCM/APNs Integration** | ❌ Missing | Cannot reach iOS/Android lock screen |
| **Notification History Model** | ❌ Missing | Cannot track sent/delivered/failed |
| **Notification Preferences** | ❌ Missing | Users can't opt-in/out of notifications |
| **NotificationDispatcher Service** | ❌ Missing | Central hub to route all notifications |
| **Background Job Queue** | ❌ Missing | Need async task processing |
| **Device Token Endpoint** | ❌ Missing | Mobile apps can't register tokens |
| **Retry Logic** | ❌ Missing | Failed push won't retry |
| **Firebase SDK Setup** | ❌ Missing | Android/iOS can't receive FCM |
| **APNs Certificates** | ❌ Missing | iOS can't receive APNs |
| **Notification Payload Format** | ❌ Missing | No standard format defined |

---

## 5️⃣ TÓM TẮT: KIẾN TRÚC HIỆN TẠI vs THIẾU

### Current Architecture:
```
Events in System (Bookings, Orders, SLA)
    ↓
Server Side Toast (React component)
    ↓
In-browser Notification (stays in web app only)
    ↓
❌ DEAD END: No push to mobile devices
```

### Desired Architecture (after implementation):
```
Events in System
    ↓
NotificationDispatcher (Central Router)
    ↓
├─→ Backend In-App (Web & App screens)
├─→ Firebase Cloud Messaging (Android + iOS)
├─→ Apple Push Notification Service (iOS)
└─→ Notification History DB (For audit)
    ↓
Mobile Lock Screen (Push banner)
    ↓
User Opens App → View Notification
```

---

## 6️⃣ ĐÁP ÁN: CẦN THIẾT KẾ GÌ

### Phase 1: Database & Models
```prisma
model DeviceToken {
  id String @id @default(uuid())
  user_id String
  platform String // "ANDROID", "IOS"
  token String @unique
  device_id String?
  device_name String?
  is_active Boolean @default(true)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  @@index([user_id])
  @@index([platform])
}

model PushNotification {
  id String @id @default(uuid())
  user_id String
  title String
  body String
  type String // "ORDER", "ALERT", "KAIZEN", "BOOKING", "SLA"
  data String? // JSON payload
  status String // "PENDING", "SENT", "DELIVERED", "FAILED"
  created_at DateTime @default(now())
  sent_at DateTime?
  
  @@index([user_id])
  @@index([status])
}

model NotificationPreference {
  id String @id @default(uuid())
  user_id String @unique
  push_enabled Boolean @default(true)
  email_enabled Boolean @default(true)
  sms_enabled Boolean @default(false)
  channel_types String // "ORDER,ALERT,KAIZEN,BOOKING"
  
  @@index([user_id])
}
```

### Phase 2: Services & APIs
```typescript
// backend/src/services/NotificationDispatcher.ts
- Route events to appropriate channels
- Send to FCM, APNs, store in DB

// backend/src/routes/notifications.ts
POST /api/notifications/register-device     // Register device token
POST /api/notifications/send                 // Send notification
GET /api/notifications/history              // Get notification history
PUT /api/notifications/preferences           // User preferences

// backend/src/utils/firebase.ts
- FCM client initialization
- Send to Android via FCM

// backend/src/utils/apns.ts
- APNs client initialization
- Send to iOS via APNs
```

### Phase 3: Integration Points
```
Order Creation → NotificationDispatcher → 
  ├→ FCM (Android)
  ├→ APNs (iOS)
  └→ Database (history)

Room Booking → NotificationDispatcher → ...
Kaizen Submission → NotificationDispatcher → ...
SLA Deadline → NotificationDispatcher → ...
```

### Phase 4: Mobile Implementation
```kotlin
// Android: Register device token on app start
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
  if (task.isSuccessful) {
    val token = task.result
    sendToBackend("/api/notifications/register-device", token)
  }
}

// Handle incoming FCM message
MyMessagingService extends FirebaseMessagingService {
  onMessageReceived(remoteMessage)
    → Show on lock screen via NotificationManager
}
```

```swift
// iOS: Request user permission + register for APNs
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
UIApplication.shared.registerForRemoteNotifications()

// Handle incoming APNs
didFinishLaunchingWithOptions()
  → Configure APNs delegate
  → Show on lock screen
```

---

## 7️⃣ RECOMMENDATION: PUSH SOLUTION

### **Recommended: Firebase Cloud Messaging (FCM) + APNs**

**Why?**
- ✅ Free tier (500 free messages/month, then pay-as-you-go)
- ✅ Handles both Android (FCM) & iOS (FCM or APNs)
- ✅ Built-in retry logic
- ✅ Analytics & delivery tracking
- ✅ Existing ecosystem integration
- ✅ Easy to integrate with existing Node.js backend

**Alternative (if FCM blocked in Vietnam):**
- OneSignal (free tier available, supports push/email/SMS)
- AWS SNS (more expensive, but comprehensive)

---

## 📋 BƯỚC 2 READY: YÊU CẦU CHỨC NĂNG

After this scan, we will implement:

1. ✅ Database models for device tokens, notifications, preferences
2. ✅ `NotificationDispatcher` service (central routing)
3. ✅ Backend APIs for device registration, sending, history
4. ✅ FCM & APNs integration
5. ✅ Android app: Firebase Messaging setup + lock screen display
6. ✅ iOS app: APNs setup + lock screen display
7. ✅ Integration with all event sources (Orders, Bookings, SLA, Kaizen, etc.)
8. ✅ Queue system for async processing (Bull/BullMQ)
9. ✅ Tests & documentation

---

## 🎯 KẾT LUẬN QUÉT HỆ THỐNG

| Aspect | Status | Detail |
|--------|--------|--------|
| **Backend Ready** | ✅ 80% | Has Express, Prisma, WebSocket; needs notification models & services |
| **Frontend Ready** | ✅ 80% | Has API structure; needs device token endpoints |
| **Android App** | ⚠️ 20% | Structure exists; needs Firebase setup |
| **iOS App** | ⚠️ 20% | Structure exists; needs APNs setup |
| **Database** | ⚠️ 50% | Prisma ready; needs notification models |
| **Event Sources** | ✅ 100% | Orders, Bookings, SLA, Kaizen all trigger-ready |
| **Push Infrastructure** | ❌ 0% | FCM/APNs not configured |
| **Message Queue** | ❌ 0% | No async job system |
| **Overall Readiness** | ⚠️ 50% | Foundation exists; notification layer completely missing |

**Ready to proceed to BƯỚC 2** ✅

