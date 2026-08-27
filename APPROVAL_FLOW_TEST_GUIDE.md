# 🧪 APPROVAL FLOW TEST GUIDE

**Fix Applied:** Approval buttons (Duyệt TP / Duyệt BGĐ) now show based on `roleCode` instead of just department matching

---

## 👥 Test Accounts Available

From `web/src/lib/userProfiles.ts`:

| MSNV | Tên | Role | Department | Button Access |
|------|-----|------|-----------|---|
| `202608001` | Phạm Nguyễn Anh Huy | TRUONG_PHONG | NHÂN SỰ-HC | Level 1 (Duyệt TP) |
| `202608002` | Trần Ngọc Huy | TRUONG_PHONG | IT - Team | Level 1 (Duyệt TP) |
| `TGĐ-001` | Phạm Minh Tùng | TONG_GIAM_DOC | Ban GĐ | Level 1 + Level 2 (All) |
| `LT-001` | Lễ Tân | LE_TAN | Văn Phòng | None (No approval access) |

---

## 🧑‍💻 LOGIN CREDENTIALS

Open login page: `https://vpchuoiskechers.tbsgroup2026.workers.dev/login`

**Format:** `MSNV / Role Code` (or leave password blank)

```
202608001  → Phạm Nguyễn Anh Huy (Trưởng Phòng - NHÂN SỰ-HC)
202608002  → Trần Ngọc Huy (Trưởng Phòng - IT)
TGĐ-001    → Phạm Minh Tùng (Tổng Giám Đốc)
LT-001     → Lễ Tân (No approval access)
```

---

## 📋 TEST SCENARIOS

### ✅ SCENARIO 1: Create Trip as CBCNV
**Goal:** Create a business trip to test approval flow

1. Login as `202608001` (Phạm Nguyễn Anh Huy - Trưởng Phòng)
2. Go to `/business-trip`
3. Fill form:
   - **Tên đề xuất:** "Test công tác Hà Nội"
   - **Khu vực:** "VP Chuỗi (R&D)"
   - **Mục đích:** "Kiểm tra cơ sở"
   - **Ngày bắt đầu:** Any future date
   - **Hình thức di chuyển:** "Xe công ty"
   - **Người tạo:** Auto-filled (Phạm Nguyễn Anh Huy)
   - **Phòng Ban:** Auto-filled (NHÂN SỰ-HC)
4. Click "Lưu đơn"
5. Go to "Xem dữ liệu" tab
6. Should see trip with status: **"Chờ TP duyệt Lịch"** ⏳

**Expected Result:** ✅ Trip created, waiting for Trưởng Phòng approval

---

### ✅ SCENARIO 2: Same TP Approves Own Department's Trip
**Goal:** Trưởng Phòng approves trip from same department

1. Stay logged in as `202608001` (Phạm Nguyễn Anh Huy - TRUONG_PHONG of NHÂN SỰ-HC)
2. In "Xem dữ liệu" tab, find the trip just created
3. In **Duyệt Lịch (2 Cấp)** column, you should see:
   - ✅ Green button **"Duyệt TP"** 
   - ✅ Red button **"Từ chối"**
4. Click **"Duyệt TP"**
5. See toast: "✅ Trưởng phòng đã duyệt D1!"
6. Trip status updates to: **"Chờ BGĐ duyệt Lịch"** 🔵

**Expected Result:** ✅ Buttons appear, approval works, status progresses to Level 2

---

### ❌ SCENARIO 3: Different TP Cannot Approve
**Goal:** Trưởng Phòng from different department should NOT see approval buttons

1. Create another trip with **MSNV 202608001** (NHÂN SỰ-HC department)
2. Logout & Login as `202608002` (Trần Ngọc Huy - TRUONG_PHONG of IT - Team)
3. Go to `/business-trip` → "Xem dữ liệu" tab
4. Find the trip from NHÂN SỰ-HC department
5. In **Duyệt Lịch** column, you should see:
   - ❌ NO "Duyệt TP" button
   - ❌ NO "Từ chối" button
   - ❌ Only see status "Chờ TP duyệt Lịch"

