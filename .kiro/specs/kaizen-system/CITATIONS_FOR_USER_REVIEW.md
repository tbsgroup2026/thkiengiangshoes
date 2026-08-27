# Direct Citations from requirements.md — For User Review
**Purpose**: User requested exact quotes (not summaries) from 3 sections before approving Phase 1  
**Source**: `.kiro/specs/kaizen-system/requirements.md`  
**Date**: 2026-08-24

---

## Citation 1: REQ-5 (Early Warning Formula)

**From**: REQ-5.2: Low Engagement Alert by Department/Region (After Day 14)

**Exact Quote**:
```
- [ ] Daily job (or on-demand): After 14th of month, for each department/unit/region:
  - Calculate: `reporting_rate = count_of_ctv_opex_in_unit_who_reported / total_count_of_ctv_opex_in_unit`
  - Also count: `raw_ideas_count = count_of_raw_ideas_in_unit_this_month`
- [ ] Trigger alert if (`reporting_rate < 30%` OR `raw_ideas_count = 0`):
  - Create `alert_type='LOW_ENGAGEMENT'`
  - Include flag: `probable_cause` (enum: 'RESOURCE_OVERLOAD' | 'LEADERSHIP_COMMITMENT' | 'PROCESS_UNCLEAR' | 'OTHER')
    - `RESOURCE_OVERLOAD`: CTV Opex quá tải, không có thời gian phản hồi
    - `LEADERSHIP_COMMITMENT`: Giám đốc/quản lý chưa thực sự cam kết với phong trào
    - `PROCESS_UNCLEAR`: Quy trình báo cáo không rõ ràng
    - `OTHER`: Cần xác định thêm
- [ ] Alert message: "Đơn vị {department} có tỷ lệ báo cáo {reporting_rate}% và {raw_ideas_count} ý tưởng thô. Nguyên nhân có thể: {probable_cause}"
- [ ] Target audience: Ban 2.2 leadership (để phân loại nguyên nhân trước can thiệp)
- [ ] Store in alerts table with `department_id`, `alert_month`, `alert_year` for tracking
- [ ] Related endpoint: `GET /api/ci-kaizen/alerts?alert_type=LOW_ENGAGEMENT&department={dept_id}`
```

**User Question**: "Công thức nào: <30% per-unit hay 80% regional?"  
**Answer**: ✅ **<30% per-unit** — Exact text: `reporting_rate < 30%` calculated per department/unit. NOT 80% regional.

---

## Citation 2: REQ-2.2 (registration_type Field — Auto-Assignment vs User Choice)

**From**: REQ-2.2: POST /api/ci-kaizen — Create Proposal

**Exact Quote** (Automatic system behavior section):
```
- [ ] **Automatic system behavior (NO user choice for registration_type)**:
  - On proposal creation during open submission month → `registration_type` auto-set to 'THI_DUA' (default for current month competition)
  - After awards announced (~day 5 of next month) → `registration_type` auto-transitions to 'LUU_TRU' (archival mode)
  - Proposal record remains unchanged in database; only `registration_type` flag and display logic changes
  - Frontend shows `registration_type` as **read-only status**, not user-selectable option in form
```

**Additional Context**:
```
**Related Frontend**: KaizenFiveStepSubmitForm.tsx (all 5 steps POST data; **Antigravity must remove manual registration_type selection from Step 3 UI, replace with read-only display of auto-assigned type**)
```

**User Question**: "(a) người nộp tự chọn ở Bước 3, hay (b) hệ thống tự động phân loại?"  
**Answer**: ✅ **(b) Hệ thống tự động** — NO user choice. Text explicitly states "NO user choice for registration_type" and "Frontend shows registration_type as read-only status, not user-selectable option in form".

---

## Citation 3: REQ-1 (customer_brand — Field Source Mapping)

**From**: REQ-1: Database Schema Extensions — Acceptance Criteria

**Exact Quote** (P0 Fields section):
```
- [ ] P0 Fields Added (7 critical columns):
  ...
  - `customer_brand` (ENUM: DP | WR | RB | SK | Khác) — Linked customer/brand code (derived from dept_code); **must use actual 5 brand codes from system, NOT brand names like Skechers/Wrangler/Reebok/Decathlon**
```

