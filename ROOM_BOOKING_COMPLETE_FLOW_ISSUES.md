# 🔴 ROOM BOOKING - COMPLETE FLOW ISSUES

**Status**: ❌ **MULTIPLE BLOCKERS - NOT WORKING END-TO-END**  
**Date**: August 22, 2026  
**File**: `web/src/app/rooms/page.tsx`

---

## 🎯 THE MAIN PROBLEM

Hệ thống đặt phòng họp **chưa hoạt động hoàn toàn** vì:
1. ❌ **API endpoint không tồn tại** (`/api/rooms/booking`)
2. ❌ **Backend không xử lý booking** (chỉ có frontend state)
3. ❌ **Dữ liệu chỉ lưu trong localStorage** (không persistent)
4. ❌ **Không có validation trạng thái chi tiết**
5. ❌ **Không kiểm tra xung đột thời gian** (double booking)

---

## 📊 BOOKING FLOW (HIỆN TẠI - KHÔNG HOÀN THIỆN)

### Current State (What Happens):
```
1. User fills booking form & clicks "Đặt phòng họp"
   ✅ Creates newBooking object in memory

2. Frontend shows toast: "Đã gửi đơn đăng ký! Lễ Tân sẽ phê duyệt..."
   ✅ Shows notifications to receptionist & booker

3. Call fetch("/api/rooms/booking", POST)
   ❌ ENDPOINT DOESN'T EXIST!
   ❌ API returns 404 error (silently caught)

4. Data saved to localStorage
   ⚠️ Lost on browser refresh
   ⚠️ Not shared with other users
   ⚠️ No database persistence

5. Receptionist sees booking in list
   ✅ Can click "Duyệt" to approve

6. handleApproveBooking() called
   ✅ Changes status PENDING → APPROVING → CONFIRMED
   ❌ But calls /api/rooms/booking PUT which doesn't exist
   ❌ Status change reverts if page refreshes

7. On page refresh
   ❌ Booking disappears (not saved in backend)
   ❌ Only appears if receptionist re-opens page quickly
```

---

## 🔴 SPECIFIC ISSUES

### Issue 1: Missing API Endpoint

**Location**: `handleBookRoomSubmit()` Line 961-968

```javascript
try {
  await fetch("/api/rooms/booking", {  // ❌ ENDPOINT DOESN'T EXIST
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({...newBooking, bookingDate: dateFmt}),
  });
} catch (err) {
  // ❌ Error caught silently - user doesn't know
}
```

**Problem**:
- No backend handler for `POST /api/rooms/booking`
- No database save
- Booking only exists in frontend memory

**Evidence**:
- Check `backend/routers/` - no `rooms.py` file
- Check `backend/src/routes/` - no `rooms.ts` file

---

### Issue 2: No Database Table for Bookings

**Missing Schema**:
```sql
-- Should be in backend/prisma/schema.prisma but ISN'T:
model RoomBooking {
  id        String   @id @default(uuid())
  roomId    String
  title     String
  bookerName String
  status    String   // PENDING, APPROVING, CONFIRMED, CANCELLED, COMPLETED
  bookingDate String
  timeSlot  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Current State**:
- ✅ Frontend defines `RoomBooking` interface
- ❌ No `RoomBooking` model in Prisma
- ❌ No database table
- ❌ No migration

---

### Issue 3: No Double-Booking Prevention

**Location**: `handleBookRoomSubmit()` - Missing validation

```javascript
// ❌ MISSING: Check if room already booked at this time
const conflictingBooking = bookings.find((b) =>
  b.roomId === selectedRoom.id &&
  b.bookingDate === dateFmt &&
  b.timeSlot === bookingForm.timeSlot &&
  b.status !== "CANCELLED"
);

if (conflictingBooking) {
  showToast("❌ Phòng này đã được đặt trong khung giờ này!");
  return;
}
```

**Current Behavior**:
- ✅ User can book same room at same time multiple times
- ✅ Frontend will show multiple bookings
- ❌ No backend validation (no backend!)
- ❌ System allows conflicts

---

### Issue 4: Data Loss on Page Refresh

**Why**: Only localStorage, no database
```javascript
// Frontend saves to localStorage
localStorage.setItem("tbs_rooms_bookings", JSON.stringify(bookings));

