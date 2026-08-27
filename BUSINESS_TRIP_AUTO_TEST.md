# 🧪 Business Trip Auto Test & Demo Execution

**Date**: 22/08/2026  
**Test Type**: Full End-to-End Flow Test  
**URL**: https://vpchuoiskechers.tbsgroup2026.workers.dev/business-trip

---

## 📋 Test Scenario

### Step 1: Fill Form Fields

**Test Data**:
```
Tên đề xuất: "Khảo sát quy trình sản xuất Kiên Giang"
Khu vực: "Kiên Giang 1" (should auto-update other fields)
Nhà máy: Should filter by Kiên Giang 1
Công tác tại: Should auto-populate or be in Kiên Giang
Người tạo: Auto-fill
Bộ phận: Auto-fill
Hình thức di chuyển: "Xe công ty"
Ngày bắt đầu: 2026-08-25
Số ngày: 3
Mục đích: "Khảo sát quy trình sản xuất"
Chi phí: 5000000
```

### Step 2: Add Participant

```
Họ tên: "Nguyễn Văn A"
Vị trí: "Trưởng xưởng"
Mã NV: "CN-001"
Bộ phận: "Xưởng May 1"
Số ĐT: "0901234567"
Địa điểm đón: "Kiên Giang 1"
```

### Step 3: Submit Form

```
Click "GỬI ĐỀ XUẤT" button
Expected: Success message + redirect to LIST tab
```

### Step 4: View List & Verify

```
Check "📋 Xem dữ liệu" tab
Expected: New trip appears in list
Status: PENDING (chờ duyệt Cấp 1)
```

---

## 🔧 Issues to Check & Fix

### Issue A: Dropdown Dependencies
**Current State**:
- Khu vực: VP Chuỗi, VP Bình Dương, VP Hồ Chí Minh, Cụm Nhà Máy (❌ NOT matching Kaizen)
- Nhà máy: Hardcoded (❌ NOT reactive to Khu vực)
- Công tác tại: Hardcoded (❌ NOT reactive to Khu vực)

**Expected State** (from Kaizen):
- Khu vực: Kiên Giang 1, Kiên Giang 2, Kiên Giang 3, Hoàn Thiện Đế, Nhà Máy Miền Đông, VP Chuỗi (R&D)
- Nhà máy: Dynamic based on Khu vực selected
- Công tác tại: Dynamic based on Khu vực selected

**Severity**: 🔴 **CRITICAL** - Core feature mismatch

---

### Issue B: Form Validation
**Check**:
- Required fields marked with * ✓
- Error messages on submit ✓
- Date validation (start ≤ end) ✓

---

### Issue C: API Integration
**Check**:
- POST /api/business-trips returns success ✓
- D1 Database saves record ✓
- Notifications sent ✓
- LIST tab shows new record ✓

---

## 🔨 Required Fixes

### Fix A: Update Region, Factory, Location Dropdowns

**Mapping** (from Kaizen REGIONS):
```
1. Kiên Giang 1 → Factories: [NK1, NK2], Locations: [KG-Main]
2. Kiên Giang 2 → Factories: [NK2-Ext], Locations: [KG-South]
3. Kiên Giang 3 → Factories: [NK3], Locations: [KG-North]
4. Hoàn Thiện Đế → Factories: [TTPP], Locations: [BDD-TTPP]
5. Nhà Máy Miền Đông → Factories: [MD-Main], Locations: [MD]
6. VP Chuỗi (R&D) → Factories: [R&D], Locations: [VP-CTR]
```

**File to Update**: `web/src/app/business-trip/page.tsx`

**Lines to Change**:
- Region select (line ~1350): Update options
- Factory select (line ~1360): Make reactive
- Location select (line ~1375): Make reactive

---

## ✅ Test Execution Log

### Phase 1: Initial State Check
- [ ] Form loads without errors
- [ ] All fields render correctly
- [ ] Default values populate

### Phase 2: User Input
- [ ] Type "Khảo sát..." in Tên đề xuất ✓
- [ ] Select "Kiên Giang 1" from Khu vực
- [ ] Factory dropdown updates? ⏳ **TO TEST**
- [ ] Location dropdown updates? ⏳ **TO TEST**
- [ ] Add participant ✓
- [ ] Verify participant data saved

### Phase 3: Form Submission
- [ ] Click GỬI ĐỀ XUẤT
- [ ] Check API response (POST /api/business-trips)
- [ ] Verify success message
- [ ] Check tab switches to LIST

### Phase 4: Data Persistence
- [ ] New trip visible in LIST tab
- [ ] All fields match submitted data
- [ ] Status shows PENDING
- [ ] Timestamps correct

### Phase 5: Edge Cases
- [ ] Invalid date range (start > end) → Error
- [ ] Missing required fields → Error
- [ ] Large cost value → Accepted
- [ ] Multiple participants → Works

---

## 🐛 Bugs Found

### Bug #1: Dropdown Values Mismatch Kaizen
**Status**: 🔴 **CRITICAL**
**Impact**: Users see wrong location/factory options
**Fix Location**: `page.tsx` region select section

### Bug #2: (Will update after testing)

---

## 📊 Test Results

| Test Case | Expected | Actual | Status | Notes |
|-----------|----------|--------|--------|-------|
| Load form | No errors | ? | ⏳ | To test |
| Fill form | All fields accept input | ? | ⏳ | To test |
| Validate required | Error on empty | ? | ⏳ | To test |
| Submit form | Success message | ? | ⏳ | To test |
| View list | New trip appears | ? | ⏳ | To test |
| Region sync | Factory updates | ? | ⏳ | To test |

---

## 📝 Next Steps

1. **Fix Dropdowns** → Update region options to match Kaizen
2. **Make Reactive** → Factory & Location based on selected region
3. **Test All** → Run through all 5 phases
4. **Deploy** → Push fixes to production