**Additional Context** (Important Notes on Field Sourcing section):
```
**Important Notes on Field Sourcing**:
- **From Official Ban 2.2 Spec**: proposer_position, topic_group, pricing_direction, time_before_seconds, time_after_seconds, efficiency_value_vnd, safety_confirmed
- **From Antigravity Demo Implementation (verify with PO)**: product_group, product_code, product_quantity, supervisor_name, hr_suggestor_name, dept_approval_status, before_video_url, after_video_url, proposed_month, proposed_year
- **Customer Brand Codes**: Use actual system values (DP, WR, RB, SK, Khác) — queried from `dept_code` field in existing system. Do NOT assume brand names (Skechers, Wrangler, Reebok, Decathlon).
```

**Also in P0 Scoring Fields section**:
```
- [ ] P1 Fields Added (11 important columns) — **[BỔ SUNG THEO NHU CẦU VẬN HÀNH THỰC TẾ CỦA TBS — không có trong văn bản Ban 2.2 gốc, cần Product Owner xác nhận trước khi coi là bắt buộc]**:
```

**User Question**: "Field nào từ Ban 2.2 gốc, nào từ Antigravity demo?"  
**Answer**: 
- ✅ **customer_brand = DP|WR|RB|SK|Khác**: From system (actual codes)
- ✅ **NOT brand names** (Skechers, Wrangler, Reebok, Decathlon): These are WRONG
- ⚠️ **P1 fields marked [CẦN XÁC NHẬN VỚI BAN 2.2]**: product_group, product_code, product_quantity, supervisor_name, etc. — From Antigravity demo, need PO confirmation

---

## Additional Verification: P1 Fields Disclaimer

**From**: REQ-1, P1 Fields section

**Exact Quote**:
```
- [ ] P1 Fields Added (11 important columns) — **[BỔ SUNG THEO NHU CẦU VẬN HÀNH THỰC TẾ CỦA TBS — không có trong văn bản Ban 2.2 gốc, cần Product Owner xác nhận trước khi coi là bắt buộc]**:
  - `proposed_month` (INTEGER) — Month of submission (1–12)
  - `proposed_year` (INTEGER) — Year of submission (YYYY)
  - `product_group` (VARCHAR 255) — Product/service category
  - `product_code` (VARCHAR 50) — Product SKU
  - `product_quantity` (INTEGER) — Order quantity affected
  - `supervisor_name` (VARCHAR 255) — Department supervisor approval
  - `hr_suggestor_name` (VARCHAR 255) — HR guide/mentor name
  - `dept_approval_status` (ENUM: DA_XAC_NHAN | DANG_CHO | TU_CHOI)
  - `before_video_url` (TEXT) — Baseline video evidence URL
  - `after_video_url` (TEXT) — Optimized video evidence URL
  - `safety_confirmed` (BOOLEAN) — ATLD compliance confirmation
```

**Status**: ⚠️ **NOT confirmed in Ban 2.2 spec** — These are from Antigravity demo, flagged for Product Owner verification.

---

## Summary for User

| Item | Location | Exact Formula/Behavior | Status |
|---|---|---|---|
| **REQ-5: Early Warning** | REQ-5.2 | `reporting_rate < 30%` per unit (NOT 80%) | ✅ Correct |
| **REQ-2.2: registration_type** | POST /api/ci-kaizen section | System auto-assigns THI_DUA; NO user choice in form | ✅ Correct |
| **REQ-1: customer_brand** | P0 Fields section | Codes: DP\|WR\|RB\|SK\|Khác (NOT brand names) | ✅ Correct |
| **REQ-1: P1 Fields** | P1 Fields section | [NEEDS PO CONFIRMATION] — From Antigravity demo | ⚠️ Flagged |

---

**Verification Status**: 
- ✅ REQ-5 formula confirmed correct
- ✅ REQ-2.2 behavior confirmed correct  
- ✅ REQ-1 customer_brand codes confirmed correct
- ⚠️ P1 fields still need PO confirmation (but Phase 1A can proceed with them as-is; defer heavy validation)

**Ready for Phase 1A?**: 🟢 YES — All 3 main items verified correct.

---

**User Input Needed**: Confirm above 3 items match your understanding, or request clarification.
