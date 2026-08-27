# Specification Corrections Applied — 2026-08-24
**Status**: ✅ COMPLETE - Ready for Phase 1 Implementation

---

## Summary of Changes

Three major corrections were applied to requirements.md based on user verification:

### ✅ Correction 1: REQ-5 (Early Warning Alert Formula)

**What Was Changed**:
- ❌ **Removed**: REQ-5.2 (regional KPI target-based alerts with 80%/30% thresholds)
- ✅ **Added**: REQ-5.2 (Low Engagement Alert by Department/Region)

**New Formula (REQ-5.2 — Correct)**:
```
For EACH department/unit/region:
  reporting_rate = count_of_ctv_opex_in_unit_who_reported / total_count_of_ctv_opex_in_unit

Trigger AFTER day 14:
  IF (reporting_rate < 30% OR raw_ideas_count = 0):
    → Create alert_type='LOW_ENGAGEMENT'
    → Include probable_cause flag:
       - RESOURCE_OVERLOAD: CTV quá tải
       - LEADERSHIP_COMMITMENT: GĐ chưa cam kết
       - PROCESS_UNCLEAR: Quy trình không rõ
       - OTHER: Cần xác định thêm
    → Target audience: Ban 2.2 (để phân loại nguyên nhân trước can thiệp)
```

**Why**: Per Ban 2.2 official spec: trigger at 30% engagement threshold PER UNIT, not 80% of total company target. Regional targets are DYNAMIC (depend on number of active CTVs per unit), not fixed monthly numbers.

---

### ✅ Correction 2: REQ-2.2 (registration_type — System Auto-Assign, Not User Choice)

**What Was Changed**:
- ❌ **Removed**: User manually selects "Thi đua" vs "Lưu trữ" at Step 3 of form
- ✅ **Added**: System auto-manages registration_type based on proposal lifecycle

**New Logic (REQ-2.2 — Correct)**:
```
On proposal creation during open submission month:
  → registration_type = 'THI_DUA' (auto-set, cannot be changed by user)

After awards announced (~day 5 next month):
  → registration_type auto-transitions to 'LUU_TRU' (archival mode)
  → Proposal record stays in DB; only registration_type flag + display changes

Frontend behavior:
  → Show registration_type as READ-ONLY STATUS (not user-selectable)
  → Display: "This proposal is currently in: THI_DUA (Competition)"
  → NO dropdown/toggle for user to choose
```

**Impact on Antigravity**:
- ⚠️ **MUST REMOVE**: UI step/selector for "Hình thức đăng ký" (Thi đua/Lưu trữ) in Bước 3
- ⚠️ **MUST ADD**: Read-only status display showing auto-assigned type (e.g., "Đã nộp thi đua — 20 ngày còn lại đến hạn chót")

**Why**: Per Ban 2.2 spec: 100% proposals passing pre-conditions go to library (LUU_TRU) after evaluation. User choice of "archive vs compete" contradicts this. System lifecycle should control state.

---

### ✅ Correction 3: REQ-1 (customer_brand & Regional Data — Use Real System Data, Not Demo)

**What Was Changed**:
- ❌ **Removed**: customer_brand as free-text or brand names (Skechers, Decathlon, Wrangler, Reebok, LEFASO)
- ✅ **Updated**: customer_brand ENUM with 5 actual system codes: DP | WR | RB | SK | Khác

**New Definition (REQ-1 — Correct)**:
```
customer_brand (ENUM: DP | WR | RB | SK | Khác)
  ├─ NOT brand names (Skechers, Wrangler, Reebok, Decathlon)
  ├─ MUST be actual dept_code / customer codes from system
  └─ 5 values: DP, WR, RB, SK, Khác (mapped from existing database)

regional_kpi_targets table:
  ├─ [BLOCKING] Cannot create until Ban 2.2 provides OFFICIAL list
  ├─ DO NOT ASSUME: Kiên Giang 1/2/3, Hoàn Thiện Đế, Nhà Máy Miền Đông, VP R&D
  ├─ NOTE: LEFASO is a UNIT/DEPARTMENT, not a customer brand
  └─ Action: Query existing DB for regions/units OR request formal list from Ban 2.2
```

