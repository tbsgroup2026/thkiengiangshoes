# Kaizen System Backend — Comprehensive Requirements Specification
**Version**: 1.0.0  
**Status**: Draft  
**Last Updated**: 2026-08-24  
**Source of Truth**: [AGENT_GAP_ANALYSIS.md](../../AGENT_GAP_ANALYSIS.md)

---

## 📋 Executive Summary

This specification defines backend implementation for the "Thư viện Cải tiến / Thi đua Cải tiến" (Kaizen Library / Continuous Improvement Competition) system at TBS Group. The spec is based on a comprehensive gap analysis between the 4 completed frontend screens (Antigravity branch) and the current backend schema. 

**Key Deliverables**:
- 18+ missing database columns (7 P0 + 11 P1)
- 5-criteria scoring engine (100 points)
- Pass/fail pre-conditions (4 checks)
- Award & ranking system (11 awards)
- Weekly/monthly reporting infrastructure
- Early warning trigger logic (server-side)

**Scope**: Backend implementation only. Frontend (Antigravity) has completed screens on `agent/antigravity-frontend` branch.

**Timeline Estimate**: 14–20 hours total backend work (database, API, scoring engine, awards logic)

---

## 🎯 Requirements Overview

### REQ-1: Database Schema Extensions

**Description**: Extend `ci_kaizen_proposals` table with missing fields discovered in gap analysis.

**Acceptance Criteria**:
- [ ] P0 Fields Added (7 critical columns):
  - `proposer_position` (VARCHAR 255) — Employee job title/position
  - `topic_group` (ENUM: PRODUCTIVITY_GROUP | WASTE_GROUP | SAFETY_GROUP | OTHER_GROUP)
  - `pricing_direction` (ENUM: THOI_GIAN | TRI_GIA) — Time-based or monetary valuation
  - `time_before_seconds` (INTEGER) — Baseline production time in seconds
  - `time_after_seconds` (INTEGER) — Optimized production time in seconds
  - `efficiency_value_vnd` (INTEGER) — Monetary savings in VNĐ
  - `customer_brand` (ENUM: DP | WR | RB | SK | Khác) — Linked customer/brand code (derived from dept_code); **must use actual 5 brand codes from system, NOT brand names like Skechers/Wrangler/Reebok/Decathlon**
  
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
  
- [ ] P2 Fields Added (1 optional):
  - `agreed_to_terms` (BOOLEAN DEFAULT true) — Submission terms acceptance
  
- [ ] P0 Scoring Fields (5 new columns):
  - `feasibility_score` (INTEGER 0–20) — Investment & feasibility evaluation
  - `investment_score` (INTEGER 0–20) — Resource requirement assessment
  - `scalability_score` (INTEGER 0–20) — Rollout potential
  - `innovation_score` (INTEGER 0–15) — Creativity & initiative level
  - `team_spirit_score` (INTEGER 0–10) — Team collaboration & dissemination

- [ ] New Supporting Tables:
  - `regional_kpi_targets` — Department/unit targets for monthly engagement tracking
    - ✅ Source: Query existing `departments` table in production DB (FOUND via schema analysis)
    - ✅ Foreign key: `department_id` → `departments.id`
    - ✅ Seed data auto-generated from department codes (DP, SK, RB, WR, Khác)
    - ✅ Default target: 10 proposals/month per department (configurable per department)
    - ✅ NO external approval needed — uses existing organizational hierarchy from production DB
    - Related file: `.kiro/specs/kaizen-system/REGION_DATA_ANALYSIS.md` (analysis of existing Department table)
  - `scoring_criteria` — Configurable scoring thresholds and weights
  - `organizational_awards` — Phong Trào (organizational) award tracking

**Important Notes on Field Sourcing**:
- **From Official Ban 2.2 Spec**: proposer_position, topic_group, pricing_direction, time_before_seconds, time_after_seconds, efficiency_value_vnd, safety_confirmed
- **From Antigravity Demo Implementation (verify with PO)**: product_group, product_code, product_quantity, supervisor_name, hr_suggestor_name, dept_approval_status, before_video_url, after_video_url, proposed_month, proposed_year
- **Customer Brand Codes**: Use actual system values (DP, WR, RB, SK, Khác) — queried from `dept_code` field in existing system. Do NOT assume brand names (Skechers, Wrangler, Reebok, Decathlon).
- **Regional/Department Data**: ✅ FOUND in production DB — use existing `departments` table (Prisma model exists). No wait needed; generate seed data from query results during Phase 1B.

