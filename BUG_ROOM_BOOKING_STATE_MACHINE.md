# 🐛 BUG REPORT: Room Booking State Machine Violation

**Bug ID**: ROOM_BOOKING_001  
**Severity**: 🔴 **HIGH - WORKFLOW LOGIC ERROR**  
**Status**: ❌ **CONFIRMED**  
**Date Found**: August 22, 2026  
**File**: `web/src/app/rooms/page.tsx`

---

## 🔍 ISSUE DESCRIPTION

**Problem**: Booking transitions directly from `PENDING` to `CONFIRMED` **WITHOUT requiring receptionist approval** ⚠️

**Current Flow** (WRONG):
```
User submits booking
        ↓
Status = PENDING (Lễ Tân chưa duyệt)
        ↓
⚠️ JUMP DIRECTLY TO CONFIRMED (Đã xếp lịch hoàn tất)
        ↓
No receptionist approval shown!
```

**Expected Flow** (CORRECT):
```
User submits booking
        ↓
Status = PENDING (Chờ Lễ Tân duyệt) ⏳
        ↓
[Lễ Tân reviews, approves, or proposes changes]
        ↓
Status = CONFIRMED (Đã xếp lịch hoàn tất) ✅
        ↓
Booking completed
```

---

## 🎯 ROOT CAUSE

### Function: `handleApproveBooking()` (Line 469)

```typescript
// ❌ BUG: This function directly changes PENDING → CONFIRMED
// WITHOUT checking if receptionist actually APPROVED it!

const handleApproveBooking = async (bookingId: string) => {
  const targetBooking = bookings.find((b) => b.id === bookingId);
  const updatedNotes = (targetBooking?.notes || "") + " [APPROVED_BY_RECEPTIONIST]";
  
  // ❌ PROBLEM: Immediately sets status to CONFIRMED
  setBookings((prev) =>
    prev.map((b) => (b.id === bookingId ? { ...b, status: "CONFIRMED", notes: updatedNotes } : b))
  );
  
  // ❌ Only NOTES indicate approval happened
  // But no intermediate "APPROVING" or "PENDING_APPROVAL" state!
  
  // ... sends API call ...
  
  // ❌ Shows success toast even if API fails (try/catch with empty catch)
  showToast("👩‍💼 Lễ Tân đã xác nhận & xếp phòng họp thành công!");
};
```

### What's Wrong:
1. ❌ **Immediate State Change**: Status changes synchronously BEFORE API call completes
2. ❌ **No Intermediate State**: No `PENDING_APPROVAL` or `APPROVED_WAITING_CONFIRMATION` state
3. ❌ **Silent API Failure**: Try-catch block is empty - API errors are ignored
4. ❌ **Notes Used for Tracking**: Approval tracked in notes string instead of state machine
5. ❌ **No Validation**: No check if user has receptionist permission

---

## 📊 BOOKING STATUS ENUM (Line 64-68)

```typescript
export type BookingStatus =
  | "PENDING"                    // ⏳ Chờ Lễ Tân duyệt
  | "RECEPTIONIST_PROPOSED"      // 🔄 Lễ Tân đề xuất thay đổi
  | "CONFIRMED"                  // ✅ Đã duyệt & xếp lịch
  | "CANCELLED"                  // ❌ Đã hủy
  | "COMPLETED";                 // ✓ Cuộc họp hoàn tất
```

**Problem**: No state for "Receptionist reviewing/approving" - jumps from PENDING directly to CONFIRMED

---

## 🐛 BUG IMPACT

### Scenarios Where Bug Manifests:

**Scenario 1: Quick Approve**
```
1. User books room → PENDING
2. Receptionist clicks "Approve" button
3. ⚠️ Status IMMEDIATELY shows CONFIRMED (before API call)
4. If API fails, status stays CONFIRMED but NOT actually approved in database!
```

**Scenario 2: Page Reload Race Condition**
```
1. Receptionist clicks "Approve"
2. Status changes to CONFIRMED (UI only)
3. User refreshes page before API completes
4. If API call fails silently, database still has PENDING
5. UI shows CONFIRMED, DB shows PENDING → DATA MISMATCH
```

