# BUSINESS TRIP FORM - DIAGNOSTIC TEST
**Date**: August 22, 2026  
**Status**: RUNNING DIAGNOSTICS

---

## ISSUE REPORTED
Form at https://vpchuoiskechers.tbsgroup2026.workers.dev/business-trip is throwing errors on submission.

Error message: "Lỗi tạo đề xuất D1: ... (Error creating proposal D1)"

---

## DIAGNOSTIC CHECKLIST

### Phase 1: Form Load Check
- [ ] Form HTML renders without JavaScript errors
- [ ] REGION_MAPPING is properly defined (6 regions)
- [ ] Region dropdown shows all 6 options
- [ ] Initial region is "VP Chuỗi (R&D)" (exists in REGION_MAPPING)
- [ ] Factory dropdown shows factories for initial region
- [ ] Location dropdown shows locations for initial region
- [ ] All form fields render correctly

### Phase 2: Field Validation
**Required Fields** (marked with *):
- [x] Title / Tên đề xuất *
- [x] Region / Khu vực *
- [x] Factory / Nhà máy *
- [x] Location / Công tác tại *
- [x] Purpose / Mục đích công tác *
- [x] StartDate / Ngày bắt đầu *
- [x] Creator / Người tạo *
- [x] Department / Bộ phận *
- [x] Transport / Hình thức di chuyển *

**Optional Fields**:
- [ ] Address / Địa chỉ
- [ ] Proposal Text / Ghi chú
- [ ] Estimated Cost / Chi phí dự kiến

### Phase 3: Form State Check
```javascript
// Check if proposalForm initializes correctly:
proposalForm = {
  title: "",                    // Empty - needs value
  region: "VP Chuỗi (R&D)",    // OK - matches REGION_MAPPING
  factory: "",                  // Should auto-populate from REGION_MAPPING
  location: "",                 // Should auto-populate from REGION_MAPPING
  creator: "Ban Quản Lý",      // Default OK
  department: "Hành chính",     // Default OK
  transport: "",                // Empty - needs value
  startDate: "2026-08-15",      // Default date OK
  daysCount: 1,                 // Default OK
  endDate: "2026-08-15",        // Default OK
  purpose: "",                  // Empty - needs value
  address: "",                  // Optional
  proposalText: "",             // Optional
  estimatedCost: 0,             // Optional
}
```

**Issues Found**:
- [ ] Factory not initialized from REGION_MAPPING
- [ ] Location not initialized from REGION_MAPPING
- [ ] Transport is empty (required)
- [ ] Purpose is empty (required)
- [ ] Title is empty (required)

### Phase 4: Cascade Logic Check
```javascript
// When region selected, should update:
onChange={(e) => {
  const newRegion = e.target.value;
  setProposalForm({ 
    region: newRegion,
    factory: REGION_MAPPING[newRegion]?.factories[0] || "",
    location: REGION_MAPPING[newRegion]?.locations[0] || ""
  });
}}
```

Expected behavior:
- [x] Region changes → factory updates to first option
- [x] Region changes → location updates to first option
- [x] REGION_MAPPING has data for selected region

### Phase 5: API Request Check
```javascript
// When submit clicked, sends POST to /api/business-trips
POST /api/business-trips
{
  id: "rec_1724337600000",
  code: "CT-2026-020",
  title: "Test Trip",
  region: "VP Chuỗi (R&D)",
  factory: "Văn Phòng Chuỗi Chính",
  location: "VP Chuỗi - Trụ sở",
  creator: "Ban Quản Lý",
  department: "Hành chính",
  startDate: "15/08/2026",
  endDate: "15/08/2026",
  daysCount: 1,
  transport: "Xe công ty",
  purpose: "Test",
  address: "",
  proposalText: "",
  estimatedCost: 0,
  // ... more fields
}
```

Expected Response (Success):
```javascript
{
  success: true,
  message: "Đã tạo đề xuất công tác thành công!",
  id: "rec_1724337600000",
  code: "CT-2026-020"
}
```

Expected Response (Error):
```javascript
{
  success: false,
  error: "Error message"
}
```

### Phase 6: D1 Database Check
- [x] Business trips table exists
- [x] All required columns exist
- [x] INSERT statement syntax correct
- [x] Database binding (env.DB) available