**P1 Fields (Clarified as "From Antigravity Demo, Requires Confirmation")**:
```
[BỔ SUNG THEO NHU CẦU VẬN HÀNH THỰC TẾ CỦA TBS — không có trong văn bản Ban 2.2 gốc]

Fields marked as requiring Product Owner confirmation:
  • product_group, product_code, product_quantity
  • supervisor_name, hr_suggestor_name, dept_approval_status
  • before_video_url, after_video_url
  • proposed_month, proposed_year

These are NOT from official Ban 2.2 spec; added by Antigravity for demo.
Each must be confirmed by Product Owner before treating as mandatory.
```

**Impact on Antigravity**:
- ⚠️ **MUST FIX**: Dropdown for "customer_brand" (Bước 3) → Use values: DP, WR, RB, SK, Khác
- ⚠️ **MUST NOT** use brand names like "Skechers", "Decathlon", "Wrangler", "Reebok"
- ⚠️ **MUST NOT** hardcode region list; wait for official list or query from DB

**Why**: 
1. customer_brand values must match existing system codes (to avoid data mismatch with other systems)
2. Regional/unit data is dynamic and organization-specific; Antigravity demo assumed specific structure
3. Using demo data in production risks incorrect business logic

---

## Updated Files

| File | Changes |
|---|---|
| `.kiro/specs/kaizen-system/requirements.md` | ✅ REQ-1, REQ-2.2, REQ-5 updated with corrections |
| `AGENT_TASKS.md` | ✅ Added blocking items for Antigravity UI fixes + Kiro data validation |

---

## Blocking Actions for Antigravity

**Two UI changes MUST be completed before Antigravity can test with updated backend**:

### 1. Remove Manual Registration Type Selection (Bước 3)
- [ ] Delete/hide "Hình thức đăng ký" dropdown (Thi đua / Lưu trữ)
- [ ] Replace with read-only status display
- [ ] Example display: "Loại: Thi đua (phúc trình tự động sau công bố giải)"

### 2. Fix Customer Brand Dropdown (Bước 3)
- [ ] Update dropdown values to: **DP | WR | RB | SK | Khác**
- [ ] Remove brand names: "Skechers", "Decathlon", "Wrangler", "Reebok", "LEFASO"
- [ ] Verify dropdown loads from system data, not hardcoded

---

## Blocking Actions for Kiro

**Before running migration scripts**:

### 1. Validate customer_brand Codes
- [ ] Query production database for all actual customer/brand codes
- [ ] Confirm which codes are active (DP, WR, RB, SK, Khác)
- [ ] Do NOT assume; verify against HR/Finance system of record

### 2. Obtain Official Regional/Unit List
- [ ] Request from Ban 2.2 or Product Owner: "Danh sách chính thức tất cả khu vực/đơn vị cần tracking"
- [ ] Confirm scope: Company-wide? Factory-specific? Department-only?
- [ ] Verify LEFASO classification (is it a factory/region or customer brand?)
- [ ] Do NOT use: Kiên Giang 1/2/3, Hoàn Thiện Đế, Nhà Máy Miền Đông, VP R&D (unless confirmed)

### 3. Seed Data Strategy
- [ ] If DB already has regions/units table: QUERY it → use as source for regional_kpi_targets seed
- [ ] If DB has no such table: WAIT for official list, then create and seed atomically
- [ ] Include data provenance comment: "Seeded from [source] on [date] — maintain sync with source table"

---

## READY FOR PHASE 1?

**✅ YES** — After above corrections:
1. ✅ requirements.md updated with correct formulas
2. ✅ Antigravity notified of UI fixes needed
3. ✅ Kiro directed to use system data, not demo data
4. ✅ Blocking items for both teams documented in AGENT_TASKS.md

**Proceed to Phase 1 (Database Migrations) when**:
- ✅ Antigravity confirms UI fixes are in progress or complete
- ✅ Kiro has validated customer_brand codes from actual system
- ✅ Kiro has obtained (or decided to dynamically query) official regional list

---

**Updated by**: Kiro Backend Agent  
**Date**: 2026-08-24  
**Status**: ✅ CORRECTIONS COMPLETE — BLOCKING ITEMS DOCUMENTED