**Scenario 3: No Visual Feedback for Approval**
```
1. Receptionist sees PENDING status
2. Clicks "Approve" → Status jumps to CONFIRMED instantly
3. No intermediate "Approving..." state
4. No way to show "✓ Approved at 14:30"
```

---

## 📝 USER IMPACT

### From Receptionist (Lễ Tân) Perspective:
- ❌ Can't distinguish between:
  - "Booking approved and saved"
  - "Booking approved but not saved yet"
  - "Booking failed to save"

### From Booker Perspective:
- ❌ May see booking as "Confirmed" before Lễ Tân actually approved
- ❌ May send notifications about confirmed meeting that fails later

### From System Perspective:
- ❌ Frontend and backend can be out of sync
- ❌ Audit trail incomplete (only notes, not timestamp)

---

## ✅ SOLUTION

### Option 1: Add Intermediate State (RECOMMENDED)

```typescript
export type BookingStatus =
  | "PENDING"                         // ⏳ Waiting receptionist review
  | "APPROVING"                       // 🔄 Receptionist is approving (NEW)
  | "RECEPTIONIST_PROPOSED"           // 🔄 Receptionist proposed changes
  | "CONFIRMED"                       // ✅ Approved & scheduled
  | "CANCELLED"                       // ❌ Cancelled
  | "COMPLETED";                      // ✓ Meeting finished
```

**Fixed Function**:

```typescript
const handleApproveBooking = async (bookingId: string) => {
  const targetBooking = bookings.find((b) => b.id === bookingId);
  if (!targetBooking) {
    showToast("❌ Không tìm thấy cuộc họp!");
    return;
  }

  // Step 1: Set intermediate state BEFORE API call
  setBookings((prev) =>
    prev.map((b) => (b.id === bookingId ? { ...b, status: "APPROVING" } : b))
  );
  showToast("⏳ Đang xác nhận phòng họp...");

  try {
    // Step 2: Call API with await
    const response = await fetch("/api/rooms/booking", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bookingId,
        status: "CONFIRMED",
        approvedAt: new Date().toISOString(),
        approvedBy: getCurrentUser().id,
      }),
    });

    // Step 3: Check response
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Step 4: Update to CONFIRMED only on success
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "CONFIRMED",
              notes: `${b.notes || ""} [APPROVED_BY_${getCurrentUser().name}_AT_${new Date().toLocaleTimeString("vi-VN")}]`,
            }
          : b
      )
    );

    showToast("✅ Lễ Tân đã xác nhận & xếp phòng họp thành công!");

    // Step 5: Send notification ONLY after confirmed
    broadcastNotification({
      title: "✅ Lịch Họp Đã Được Xác Nhận",
      message: `Lễ Tân đã xác nhận phòng ${targetBooking.roomName} cho "${targetBooking.title}" (${targetBooking.timeSlot}).`,
      type: "SUCCESS",
      targetUser: targetBooking.bookerName,
    });
  } catch (error) {
    console.error("Approve booking failed:", error);

    // Step 6: Revert to PENDING on failure
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "PENDING" } : b
      )
    );

    showToast(`❌ Xác nhận thất bại: ${error.message}`);

    // Step 7: Notify user of failure
    broadcastNotification({
      title: "❌ Xác Nhận Phòng Họp Thất Bại",
      message: `Không thể xác nhận phòng "${targetBooking.title}". Vui lòng thử lại.`,
      type: "ERROR",
      targetUser: "Lễ Tân",
    });
  }
};
```

---

### Option 2: Simpler Fix (Less Invasive)

If you don't want to add `APPROVING` state, at minimum do this:

```typescript
const handleApproveBooking = async (bookingId: string) => {
  const targetBooking = bookings.find((b) => b.id === bookingId);
  if (!targetBooking || targetBooking.status !== "PENDING") {
    showToast("❌ Chỉ có thể duyệt cuộc họp ở trạng thái 'Chờ Lễ Tân'!");
    return;
  }

  // ✅ Wait for API response BEFORE updating state
  try {
    const response = await fetch("/api/rooms/booking", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bookingId,
        status: "CONFIRMED",
        approvedBy: getCurrentUser().id,
      }),
    });

    if (!response.ok) throw new Error("API Error");

    // ✅ ONLY update state if API succeeds
    const updatedNotes =
      (targetBooking.notes || "") + " [APPROVED_BY_RECEPTIONIST]";
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "CONFIRMED", notes: updatedNotes } : b
      )
    );

    showToast("✅ Đã xác nhận & xếp phòng họp thành công!");
  } catch (error) {
    console.error("Approve failed:", error);
    showToast(`❌ Xác nhận thất bại: ${error.message}`);
  }
};
```