// But on page refresh:
// 1. React component remounts
// 2. bookings state resets to default array (Line 345-401)
// 3. localStorage data NOT restored on initial load
```

**Evidence in Code** (Line 893-901):
```javascript
useEffect(() => {
  if (typeof window !== "undefined" && bookings.length > 0) {
    localStorage.setItem("tbs_rooms_bookings", JSON.stringify(bookings));
  }
}, [bookings]); // ❌ Only SAVES to localStorage, never LOADS
```

**Missing Code**:
```javascript
useEffect(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tbs_rooms_bookings");
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {}
    }
  }
}, []); // ❌ THIS IS MISSING!
```

---

### Issue 5: Receptionist Can't See Pending Bookings Properly

**Location**: Line 1476-1530 (APPROVALS tab)

```javascript
{bookings.filter((b) => b.status === "PENDING").length === 0 ? (
  <tr>
    <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
      Không có yêu cầu chờ duyệt nào cả.
    </td>
  </tr>
) : (
  bookings.filter((b) => b.status === "PENDING").map((b) => (
    // ✅ Shows PENDING bookings
    // ❌ But they disappear on page refresh!
  ))
)}
```

**Problem**:
- Receptionist approves a booking
- Status changes to APPROVING then CONFIRMED
- ✅ Shows success toast
- ❌ API call to save fails (endpoint missing)
- ❌ On refresh, booking reverts to PENDING
- ❌ Infinite loop of "trying to approve same booking"

---

## 💡 WHAT NEEDS TO BE BUILT

### 1. Backend API Routes (NEW)

**File**: `backend/routers/rooms.py` (Create new)

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import RoomBooking  # New model
from schemas import RoomBookingCreate, RoomBookingUpdate

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

@router.post("/booking")
def create_booking(req: RoomBookingCreate, db: Session = Depends(get_db)):
    """Create new room booking - saves to database"""
    # Validate no conflicts
    # Create booking
    # Save to DB
    # Return booking object

@router.put("/booking")
def update_booking(booking_id: str, status: str, db: Session = Depends(get_db)):
    """Update booking status (PENDING → APPROVING → CONFIRMED)"""
    # Validate current status
    # Update in database
    # Return updated booking

@router.get("/bookings")
def get_bookings(db: Session = Depends(get_db)):
    """Get all bookings"""
    # Query from database
    # Return as JSON

@router.get("/bookings/{booking_id}")
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    """Get single booking"""
    pass
```

### 2. Database Model (NEW)

**File**: `backend/prisma/schema.prisma` - Add this model

```prisma
model RoomBooking {
  id            String   @id @default(uuid())
  roomId        String
  roomName      String
  title         String
  bookerName    String
  department    String
  bookingDate   String   // DD/MM/YYYY
  timeSlot      String   // "09:00 - 10:30"
  attendeesCount Int
  notes         String?
  status        String   // PENDING, APPROVING, RECEPTIONIST_PROPOSED, CONFIRMED, CANCELLED, COMPLETED
  approvedAt    DateTime?
  approvedBy    String?  // User ID of receptionist
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([status])
  @@index([roomId])
  @@index([bookingDate])
}
```

### 3. Database Migration (NEW)

```bash
cd backend
npx prisma migrate dev --name add_room_bookings
```

### 4. Frontend - Restore from localStorage (FIX)

**Location**: `web/src/app/rooms/page.tsx` - Line 893-920

Add this effect:

```typescript
// Load bookings from localStorage on mount
useEffect(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tbs_rooms_bookings");
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to restore bookings:", e);
      }
    }
  }
}, []); // Empty deps = run once on mount
```

### 5. Frontend - Add Conflict Check (FIX)

**Location**: `handleBookRoomSubmit()` - Line 901-930

Add before creating new booking:

```typescript
// Check for conflicts
const hasConflict = bookings.some((b) =>
  b.roomId === selectedRoom.id &&
  b.bookingDate === dateFmt &&
  b.timeSlot === bookingForm.timeSlot &&
  b.status !== "CANCELLED"
);

if (hasConflict) {
  showToast(`❌ Phòng ${selectedRoom.name} đã được đặt trong khung giờ này!`);
  return;
}
```

### 6. Frontend - Better Error Handling (FIX)

**Location**: `handleBookRoomSubmit()` - Line 961-970

Change from:
```typescript
try {
  await fetch("/api/rooms/booking", {...});
} catch (err) {
  // Silent error!
  showToast("⏳ Đã gửi...");
}
```

