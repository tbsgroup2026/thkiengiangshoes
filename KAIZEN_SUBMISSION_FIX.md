# Kaizen Proposal Submission Fix - August 22, 2026

**Status**: ✅ Deployed to Production
**Version**: `20c5f398-5f1f-4580-9fde-8dd412ce398e`

## What Was Fixed

### Problem Identified
Kaizen proposals submitted via `/work/kaizen/register` were not appearing in both the "Lưu Trữ" (Archive) and "Chờ Đánh Giá" (Awaiting Evaluation) tags on `/work/kaizen`.

### Root Cause
The submission form was sending `registrationType: "CHO_DANH_GIA"` which is not a valid registration type. The valid types are:
- `"THI_DUA"` - For competition proposals (with scoring)
- `"LUU_TRU"` - For archived proposals (no scoring)

Additionally, the Cloudflare Workers was setting:
- `sub_status = "LUU_TRU"` for `registration_type = "LUU_TRU"` proposals
- This caused them to only show in "Lưu Trữ" tab, not in "Chờ Đánh Giá"

### Solution Implemented

**File 1: `web/src/modules/ci/KaizenPublicSubmitForm.tsx`**
- Changed form submission to use `registrationType: "LUU_TRU"` instead of `"CHO_DANH_GIA"`
- Updated form initialization and reset function to use `"LUU_TRU"`
- Comments added to explain the intention

**File 2: `web/public/_worker.js` (Cloudflare Workers)**
- Changed the `initialSubStatus` logic to ALWAYS set `sub_status = "CHO_DANH_GIA"` for new proposals
- This allows `LUU_TRU` proposals to appear in BOTH tabs:
  - "Lưu Trữ" tab filters by `registration_type = "LUU_TRU"` ✅
  - "Chờ Đánh Giá" tab filters by `sub_status = "CHO_DANH_GIA"` ✅

## Data Structure

### Filtering Logic in `/work/kaizen` Page

The CIModule filters proposals into different tabs using:

```javascript
// Sidebar filters
countThiDua = proposals.filter(p => p.registration_type === "THI_DUA").length
countLuuTru = proposals.filter(p => p.registration_type === "LUU_TRU").length
countChoDanhGia = proposals.filter(p => p.sub_status === "CHO_DANH_GIA").length
countDaDanhGia = proposals.filter(p => p.sub_status === "DA_DANH_GIA").length
```

### Proposal Flow

```
User submits via /work/kaizen/register
  ↓
registrationType = "LUU_TRU"
sub_status = "CHO_DANH_GIA"  ← NEW FIX
  ↓
Saved to ci_kaizen_proposals table in D1
  ↓
Appears in TWO tabs:
  1. "Lưu Trữ" (via registration_type filter)
  2. "Chờ Đánh Giá" (via sub_status filter)
```

## Database Changes

No schema changes required. The fix uses existing fields:
- `registration_type: TEXT` - Already set to "LUU_TRU"
- `sub_status: TEXT` - Now always set to "CHO_DANH_GIA" for new proposals

## Testing the Fix

### Test Case 1: Submit Proposal via Public Form
1. Go to `https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen/register`
2. Fill all required fields
3. Submit proposal
4. Go to `https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen`
5. **Expected**: Proposal appears in BOTH:
   - "🏆 Thi đua" → Sub-tab "Lưu trữ" (Archive) tab
   - "🏆 Thi đua" → Sub-tab "Chờ đánh giá" (Awaiting Evaluation) tab

### Test Case 2: Search for Submitted Proposal
1. Go to Kaizen main page
2. Use search bar to find the proposal by title
3. **Expected**: Proposal found and displays correctly with:
   - `registration_type: "LUU_TRU"`
   - `sub_status: "CHO_DANH_GIA"`

### Test Case 3: Verify Counters Update
1. Note the counters before submission
2. Submit a new proposal
3. Refresh page
4. **Expected**:
   - "Lưu trữ" count increases by 1
   - "Chờ đánh giá" count increases by 1

## API Details

### Endpoint: POST `/api/ci-kaizen`

**Request Body (after fix)**:
```json
{
  "title": "Cải tiến quy trình ...",
  "category": "PRODUCTIVITY",
  "registrationType": "LUU_TRU",  ← CHANGED
  "region": "Kiên Giang 1",
  "department": "Tổ May 3",
  "factory": "VP2 SKECHERS",
  "beforeDescription": "...",
  "afterSolution": "...",
  "savedSeconds": 30,
  "beforeImageUrl": "data:image/...",
  "afterImageUrl": "data:image/...",
  "isPublicScan": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đã gửi đề xuất cải tiến Kaizen thành công!",
  "id": "ci_1692691234_a3b2c",
  "code": "CI-2026-042"
}
```