**Related Files**:
- Gap Analysis Section: "BẢNG TỔNG HỢP CỘT DỮ LIỆU CẦN THÊM VÀO ci_kaizen_proposals"
- Regional Data Analysis: `.kiro/specs/kaizen-system/REGION_DATA_ANALYSIS.md` (DB table structure verified)
- Target Migration Files: 
  - `0006_ci_kaizen_extended.sql` (Phase 1A: P0+P1 columns, no regional dependency)
  - `0007_ci_kaizen_regional_kpi_targets.sql` (Phase 1B: regional targets from existing departments)

---

### REQ-2: API Endpoint Updates & New Endpoints

**Description**: Update existing endpoints to handle new fields and create new endpoints for KPI targets and scoring.

#### REQ-2.1: GET /api/ci-kaizen — Fetch Proposals

**Current**: Returns 21 fields from `ci_kaizen_proposals`  
**Updated**: Return all 21 + 18+ new fields

**Acceptance Criteria**:
- [ ] Response serialization includes all new columns from REQ-1
- [ ] Backward compatibility maintained (old fields still present)
- [ ] Performance: Query time < 500ms for 1000 proposals with filtering
- [ ] Filtering supports:
  - `?topic_group=PRODUCTIVITY_GROUP` 
  - `?customer_brand=SK`
  - `?product_code=SK-001`
  - `?dept_approval_status=DA_XAC_NHAN`
  - `?proposed_month=8&proposed_year=2026`

**Related Frontend**: CIModule.tsx (Library filters), KaizenDashboard.tsx (chart data)

#### REQ-2.2: POST /api/ci-kaizen — Create Proposal

**Current**: Accepts basic CRUD fields  
**Updated**: Accept all fields from 5-step form

**Acceptance Criteria**:
- [ ] Form input validation:
  - `proposer_position` required (non-empty)
  - `topic_group` required (valid enum: PRODUCTIVITY_GROUP | WASTE_GROUP | SAFETY_GROUP | OTHER_GROUP)
  - `pricing_direction` required (THOI_GIAN | TRI_GIA)
  - If `pricing_direction=THOI_GIAN`: both `time_before_seconds` and `time_after_seconds` required
  - If `pricing_direction=TRI_GIA`: `efficiency_value_vnd` required
  - `customer_brand` maps to valid enum: DP | WR | RB | SK | Khác
  - `agreed_to_terms=true` required for all submissions
  
- [ ] **Automatic system behavior (NO user choice for registration_type)**:
  - On proposal creation during open submission month → `registration_type` auto-set to 'THI_DUA' (default for current month competition)
  - After awards announced (~day 5 of next month) → `registration_type` auto-transitions to 'LUU_TRU' (archival mode)
  - Proposal record remains unchanged in database; only `registration_type` flag and display logic changes
  - Frontend shows `registration_type` as **read-only status**, not user-selectable option in form
  
- [ ] Automatic calculations on save:
  - `saved_seconds = time_before_seconds - time_after_seconds` (if time-based)
  - `efficiency_value_vnd` remains as-is (if monetary; used for KPI calculations)
  - `score_points` reset to 0.0 (awaiting evaluation)
  
- [ ] Response includes generated proposal `code` (e.g., KZ-2026-08-001)

**Related Frontend**: KaizenFiveStepSubmitForm.tsx (all 5 steps POST data; **Antigravity must remove manual registration_type selection from Step 3 UI, replace with read-only display of auto-assigned type**)

#### REQ-2.3: PUT /api/ci-kaizen/:id — Update Proposal

**Acceptance Criteria**:
- [ ] All new fields from REQ-1 can be updated
- [ ] If `pricing_direction` changes, recalculate `saved_seconds` automatically
- [ ] If `dept_approval_status` changes to `DA_XAC_NHAN`, trigger workflow notification (future)
- [ ] Prevents update if `status=APPROVED` (read-only after approval)

#### REQ-2.4: GET /api/ci-kaizen/kpi-targets — Fetch Regional Targets (NEW)