To:
```typescript
try {
  const response = await fetch("/api/rooms/booking", {...});
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  showToast("✅ Đặt phòng họp thành công!");
} catch (err) {
  console.error("Booking failed:", err);
  showToast(`❌ Đặt phòng thất bại: ${err.message}`);
  // Optionally remove from local state if DB save failed
  setBookings(prev => prev.filter(b => b.id !== newBooking.id));
}
```

---

## 🔧 IMPLEMENTATION PRIORITY

### Phase 1: Core Backend (Blocking) - 3-4 hours
- [ ] Create `RoomBooking` model in Prisma
- [ ] Create migration
- [ ] Create `backend/routers/rooms.py` with CRUD endpoints
- [ ] Add to main.py: `app.include_router(rooms.router)`

### Phase 2: Frontend Improvements - 2 hours
- [ ] Add localStorage restore on mount
- [ ] Add double-booking validation
- [ ] Improve error handling in API calls
- [ ] Add proper error messages

### Phase 3: Testing - 2 hours
- [ ] Test booking creation → saves to DB
- [ ] Test receptionist approval → status updated in DB
- [ ] Test page refresh → booking still exists
- [ ] Test double-booking prevention
- [ ] Test error scenarios

---

## ✅ VERIFICATION CHECKLIST

After implementation, test these scenarios:

### Scenario 1: Create & Persist Booking
```
1. User fills form & clicks "Đặt phòng họp"
2. See toast: "✅ Đặt phòng họp thành công!"
3. Refresh page
4. ✅ Booking still appears in list
5. ✅ Check database: booking record exists
```

### Scenario 2: Receptionist Approve
```
1. Receptionist clicks "Duyệt"
2. See: "APPROVING" state appears
3. Wait for API response
4. See: "CONFIRMED" status
5. Refresh page
6. ✅ Still shows CONFIRMED
7. ✅ Database has status = CONFIRMED
```

### Scenario 3: Prevent Double Booking
```
1. Book room_1 at 09:00-10:00 on 15/08/2026
2. Try to book same room at same time
3. ✅ See error: "Phòng này đã được đặt..."
4. ❌ Booking not created
```

### Scenario 4: Data Sync Across Users
```
1. User A books room on Chrome
2. User B on Firefox sees booking in real-time
   (after refresh or via polling)
3. ✅ Both see same data
```

---

## 📋 FILES TO CREATE/MODIFY

| File | Action | Priority |
|------|--------|----------|
| `backend/routers/rooms.py` | CREATE | 🔴 CRITICAL |
| `backend/prisma/schema.prisma` | MODIFY | 🔴 CRITICAL |
| `backend/main.py` | MODIFY (add router) | 🔴 CRITICAL |
| `web/src/app/rooms/page.tsx` | MODIFY (3 fixes) | 🟠 HIGH |
| Backend migration | RUN | 🔴 CRITICAL |

---

## 🚨 CURRENT STATE (SUMMARY)

| Feature | Status | Issue |
|---------|--------|-------|
| **User submits booking** | ⚠️ PARTIAL | Creates in memory only |
| **Booking saved to DB** | ❌ NO | API endpoint missing |
| **Receptionist sees booking** | ✅ YES | But disappears on refresh |
| **Receptionist approves** | ⚠️ PARTIAL | Status changes but not saved |
| **Page refresh** | ❌ NO | All bookings lost |
| **Double-booking prevented** | ❌ NO | Same room/time allowed |
| **Error handling** | ❌ NO | Errors silent |
| **Multi-user sync** | ❌ NO | No backend storage |

---

## 💬 BOTTOM LINE

**The booking system is currently DEMO-ONLY:**
- ✅ Frontend UI works
- ✅ Shows bookings in memory
- ✅ Status transitions work in UI
- ❌ **NO backend persistence**
- ❌ **Data lost on refresh**
- ❌ **No multi-user sync**
- ❌ **No double-booking prevention**

**To make it production-ready**, you need:
1. Database table for bookings
2. Backend API to handle booking CRUD
3. Proper error handling
4. Data validation (conflicts, capacity, dates)
5. Real-time sync or polling

**Estimated work**: 6-8 hours total to fully implement

---

**Report Generated**: August 22, 2026  
**Next Steps**: 
1. Create `RoomBooking` model
2. Implement backend API
3. Run tests
4. Deploy