---

## ROOT CAUSE ANALYSIS

### Possible Issues

**Issue #1: Form State Not Initialized**
- Factory and location start as empty strings
- Not auto-populated from REGION_MAPPING on mount
- **Fix**: Add useEffect to initialize from REGION_MAPPING

**Issue #2: Required Fields Missing**
- User submits form without filling required fields
- Validation on backend may fail
- **Fix**: Add client-side validation before submit

**Issue #3: REGION_MAPPING Key Mismatch**
- Default region key doesn't match REGION_MAPPING
- Factory/location lookups return undefined
- **Status**: FIXED (changed to "VP Chuỗi (R&D)")

**Issue #4: API Validation Too Strict**
- Backend validates fields that frontend doesn't require
- **Fix**: Update validation logic

**Issue #5: D1 Database Column Issue**
- One of the columns doesn't exist
- INSERT statement fails
- **Fix**: Check schema and add missing columns if needed

---

## PROPOSED FIXES

### Fix #1: Initialize Factory & Location on Mount
**File**: `web/src/app/business-trip/page.tsx`
**Action**: Add useEffect to initialize factory/location when component mounts

```javascript
useEffect(() => {
  // Initialize factory and location from REGION_MAPPING
  const defaultRegion = "VP Chuỗi (R&D)";
  const factories = REGION_MAPPING[defaultRegion]?.factories || [];
  const locations = REGION_MAPPING[defaultRegion]?.locations || [];
  
  setProposalForm(prev => ({
    ...prev,
    factory: factories[0] || "",
    location: locations[0] || ""
  }));
}, []);
```

### Fix #2: Add Client-Side Validation
**File**: `web/src/app/business-trip/page.tsx`
**Action**: Check all required fields before submit

```javascript
const handleSubmitForm = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Required field validation
  if (!proposalForm.title?.trim()) {
    alert("Tên đề xuất công tác là bắt buộc!");
    return;
  }
  if (!proposalForm.region) {
    alert("Khu vực là bắt buộc!");
    return;
  }
  if (!proposalForm.factory) {
    alert("Nhà máy là bắt buộc!");
    return;
  }
  if (!proposalForm.location) {
    alert("Công tác tại là bắt buộc!");
    return;
  }
  if (!proposalForm.purpose?.trim()) {
    alert("Mục đích công tác là bắt buộc!");
    return;
  }
  if (!proposalForm.transport) {
    alert("Hình thức di chuyển là bắt buộc!");
    return;
  }
  if (!proposalForm.creator?.trim()) {
    alert("Người tạo là bắt buộc!");
    return;
  }
  if (!proposalForm.department?.trim()) {
    alert("Bộ phận là bắt buộc!");
    return;
  }
  
  // If all validations pass, proceed with submit
  // ...rest of submit logic
}
```

### Fix #3: Better Error Handling in Backend
**File**: `web/public/_worker.js`
**Action**: Already applied - added validation before INSERT

---

## IMPLEMENTATION STATUS

- [x] Fix #3 Applied: Better error handling in worker
- [x] Build passes: Exit Code 0
- ⏳ Fix #1 Pending: Initialize factory/location on mount
- ⏳ Fix #2 Pending: Client-side validation enhancement

---

## NEXT STEPS

1. Implement Fix #1 (Initialize factory/location)
2. Implement Fix #2 (Client-side validation)
3. Rebuild project
4. Test form submission
5. Verify error messages are clear

---

## TESTING STEPS (After Fixes Applied)

1. Load form: https://vpchuoiskechers.tbsgroup2026.workers.dev/business-trip
2. Verify factory/location are pre-populated
3. Try to submit empty form → should show validation errors
4. Fill form properly:
   - Title: "Test Công Tác"
   - Region: "Kiên Giang 1" (change from default)
   - Factory: Should auto-update to Kiên Giang 1 factory
   - Location: Should auto-update to Kiên Giang 1 location
   - Transport: Select a transport method
   - Purpose: "Test Purpose"
5. Submit form → should succeed
6. Check LIST tab → new trip should appear

---

**Status**: Ready for implementation
**Priority**: HIGH - Form is currently broken
**Difficulty**: LOW - Straightforward fixes