**Purpose**: Retrieve KPI submission targets per region for early warning alerts

**Response Schema**:
```json
{
  "data": [
    {
      "region_name": "Kiên Giang 1",
      "monthly_target": 20,
      "current_month_submitted": 18,
      "completion_percentage": 90,
      "status": "ON_TRACK"
    }
  ]
}
```

**Acceptance Criteria**:
- [ ] Returns all regions in `regional_kpi_targets` table
- [ ] Calculates `current_month_submitted` as COUNT(*) WHERE region=X AND MONTH(created_at)=CURRENT_MONTH AND registration_type='THI_DUA'
- [ ] Status logic:
  - `completion_percentage >= 100` → "EXCEEDED"
  - `completion_percentage >= 80` → "ON_TRACK"
  - `completion_percentage < 80 AND current_date >= 14th of month` → "AT_RISK" (red alert)
  - `completion_percentage < 30 AND current_date >= 14th of month` → "CRITICAL" (dark red)

**Related Frontend**: KaizenEarlyWarning.tsx (KPI progress table)

#### REQ-2.5: POST /api/ci-kaizen/scoring/:id — Evaluate Proposal (ENHANCEMENT)

**Purpose**: Calculate 5-criteria scores and total award points

**Request Body**:
```json
{
  "evaluator_emp_code": "EMP001",
  "evaluator_name": "Nguyễn Văn A",
  "feasibility_score": 18,        // 0-20
  "investment_score": 15,          // 0-20
  "scalability_score": 16,         // 0-20
  "innovation_score": 14,          // 0-15
  "team_spirit_score": 8,          // 0-10
  "comments": "Excellent implementation..."
}
```

**Acceptance Criteria**:
- [ ] Validates each score within valid range
- [ ] Calculates `total_score = feasibility + investment + scalability + innovation + team_spirit` (auto-sum, max 100)
- [ ] Rounds total_score to 1 decimal place
- [ ] Records evaluation in `ci_kaizen_evaluations` table
- [ ] Updates parent proposal: `score_points = total_score`, `sub_status = 'DA_DANH_GIA'`
- [ ] If total_score > 0, automatically determines award tier (see REQ-7)

**Related Frontend**: Future award/scoring dashboard (not in current 4 screens, but Antigravity may add later)

---

### REQ-3: Pass/Fail Pre-Conditions (4 Mandatory Checks)

**Description**: Before a proposal qualifies for scoring and awards, it must pass 4 pre-conditions.

**Acceptance Criteria**:

#### REQ-3.1: Actually Deployed Check
- [ ] New field: `is_actually_deployed` (BOOLEAN)
- [ ] Logic: Proposal only passes if explicitly marked TRUE by author/supervisor
- [ ] Error message if FALSE: "Đề xuất chưa được triển khai thực tế. Cần xác nhận triển khai trước khi nộp."

#### REQ-3.2: Evidence (Before/After) Check
- [ ] Logic: At least ONE of the following must be non-null:
  - `before_image_url` AND `after_image_url` (images provided)
  - `before_video_url` AND `after_video_url` (videos provided)
  - `before_image_url` AND `before_video_url` AND one of `after_image_url` or `after_video_url`
- [ ] Error message if failed: "Cần cung cấp minh chứng ảnh hoặc video trước-sau cải tiến."
- [ ] Validation triggers on POST/PUT proposal

#### REQ-3.3: Safety Compliance (ATLD) Check
- [ ] New field: `safety_confirmed` (BOOLEAN)
- [ ] Logic: If `category` IN (SAFETY, 5S, EQUIPMENT, AUTOMATION), then `safety_confirmed` must be TRUE
- [ ] Error message if FALSE: "Cần xác nhận tuân thủ An toàn Lao động (ATLD) trước khi nộp."

#### REQ-3.4: No Duplicate Check (Fuzzy Matching)
- [ ] Logic: Compare submitted proposal against approved proposals from past 12 months
  - Compare `title` using fuzzy string matching (similarity > 85%)
  - Compare `before_solution` concept (if exists in past)
  - If `topic_group` AND `category` both identical, flag as potential duplicate
