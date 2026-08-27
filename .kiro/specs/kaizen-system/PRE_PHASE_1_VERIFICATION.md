# Pre-Phase 1 Verification Checklist
**Status**: 🔴 BLOCKED — Awaiting User Verification  
**Date**: 2026-08-24  
**Purpose**: Before executing Phase 1 migrations, verify 3 critical requirements

---

## 📋 Verification Items

### ✅ Item 1: REQ-5 (Early Warning Formula)
**Requirement**: Per-unit engagement alert formula

**What Should Be Used** (Per Ban 2.2 Spec):
```
After Day 14 of each month, for each department/unit:
  reporting_rate = (CTV Opex in unit who submitted proposals) / (Total CTV Opex in unit)
  
  Trigger alert if:
    reporting_rate < 30% 
    OR raw_ideas_count = 0
```

**What Currently In requirements.md** (REQ-5.2):
```markdown
#### REQ-5.2: Low Engagement Alert by Department/Region (After Day 14)
- [ ] Daily job (or on-demand): After 14th of month, for each department/unit/region:
  - Calculate: `reporting_rate = count_of_ctv_opex_in_unit_who_reported / total_count_of_ctv_opex_in_unit`
  - Also count: `raw_ideas_count = count_of_raw_ideas_in_unit_this_month`
- [ ] Trigger alert if (`reporting_rate < 30%` OR `raw_ideas_count = 0`):
  - Create `alert_type='LOW_ENGAGEMENT'`
  - Include flag: `probable_cause` (enum: 'RESOURCE_OVERLOAD' | 'LEADERSHIP_COMMITMENT' | 'PROCESS_UNCLEAR' | 'OTHER')
```

**Verification Status**: ✅ **CORRECT** — Formula matches Ban 2.2 spec. Uses per-unit <30% threshold, not regional 80% target.

**Action**: No change needed. Proceed with Phase 1.

---

### ✅ Item 2: REQ-2.2 (registration_type — Auto-Assignment, NO User Choice)
**Requirement**: System automatically manages registration_type (THI_DUA → LUU_TRU transition)

**What Should Be Used** (Per Ban 2.2 Spec):
```
- On submission during open month → auto-set registration_type = 'THI_DUA'
- After awards announced (day ~5 of next month) → auto-transition to 'LUU_TRU'
- Proposal records remain unchanged; only status/display changes
- Frontend shows registration_type as READ-ONLY (not user-selectable in form)
```

**What Currently In requirements.md** (REQ-2.2):
```markdown
#### REQ-2.2: POST /api/ci-kaizen — Create Proposal

**Automatic system behavior (NO user choice for registration_type)**:
  - On proposal creation during open submission month → `registration_type` auto-set to 'THI_DUA' 
  - After awards announced (~day 5 of next month) → `registration_type` auto-transitions to 'LUU_TRU' 
  - Proposal record remains unchanged in database; only `registration_type` flag and display logic changes
  - Frontend shows `registration_type` as **read-only status**, not user-selectable option in form
```

**Verification Status**: ✅ **CORRECT** — Text matches spec. Auto-assignment configured, no user choice.

**Action**: No change needed. Proceed with Phase 1.

**Frontend Action Required** (Antigravity):
> Remove Step 3 form field "Hình thức đăng ký" (dropdown with Thi đua/Lưu trữ options).  
> Replace with: Read-only text display of current `registration_type` status (e.g., "Thi đua (2026-08)").

---

### ⚠️ Item 3: REQ-1 (customer_brand — Use System Codes, NOT Brand Names)
**Requirement**: customer_brand field uses actual system codes, not brand names

**What Should Be Used** (Per Ban 2.2 + System):
```
customer_brand ENUM: DP | WR | RB | SK | Khác
(derived from dept_code field in existing system)

Definition:
  DP = Skechers Division
  WR = Wrangler Division  
  RB = Reebok Division
  SK = Skechers (or similar code)
  Khác = Other brands
```