**Key Changes**:
1. ✅ Validate state is PENDING before approving
2. ✅ Await API response
3. ✅ Only update state on success
4. ✅ Catch and handle errors properly

---

## 🔍 OTHER RELATED ISSUES

### Issue A: Similar Bug in `handleUserAcceptProposal()` (Line 551-567)

```typescript
// ❌ Same problem: Immediately sets CONFIRMED without waiting for API
const handleUserAcceptProposal = (bookingId: string) => {
  // ...
  setBookings((prev) =>
    prev.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: "CONFIRMED",  // ❌ No API call, changes immediately
          }
        : b
    )
  );
};
```

**Fix**: Add API call and error handling

### Issue B: `handleSendCounterProposal()` (Line 509-532)

```typescript
// ⚠️ Sets RECEPTIONIST_PROPOSED but no validation
setBookings((prev) =>
  prev.map((b) =>
    b.id === proposeModalBooking.id
      ? {
          ...b,
          status: "RECEPTIONIST_PROPOSED",  // ⚠️ Immediate change, no API
          // ...
        }
      : b
  )
);
```

**Fix**: Make this async with API call

---

## 📋 TESTING CHECKLIST

After fix, verify:

- [ ] **Test 1**: Submit booking → shows PENDING ✓
- [ ] **Test 2**: Click approve → shows APPROVING (or intermediate state) ✓
- [ ] **Test 3**: Wait for response → shows CONFIRMED ✓
- [ ] **Test 4**: If API fails → stays PENDING, show error ✓
- [ ] **Test 5**: Refresh page → state matches database ✓
- [ ] **Test 6**: Rapid click approve button → only one request sent ✓
- [ ] **Test 7**: Approval tracking includes timestamp ✓
- [ ] **Test 8**: Can't approve non-PENDING bookings ✓

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Update Type Definition
```typescript
// In line 64-68, add APPROVING state
export type BookingStatus =
  | "PENDING"
  | "APPROVING"              // ADD THIS
  | "RECEPTIONIST_PROPOSED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
```

### Step 2: Fix handleApproveBooking() 
- Add intermediate APPROVING state
- Add await on fetch
- Add error handling
- Revert on failure

### Step 3: Fix handleUserAcceptProposal()
- Add validation
- Add error handling
- Use async/await

### Step 4: Fix handleSendCounterProposal()
- Make async
- Add API call
- Add error handling

### Step 5: Add UI feedback
- Show "Approving..." state
- Disable button during approval
- Show error messages

### Step 6: Update Tests
- Test state transitions
- Test error cases
- Test concurrent updates

---

## 📝 RELATED CODE SECTIONS

| Line | Function | Issue |
|------|----------|-------|
| 469-483 | `handleApproveBooking()` | 🔴 Immediate state change |
| 509-532 | `handleSendCounterProposal()` | 🟡 No async/await |
| 551-567 | `handleUserAcceptProposal()` | 🔴 No validation |
| 627-639 | `handleReassignRoom()` | 🟡 Immediate state change |
| 693-716 | `handleCompleteBooking()` | 🟡 Needs error handling |

---

## 🎯 PRIORITY

**Severity**: 🔴 **HIGH**  
**Fix Complexity**: 🟢 **MEDIUM** (2-3 hours)  
**Test Complexity**: 🟡 **MEDIUM**  
**Business Impact**: 🔴 **HIGH** (Workflow breaks)

**Recommendation**: Fix in next sprint - affects core booking workflow

---

## 📞 QUESTIONS

1. Should intermediate states (APPROVING, PROPOSED_ACCEPTED_PENDING) be added?
2. Should approval require both client-side AND server-side state machine validation?
3. How should conflicting approvals (two users approving same booking) be handled?
4. Should there be an "approvedAt" and "approvedBy" timestamp?

---

**Bug Report Complete**