- [ ] If duplicate found: Check if "new development step added" (field: `new_development_step` BOOLEAN)
  - If TRUE, allow submission (new iteration of existing idea)
  - If FALSE or not provided, warn but allow submission with notation "Duplicate - Previous: [code]"
- [ ] Implementation: Backend stored procedure or service method (not blocking, warning-only for MVP)

**Notes**:
- Proposals MUST pass all 4 checks before appearing on dashboard/scoring
- Failed proposals stay in `sub_status='REJECTED_PRECONDITION'` until corrected
- Antigravity frontend Step 5 should validate these before final POST

---

### REQ-4: 5-Criteria Scoring Engine (100 Points)

**Description**: Implement configurable scoring logic for 5 evaluation criteria with weighted distribution.

**Acceptance Criteria**:

#### REQ-4.1: Criterion 1 — Hiệu Quả Thực Tế (35 points)

**Formula varies by `topic_group`**:

| Topic Group | Effectiveness Metric | Calculation | Example |
|---|---|---|---|
| **PRODUCTIVITY_GROUP** | Time saved % | (time_before - time_after) / time_before * 100 | 50% → 35pts, 30% → 25pts, 10% → 10pts |
| **WASTE_GROUP** | Cost saved % | efficiency_value_vnd / baseline_cost * 100 | 40% → 35pts, 20% → 20pts, 5% → 8pts |
| **SAFETY_GROUP** | Risk reduction | Case count avoidance + severity level | Prevented 1 major incident → 35pts |
| **OTHER_GROUP** | Custom metric | Evaluator input + comment analysis | Evaluator assigns 0–35pts |

- [ ] Backend stores configurable thresholds in `scoring_criteria` table
- [ ] Auto-calculates efficiency percentage and maps to points
- [ ] Evaluator can override with manual score if custom metrics

**Related Database**: New config table `scoring_criteria`:
```sql
CREATE TABLE scoring_criteria (
  id TEXT PRIMARY KEY,
  topic_group VARCHAR(50),
  criterion_name VARCHAR(100),  -- "Hiệu Quả Thực Tế" 
  max_points INTEGER,
  threshold_1_min REAL,  -- e.g., 70%
  threshold_1_points INTEGER,  -- e.g., 35
  threshold_2_min REAL,  -- e.g., 50%
  threshold_2_points INTEGER,  -- e.g., 25
  ...
);
```

#### REQ-4.2: Criterion 2 — Tính Khả Thi & Đầu Tư (20 points)

**Scoring Levels** (manual or auto-detected):

| Level | Feasibility | Investment Required | Points |
|---|---|---|---|
| **Level 1** | High feasibility, low cost | < 5M VNĐ | 20 pts |
| **Level 2** | Good feasibility, moderate cost | 5M–50M VNĐ | 15 pts |
| **Level 3** | Fair feasibility, high cost | 50M–200M VNĐ | 10 pts |
| **Level 4** | Low feasibility, very high cost | > 200M VNĐ | 5 pts |

- [ ] Field: `feasibility_score` (0–20)
- [ ] Evaluator assigns level based on rejection reason or feasibility assessment
- [ ] If cost/time estimate provided in comments, auto-categorize

#### REQ-4.3: Criterion 3 — Khả Năng Nhân Rộng (20 points)

**Scoring Levels**:

| Level | Rollout Potential | Departments Applicable | Points |
|---|---|---|---|
| **Level 1** | Company-wide replicable | All departments (>5 depts) | 20 pts |
| **Level 2** | Multi-department applicable | 3–5 departments | 15 pts |
| **Level 3** | Limited scope | 1–2 departments | 10 pts |
| **Level 4** | Single-use only | Only this department/team | 5 pts |

- [ ] Field: `scalability_score` (0–20)
- [ ] Evaluator selects based on applicable scope

#### REQ-4.4: Criterion 4 — Sáng Tạo & Chủ Động (15 points)

**Scoring Levels**:

| Level | Innovation | Initiative | Points |
|---|---|---|---|
| **Level 1** | Novel approach, first implementation | Self-initiated, beyond role | 15 pts |
| **Level 2** | Creative adaptation of known method | Some innovation, encouraged by team | 11 pts |
| **Level 3** | Standard method, minor improvement | Routine task improvement | 7 pts |
| **Level 4** | Incremental/maintenance only | Assigned/mandatory task | 3 pts |