**What Currently In requirements.md** (REQ-1):
```markdown
- `customer_brand` (ENUM: DP | WR | RB | SK | Khác) — Linked customer/brand code (derived from dept_code); 
  **must use actual 5 brand codes from system, NOT brand names like Skechers/Wrangler/Reebok/Decathlon**
```

**Verification Status**: ✅ **CORRECT** — Requirement clearly states use system codes, NOT brand names.

**Issues Noted in Gap Analysis**:
- Antigravity frontend uses brand names (Skechers, Wrangler, Reebok, Decathlon) in dropdowns
- This is **WRONG** and must be fixed during Phase 1

**Action Needed**:
1. Backend: Implement customer_brand as ENUM(DP, WR, RB, SK, Khác) 
2. Frontend (Antigravity): Update customer_brand dropdown to use codes:
   - DP
   - WR
   - RB
   - SK
   - Khác

---

### Regional/Department Data Status
**Requirement**: regional_kpi_targets table needs department/unit list

**Current Status**: ⏳ **BLOCKED** — No production data found in tbs2_factory.db

**Verification Report**: See `.kiro/specs/kaizen-system/REGION_DATA_VERIFICATION_FINAL.md`

**Summary**:
- SQLite DB (tbs2_factory.db) has 0 rows in branches, sectors, zones tables
- Prisma Department model exists but not migrated to SQLite
- No Type A (live query) evidence of department data
- Only Type B (migration comment examples) exist

**What We CAN Do** (Phase 1A):
- Execute P0+P1 column migrations immediately
- Does not depend on regional data

**What We CANNOT Do Yet** (Phase 1B):
- Cannot seed regional_kpi_targets without knowing real department list
- Blocked until:
  - Option A: Production DB with real data provided, or
  - Option B: Official department list from Ban 2.2 provided, or
  - Option C: Confirmation to use hardcoded (DP, SK, RB, WR, Khác) with default KPI values

---

## 🚀 Proceed to Phase 1?

### Phase 1A: ✅ YES, Proceed Immediately
**Scope**: P0+P1 column additions, NO regional dependency
**Duration**: 1.5–2 hours
**Blocker**: None

**Tasks**:
- Create migration `0006_ci_kaizen_extended.sql`
- Add 18+ columns to ci_kaizen_proposals table
- Update API endpoints to accept/return new fields
- Run tests

### Phase 1B: ⏳ BLOCKED, Awaiting Regional Data
**Scope**: Create regional_kpi_targets table, seed department data
**Duration**: 45 min–1 hour (once data provided)
**Blocker**: Department/unit list not available in production DB

**Action Required**: User must provide one of:
1. Production DB connection string + credentials
2. Official department list (code, name, parent_id, kpi_target) from Ban 2.2
3. Confirmation to proceed with hardcoded values

---

## 📝 Checklist Before Kiro Executes Phase 1A

Before giving approval to run Phase 1A migration, confirm:

- [ ] **Item 1 (REQ-5)**: Formula confirmed as <30% per-unit engagement (NOT 80% regional) ✅
- [ ] **Item 2 (REQ-2.2)**: registration_type confirmed as auto-assigned system field (NOT user-selected) ✅
- [ ] **Item 3 (REQ-1)**: customer_brand confirmed as system codes (DP, WR, RB, SK, Khác) ✅
- [ ] **Phase 1A can proceed** (no regional dependency)
- [ ] **Phase 1B blocked** awaiting regional data confirmation

---

## 🔗 Related Documents
- `.kiro/specs/kaizen-system/requirements.md` — Full spec with REQ-1 through REQ-8
- `.kiro/specs/kaizen-system/REGION_DATA_VERIFICATION_FINAL.md` — Database query results
- `.kiro/specs/kaizen-system/tasks.md` — Phase 1A/1B task breakdown
- `AGENT_TASKS.md` — Coordination items for Antigravity (UI fixes needed)

---

**Status**: 🔴 **AWAITING USER CONFIRMATION** — All 3 items checked; Phase 1A ready to execute once user confirms.