**Expected Result:** ✅ No buttons (Different department TP cannot approve)

---

### ✅ SCENARIO 4: GĐ/BGĐ Can Approve Level 2
**Goal:** After Level 1 approval, GĐ can approve at Level 2

1. Previous scenario: Trip is at "Chờ BGĐ duyệt Lịch" status
2. Logout & Login as `TGĐ-001` (Phạm Minh Tùng - TONG_GIAM_DOC)
3. Go to `/business-trip` → "Xem dữ liệu" tab
4. Find the same trip (now at PENDING_L2 status)
5. In **Duyệt Lịch** column, you should see:
   - ✅ Blue button **"Duyệt BGĐ"** 
   - ✅ Red button **"Từ chối"**
6. Click **"Duyệt BGĐ"**
7. See toast: "🎉 Ban Giám Đốc đã duyệt hoàn tất đơn công tác!"
8. Trip status updates to: **"Đã duyệt Lịch"** ✅

**Expected Result:** ✅ Level 2 buttons appear for TGĐ, approval completes successfully

---

### ✅ SCENARIO 5: TGĐ Can See All Trips
**Goal:** TGĐ (Tổng Giám Đốc) has full access regardless of department

1. Login as `TGĐ-001` (Phạm Minh Tùng - TONG_GIAM_DOC)
2. Go to `/business-trip` → "Xem dữ liệu" tab
3. Should see multiple trips from different departments
4. For any trip at **PENDING** status:
   - ✅ Can see "Duyệt TP" button
   - ✅ Can see "Từ chối" button
   - ✅ Can approve even if NOT in same department
5. For any trip at **PENDING_L2** status:
   - ✅ Can see "Duyệt BGĐ" button
   - ✅ Can complete the approval

**Expected Result:** ✅ TGĐ has unrestricted access to all trips, all approval levels

---

### ❌ SCENARIO 6: LT (Lễ Tân) Cannot Approve
**Goal:** Non-approval roles see no buttons

1. Login as `LT-001` (Lễ Tân - LE_TAN role)
2. Go to `/business-trip` → "Xem dữ liệu" tab
3. View any trip at PENDING status
4. In **Duyệt Lịch** column:
   - ❌ NO "Duyệt TP" button
   - ❌ NO "Từ chối" button
   - ✅ Only see status badge
5. Try to directly call approval API (should fail with 403)

**Expected Result:** ✅ No approval access for non-approval roles

---

## 🔍 VERIFICATION CHECKLIST

After each scenario, verify:

- [ ] Correct role can see buttons
- [ ] Wrong role cannot see buttons
- [ ] Status updates after approval
- [ ] Notifications appear
- [ ] No TypeScript/console errors
- [ ] Toast messages show correct messages

---

## 🐛 DEBUG STEPS

If buttons don't appear:

1. **Check currentUser.**
   Open browser DevTools → Console:
   ```javascript
   localStorage.getItem('tbs_current_user')
   // Should show roleCode: "TRUONG_PHONG" (or similar)
   ```

2. **Check Role in Database.**
   Verify in D1 that user has correct role_code:
   ```sql
   SELECT emp_code, role_code, department FROM users WHERE emp_code = '202608001';
   -- Should show: 202608001 | TRUONG_PHONG | NHÂN SỰ-HC
   ```

3. **Test Permission Hook.**
   In Component:
   ```javascript
   const { isExecutiveOrAdmin, user } = usePermission();
   console.log({ isExecutiveOrAdmin, userRoleCode: user?.roleCode });
   ```

4. **Check Button Visibility Logic.**
   Verify in business-trip/page.tsx line 2016:
   ```typescript
   currentUser?.roleCode === "TRUONG_PHONG" &&
   currentUser?.department?.trim().toLowerCase() === rec.department?.trim().toLowerCase()
   ```

---

## 📞 SUPPORT

If buttons still don't show:

1. Clear browser cache: `Ctrl+Shift+Del` → Clear All
2. Re-login with test account
3. Check roleCode in `SYSTEM_USERS` constant
4. Verify D1 database has matching role_code

---

**Status:** ✅ Ready for testing  
**Date:** August 24, 2026