- [ ] Field: `innovation_score` (0–15)
- [ ] Evaluator judges based on novelty described in proposal

#### REQ-4.5: Criterion 5 — Lan Tỏa & Đội Nhóm (10 points)

**Scoring Levels**:

| Level | Dissemination | Team Involvement | Points |
|---|---|---|---|
| **Level 1** | Widely shared, trained multiple teams | >5 team members actively involved | 10 pts |
| **Level 2** | Shared with department | 3–5 team members | 7 pts |
| **Level 3** | Shared with immediate team | 1–2 team members | 3 pts |
| **Level 4** | Not shared / individual effort | Solo effort | 0 pts |

- [ ] Field: `team_spirit_score` (0–10)
- [ ] Evaluator assesses based on team_size field or proposal narrative

#### REQ-4.6: Total Score Calculation

- [ ] Formula: `total_score = feasibility + investment + scalability + innovation + team_spirit`
  - But actually: `total_score = effectiveness + feasibility + scalability + innovation + team_spirit` (CORRECTED: Effectiveness is criterion 1, not separate)
  - Wait, re-read spec: Criterion 1 is 35pts (Hiệu Quả), Criterion 2 is 20pts (Khả thi), ...
  - **ACTUAL**: `total_score = [criterion_1_score] + feasibility_score + scalability_score + innovation_score + team_spirit_score`
  - Where `criterion_1_score` is auto-calculated from REQ-4.1 based on topic_group
  - **Correction**: Store in `effectiveness_score`, not recalculate — evaluator inputs 5 separate fields
- [ ] Validation: sum of individual scores must not exceed 100
- [ ] Rounding: Round to 1 decimal place
- [ ] Update `score_points` on proposal record

**Acceptance Criteria**:
- [ ] Each criterion stored in separate column for auditability
- [ ] Total score = sum of 5 criteria (max 100)
- [ ] No manual "override total" (derived field only)
- [ ] Scores visible in API response and dashboard

---

### REQ-5: Early Warning Alert System (Server-Side)

**Description**: Implement server-side logic to detect and trigger alerts for Ban 2.2 (Improvement Department).

**Acceptance Criteria**:

#### REQ-5.1: Deadline Alert (Days to 25th)
- [ ] Daily job (or on-demand API call): Check if current date > 20th AND < 25th
- [ ] If TRUE: Set `alert_flag='DEADLINE_APPROACHING'` on all proposals with `registration_type='THI_DUA'` AND `status='SUBMITTED'`
- [ ] Alert message: "Hạn chót ngày 25 hàng tháng. Còn X ngày để nộp bài."
- [ ] Related endpoint: `GET /api/ci-kaizen/alerts?alert_type=DEADLINE`

#### REQ-5.2: Low Engagement Alert by Department/Region (After Day 14)
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

#### REQ-5.3: Incomplete Evaluation Alert (Near Evaluation Deadline)
- [ ] Monthly job (on day 26): Check proposals submitted before day 25
- [ ] Count: WHERE `registration_type='THI_DUA'` AND `sub_status='CHO_DANH_GIA'` AND `created_at < 25th of previous month`
- [ ] If count > 0: Create alert `alert_type='UNEVALUATED_PROPOSALS'` with proposal IDs
- [ ] Alert message: "X bài thi đua chưa được chấm điểm trước hạn chót tổng kết (30/9)."

#### REQ-5.4: Missing Evidence Alert
- [ ] Daily or on-demand: Check proposals in THI_DUA with `registration_type='THI_DUA'` AND `sub_status='CHO_DANH_GIA'`
- [ ] If `before_image_url` IS NULL AND `before_video_url` IS NULL: Flag as "MISSING_BEFORE_EVIDENCE"
- [ ] If `after_image_url` IS NULL AND `after_video_url` IS NULL: Flag as "MISSING_AFTER_EVIDENCE"
- [ ] Related endpoint: `GET /api/ci-kaizen/alerts?alert_type=MISSING_EVIDENCE`

**New Endpoint**: `GET /api/ci-kaizen/alerts`

**Query Parameters**:
- `?alert_type=DEADLINE|KPI|UNEVALUATED|MISSING_EVIDENCE|LOW_PARTICIPATION`
- `?region=Kiên Giang 1` (optional filter)
- `?resolved=false` (default: show unresolved alerts)