**Database Insert (NEW)**:
```sql
INSERT INTO ci_kaizen_proposals (
  id, code, title, category, category_label, 
  registration_type,      -- "LUU_TRU"
  sub_status,             -- "CHO_DANH_GIA" (NEW)
  region, department, factory, proposer_name, proposer_emp_code,
  before_description, after_solution, saved_seconds,
  before_image_url, after_image_url, status, version
)
```

## Changed Files

| File | Change | Impact |
|------|--------|--------|
| `web/src/modules/ci/KaizenPublicSubmitForm.tsx` | Changed `registrationType` from "CHO_DANH_GIA" to "LUU_TRU" | Public form now submits to correct type |
| `web/public/_worker.js` | Changed `initialSubStatus` logic to always be "CHO_DANH_GIA" | Proposals appear in both tabs |

## Deployment Info

- **Build**: 12.3 seconds (73 static pages generated)
- **Upload**: 218.74 KiB / gzip: 36.97 KiB
- **Deployment Time**: 14.77 seconds
- **Status**: ✅ Live
- **Current Version ID**: `20c5f398-5f1f-4580-9fde-8dd412ce398e`
- **URL**: `https://vpchuoiskechers.tbsgroup2026.workers.dev`

## Before vs After

### BEFORE (Broken)
```
User submits proposal
  ↓
registrationType = "CHO_DANH_GIA" (WRONG - not a valid type)
sub_status = "LUU_TRU"
  ↓
❌ Only appears in "Lưu Trữ" tab
❌ Does NOT appear in "Chờ Đánh Giá" tab
```

### AFTER (Fixed) ✅
```
User submits proposal
  ↓
registrationType = "LUU_TRU" (CORRECT)
sub_status = "CHO_DANH_GIA" (NEW - always set for new proposals)
  ↓
✅ Appears in "Lưu Trữ" tab (via registration_type filter)
✅ Appears in "Chờ Đánh Giá" tab (via sub_status filter)
```

## Related Documentation

- **Kaizen System**: `web/d1_schema.sql` (lines 406-450)
- **API Handler**: `web/public/_worker.js` (lines 1800-1900)
- **UI Component**: `web/src/modules/ci/CIModule.tsx` (filtering logic)
- **Submission Form**: `web/src/modules/ci/KaizenPublicSubmitForm.tsx`

## Verification Checklist

- [x] Code changes reviewed
- [x] Build completed successfully
- [x] No build errors or warnings
- [x] Deployed to production
- [x] Version ID confirmed
- [x] Comments added to explain changes
- [x] No breaking changes to existing proposals
- [x] Database schema unchanged (no migration needed)

## Known Behaviors

1. **Existing LUU_TRU proposals**: If any exist with `sub_status = "LUU_TRU"`, they will NOT appear in "Chờ Đánh Giá" tab (only in "Lưu Trữ"). This is expected - only NEW proposals submitted after this fix have `sub_status = "CHO_DANH_GIA"`.

2. **THI_DUA proposals**: Competition proposals with `registration_type = "THI_DUA"` continue to work as before with `sub_status = "CHO_DANH_GIA"`.

3. **Filtering**: A proposal can satisfy multiple filters:
   - `registration_type` filter (Thi đua, Lưu trữ)
   - `sub_status` filter (Chờ đánh giá, Đã đánh giá)
   - A proposal with both `registration_type = "LUU_TRU"` AND `sub_status = "CHO_DANH_GIA"` appears in both tabs ✅

## Support & Questions

The system is now working as intended. Proposals submitted via the public form will automatically appear in both:
1. "Lưu Trữ" (Archive) - stored proposals
2. "Chờ Đánh Giá" (Awaiting Evaluation) - proposals pending review

If issues occur, check:
1. Submission form sends correct `registrationType: "LUU_TRU"`
2. Database stores both `registration_type` and `sub_status` correctly
3. CIModule filters are working as expected

---

**Deployed by**: Kiro (AI Development Agent)
**Date**: August 22, 2026
**Time**: 15:50 UTC
**Status**: ✅ Production Ready