**Response Schema**:
```json
{
  "data": [
    {
      "alert_id": "ALT-2026-08-001",
      "alert_type": "DEADLINE_APPROACHING",
      "severity": "HIGH",
      "message": "Hạn chót ngày 25 hàng tháng. Còn 2 ngày để nộp bài.",
      "triggered_at": "2026-08-23T14:30:00Z",
      "resolved": false,
      "affected_count": 125
    }
  ]
}
```

---

### REQ-6: Weekly & Monthly Reporting Infrastructure

**Description**: Create tables and APIs to support reporting workflows for team leads and Ban 2.2.

**Acceptance Criteria**:

#### REQ-6.1: Weekly Report (CTV → Team Lead)
- [ ] New table: `weekly_reports`
  ```sql
  CREATE TABLE weekly_reports (
    id TEXT PRIMARY KEY,
    week_start_date DATE,
    week_end_date DATE,
    team_lead_emp_code TEXT,
    total_ideas_submitted INTEGER,
    total_ideas_registered INTEGER,
    pending_evaluation_count INTEGER,
    registered_for_competition INTEGER,
    archived_count INTEGER,
    created_at DATETIME,
    FOREIGN KEY (team_lead_emp_code) REFERENCES employees(emp_code)
  );
  ```
- [ ] Endpoint: `POST /api/ci-kaizen/weekly-report`
- [ ] Calculation logic:
  - `total_ideas_submitted` = COUNT(*) WHERE created_at BETWEEN week_start AND week_end
  - `pending_evaluation_count` = COUNT(*) WHERE sub_status='CHO_DANH_GIA' AND registration_type='THI_DUA'
  - `registered_for_competition` = COUNT(*) WHERE registration_type='THI_DUA' AND created_at BETWEEN week_start AND week_end

#### REQ-6.2: Monthly Report (Team → Ban 2.2)
- [ ] New table: `monthly_reports`
  ```sql
  CREATE TABLE monthly_reports (
    id TEXT PRIMARY KEY,
    report_month INTEGER,
    report_year INTEGER,
    total_proposals INTEGER,
    total_competition_entries INTEGER,
    total_archived INTEGER,
    total_evaluated INTEGER,
    average_score REAL,
    total_value_vnd BIGINT,
    awards_distributed TEXT,  -- JSON array of award assignments
    created_by_emp_code TEXT,
    created_at DATETIME,
    FOREIGN KEY (created_by_emp_code) REFERENCES employees(emp_code)
  );
  ```
- [ ] Endpoint: `GET /api/ci-kaizen/monthly-report?month=8&year=2026`
- [ ] Calculation:
  - `total_proposals` = COUNT(*) WHERE MONTH(created_at)=month AND YEAR(created_at)=year
  - `total_value_vnd` = SUM(efficiency_value_vnd) for same period
  - `average_score` = AVG(score_points) WHERE score_points > 0

---

### REQ-7: Awards & Ranking System (11 Single + 2 Organizational)

**Description**: Implement automated award assignment logic based on scoring.

**Acceptance Criteria**:

#### REQ-7.1: Individual Awards (11 Giải)

**Award Tiers** (by score rank):

| Rank | Award Name | Prize | Score Range | Count | Notes |
|---|---|---|---|---|---|
| 1 | Giải Nhất | 5M VNĐ | Top score | 1 | Highest single score |
| 2–3 | Giải Nhì | 3M VNĐ each | Next 2 highest | 2 | |
| 4–6 | Giải Ba | 2M VNĐ each | Next 3 highest | 3 | |
| 7–11 | Giải Khuyến Khích | 800k VNĐ each | Next 5 highest | 5 | |

- [ ] Table: `awards` 
  ```sql
  CREATE TABLE awards (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL UNIQUE,
    award_tier VARCHAR(50),  -- 'NHAT', 'NHI', 'BA', 'KHUYEN_KHICH'
    award_name VARCHAR(100),
    prize_amount_vnd INTEGER,
    award_month INTEGER,
    award_year INTEGER,
    assigned_at DATETIME,
    created_at DATETIME,
    FOREIGN KEY (proposal_id) REFERENCES ci_kaizen_proposals(id)
  );
  ```

- [ ] Logic (stored procedure or monthly batch job):
  1. Fetch all proposals with `registration_type='THI_DUA'` AND `score_points > 0` AND `status NOT IN ('REJECTED', 'DUPLICATE')`
  2. ORDER BY `score_points DESC, updated_at ASC` (tiebreaker: earlier submission)
  3. Assign awards: 1st place → Nhất, 2–3 → Nhì, 4–6 → Ba, 7–11 → Khuyến Khích
  4. Insert into `awards` table
  5. Update `ci_kaizen_proposals.award_title` field

- [ ] Endpoint: `GET /api/ci-kaizen/awards?month=8&year=2026`

#### REQ-7.2: Organizational Awards (2 Giải Phong Trào)

**Award Tiers**:

| Tier | Award Name | Prize | Criteria | Count |
|---|---|---|---|---|
| 1 | Giải Phong Trào Nhất | 5M VNĐ | Best team/department culture score | 1 |
| 2 | Giải Phong Trào Nhì | 4M VNĐ | Runner-up team/department culture | 1 |

**Culture Score Formula**:
```
Culture_Score = (Participation_Rate * 50) + (Avg_Score_Per_Team * 30) + (Awards_Won_Per_Team * 20)

Where:
- Participation_Rate = total_submitted / total_employees * 100
- Avg_Score_Per_Team = AVG(score_points) for team's proposals
- Awards_Won_Per_Team = COUNT(*) of team members winning awards
```

- [ ] Table: `organizational_awards`
  ```sql
  CREATE TABLE organizational_awards (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    award_tier VARCHAR(50),  -- 'ORG_NHAT', 'ORG_NHI'
    award_name VARCHAR(100),
    prize_amount_vnd INTEGER,
    culture_score REAL,
    award_month INTEGER,
    award_year INTEGER,
    assigned_at DATETIME,
    created_at DATETIME
  );
  ```

- [ ] Endpoint: `GET /api/ci-kaizen/organizational-awards?month=8&year=2026`

#### REQ-7.3: Maturity Level (5-Level CMMI Model)

**Levels** (based on cumulative organizational performance):

| Level | Name (English) | Score Range | Criteria | Years/Cycles |
|---|---|---|---|---|
| E | Chaotic (Mới bắt đầu) | 0–20 | No structured process | Year 1 |
| D | Repeatable (Có phong trào) | 21–40 | Basic KPIs tracked | Year 1–2 |
| C | Defined (Đang hình thành) | 41–60 | Processes documented, 2+ cycles data | Year 2–3 |
| B | Managed (Văn hóa ổn định) | 61–80 | Continuous improvement, 3+ cycles | Year 3–5 |
| A | Optimized (Tự vận hành) | 81–100 | Self-sustaining, innovation-driven | Year 5+ |

- [ ] Table: `maturity_levels`
  ```sql
  CREATE TABLE maturity_levels (
    id TEXT PRIMARY KEY,
    organization_level VARCHAR(50),  -- 'COMPANY', 'DEPARTMENT', 'FACTORY'
    organization_id TEXT,
    current_level VARCHAR(10),  -- 'E', 'D', 'C', 'B', 'A'
    current_score REAL,
    previous_level VARCHAR(10),
    assigned_at DATETIME,
    created_at DATETIME
  );
  ```

- [ ] Calculation (quarterly or annual):
  - Aggregate all proposals + scores across org
  - Compute average score, participation rate, award counts
  - Map to level based on thresholds
  - Track progression in maturity_levels table

- [ ] Endpoint: `GET /api/ci-kaizen/maturity-level?org_level=COMPANY`

---

### REQ-8: API Documentation & Versioning

**Acceptance Criteria**:
- [ ] All endpoints documented with OpenAPI 3.0 spec
- [ ] Request/response schemas clearly defined
- [ ] Error codes standardized (400, 404, 409, 500, etc.)
- [ ] Rate limiting: 1000 req/min per API key
- [ ] Versioning: API v1 (current), backward-compatible changes only

**Related Files**:
- OpenAPI Spec: `backend/openapi.yaml` (to be created/updated)

---

## ✅ Acceptance Criteria Summary

| Requirement | Must-Have | Nice-to-Have | Status |
|---|:---:|:---:|---|
| REQ-1: Database Schema Extensions | ✅ P0+P1 | ✅ P2 | Pending |
| REQ-2: API Endpoints | ✅ All 5 | ✅ New endpoints | Pending |
| REQ-3: Pass/Fail Pre-Conditions | ✅ 4 checks | ✅ Fuzzy matching | Pending |
| REQ-4: 5-Criteria Scoring | ✅ Full engine | ✅ Auto-calculation | Pending |
| REQ-5: Early Warning Alerts | ✅ 5 alert types | ⚠️ Daily jobs (may be cron) | Pending |
| REQ-6: Weekly/Monthly Reports | ✅ Infrastructure | ✅ Auto-generation | Pending |
| REQ-7: Awards & Ranking | ✅ 11 awards | ✅ Org awards + maturity | Pending |
| REQ-8: API Documentation | ✅ OpenAPI spec | ⚠️ Interactive docs | Pending |

---

## 📦 Implementation Approach

### Phase 1: Database & Schema (P0 Critical)
1. Create migration file: `0006_ci_kaizen_extended.sql`
2. Add 7 P0 columns + 5 scoring columns
3. Update Prisma schema (`schema.prisma`)
4. Run migration on dev database
5. Verify no data loss

### Phase 2: API Updates (Blocking FE)
1. Update `ci_kaizen_proposals` serialization
2. Update POST/PUT validation logic
3. Test with Antigravity form submission
4. Ensure backward compatibility

### Phase 3: Scoring Engine (Complex)
1. Create `scoring_criteria` configuration table
2. Implement scoring calculator service
3. Test with various topic_groups (time-based vs monetary)
4. Validate score rounding

### Phase 4: Alerts & Reports
1. Implement daily alert jobs
2. Create reporting endpoints
3. Test alert triggers
4. Integrate with email/notification system

### Phase 5: Awards & Maturity
1. Implement award assignment stored procedure
2. Test tie-breaking logic
3. Create maturity level tracking
4. Verify organizational score calculations

---

## 📞 Dependencies & Integration Points

### Frontend Integration (Antigravity)
- Antigravity must POST all 5-step form fields to `POST /api/ci-kaizen`
- Dashboard queries use updated `GET /api/ci-kaizen/kpi-targets` for early warning alerts
- Library filters use new query parameters: `?topic_group=`, `?customer_brand=`, etc.

### Database Sync
- Prisma ORM schema must stay in sync with SQL migrations
- Consider Prisma migrations (`npx prisma migrate dev`) as alternative to raw SQL

### CI/CD Considerations
- Run tests on all new endpoints before merge to main
- Migration should be reversible for rollback safety
- Staging environment should mirror production schema before deployment

---

## 🎯 Success Criteria (For Sprint Completion)

All of the following must pass:

1. ✅ All 7 P0 + 11 P1 columns added to database
2. ✅ API endpoints return new fields (backward compatible)
3. ✅ Form 5-step submission works end-to-end
4. ✅ Scoring engine produces 100-point total
5. ✅ Pass/fail logic blocks invalid proposals
6. ✅ Early warnings trigger correctly (post 14th of month)
7. ✅ Awards assigned to top 11 proposals
8. ✅ No TypeScript errors in backend code
9. ✅ All endpoints tested with Postman/curl
10. ✅ Antigravity can pull latest FE changes and integrate seamlessly

---

## 📎 Supporting Documents

- [AGENT_GAP_ANALYSIS.md](../../AGENT_GAP_ANALYSIS.md) — Detailed field-by-field gap analysis
- [AGENT_TASKS.md](../../AGENT_TASKS.md) — Coordination between Kiro & Antigravity
- [KAIZEN_FIELD_GUIDE.md](../../web/KAIZEN_FIELD_GUIDE.md) — Field documentation reference
- Business Spec: `XÂY_DỰNG_VĂN_HÓA_CẢI_TIẾN.PDF` (referenced for award logic, cycle dates, etc.)

---

**Prepared by**: Kiro Backend Agent  
**Date**: 2026-08-24  
**Status**: Draft → Ready for Design Phase  
**Next Step**: Create tasks.md file to break requirements into implementation subtasks
