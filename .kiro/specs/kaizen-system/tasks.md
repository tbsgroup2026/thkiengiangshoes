# Kaizen System Backend — Implementation Tasks
**Version**: 1.0.0  
**Spec Reference**: [requirements.md](./requirements.md)  
**Status**: Ready for Sprint Planning

---

## 📋 Task Breakdown Overview

| Phase | Tasks | Estimate | Blocker? | Priority |
|---|---|:---:|:---:|---|
| **Phase 1: Database Extensions** | TASK-1.1 to 1.4 | 3–4 hours | 🔴 YES | P0 |
| **Phase 2: API Endpoint Updates** | TASK-2.1 to 2.6 | 3–4 hours | 🔴 YES | P0 |
| **Phase 3: Validation & Pass/Fail** | TASK-3.1 to 3.4 | 2–3 hours | 🟡 MEDIUM | P0 |
| **Phase 4: Scoring Engine** | TASK-4.1 to 4.6 | 4–5 hours | 🟡 MEDIUM | P0 |
| **Phase 5: Alerts & Reports** | TASK-5.1 to 5.5 | 3–4 hours | 🟢 LOW | P1 |
| **Phase 6: Awards & Maturity** | TASK-6.1 to 6.3 | 3–4 hours | 🟢 LOW | P1 |
| **Phase 7: Testing & Integration** | TASK-7.1 to 7.4 | 2–3 hours | 🟢 LOW | P1 |
| **Total** | 23 tasks | **14–20 hours** | - | - |

---

## 🗂️ Phase 1: Database Extensions (P0 CRITICAL)

### TASK-1.1: Create Migration File for P0 Columns

**Description**: Create migration SQL file to add 7 critical columns to `ci_kaizen_proposals`.

**Acceptance Criteria**:
- [ ] File: `web/migrations/0006_ci_kaizen_extended_p0.sql` created
- [ ] Adds columns:
  1. `proposer_position VARCHAR(255)` — Job title/position
  2. `topic_group VARCHAR(50) DEFAULT 'OTHER_GROUP'` — Group enum
  3. `pricing_direction VARCHAR(20) DEFAULT 'THOI_GIAN'` — Time vs monetary
  4. `time_before_seconds INTEGER DEFAULT 0` — Baseline seconds
  5. `time_after_seconds INTEGER DEFAULT 0` — Optimized seconds
  6. `efficiency_value_vnd INTEGER DEFAULT 0` — Monetary savings
  7. `customer_brand VARCHAR(50)` — Brand/customer code
- [ ] Uses `ALTER TABLE` for backward compatibility (no data loss)
- [ ] Syntax validated in SQL editor
- [ ] Can be rolled back (no IF NOT EXISTS needed since table exists)

**Estimate**: 30 minutes  
**Dependencies**: None (baseline migration exists)  
**Assigned to**: Kiro

---

### TASK-1.2: Create Migration File for P1 Columns

**Description**: Create migration SQL file to add 11 important columns.

**Acceptance Criteria**:
- [ ] File: `web/migrations/0007_ci_kaizen_extended_p1.sql` created
- [ ] Adds columns:
  1. `proposed_month INTEGER` — 1–12 submission month
  2. `proposed_year INTEGER` — YYYY submission year
  3. `product_group VARCHAR(255)` — Product category
  4. `product_code VARCHAR(50)` — SKU/code
  5. `product_quantity INTEGER DEFAULT 0` — Order quantity
  6. `supervisor_name VARCHAR(255)` — Department supervisor
  7. `hr_suggestor_name VARCHAR(255)` — HR mentor
  8. `dept_approval_status VARCHAR(50) DEFAULT 'PENDING'` — Approval enum
  9. `before_video_url TEXT` — Before video URL
  10. `after_video_url TEXT` — After video URL
  11. `safety_confirmed BOOLEAN DEFAULT false` — ATLD compliance
- [ ] Includes 5 scoring columns:
  1. `effectiveness_score INTEGER DEFAULT 0` — 0–35
  2. `feasibility_score INTEGER DEFAULT 0` — 0–20
  3. `scalability_score INTEGER DEFAULT 0` — 0–20
  4. `innovation_score INTEGER DEFAULT 0` — 0–15
  5. `team_spirit_score INTEGER DEFAULT 0` — 0–10
- [ ] P2 Optional column: `agreed_to_terms BOOLEAN DEFAULT true`
- [ ] All new columns have sensible defaults (no breaking existing rows)

**Estimate**: 30 minutes  
**Dependencies**: TASK-1.1 (sequential; P0 first)  
**Assigned to**: Kiro

---

### TASK-1.3: Create Supporting Tables (KPI, Scoring, Awards)

**Description**: Create 3 new tables to support KPI targets, scoring configuration, and awards.

**Acceptance Criteria**:
- [ ] Table 1: `regional_kpi_targets`
  ```sql
  -- Stores monthly submission targets per region
  CREATE TABLE regional_kpi_targets (
    id TEXT PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL UNIQUE,
    monthly_target INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  -- Seed data for 6 regions (KG1: 20, KG2: 15, ..., VP R&D: 10)
  ```

- [ ] Table 2: `scoring_criteria`
  ```sql
  -- Stores configurable scoring thresholds per topic group
  CREATE TABLE scoring_criteria (
    id TEXT PRIMARY KEY,
    topic_group VARCHAR(50),  -- PRODUCTIVITY_GROUP, WASTE_GROUP, SAFETY_GROUP
    criterion_name VARCHAR(100),  -- "Hiệu Quả Thực Tế"
    max_points INTEGER,
    threshold_1_min REAL,  -- e.g., 0.70 for 70%
    threshold_1_points INTEGER,  -- e.g., 35
    threshold_2_min REAL,
    threshold_2_points INTEGER,
    threshold_3_min REAL,
    threshold_3_points INTEGER,
    threshold_4_min REAL,
    threshold_4_points INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Table 3: `awards`
  ```sql
  -- Tracks assigned awards per month
  CREATE TABLE awards (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL UNIQUE,
    award_tier VARCHAR(50),  -- 'NHAT', 'NHI', 'BA', 'KHUYEN_KHICH'
    award_name VARCHAR(100),
    prize_amount_vnd INTEGER,
    award_month INTEGER,
    award_year INTEGER,
    assigned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES ci_kaizen_proposals(id) ON DELETE CASCADE
  );
  ```

- [ ] Table 4: `organizational_awards`
  ```sql
  -- Tracks organizational/team awards (2 giải phong trào)
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Table 5: `maturity_levels`
  ```sql
  -- Tracks organizational maturity (5 levels: E-D-C-B-A)
  CREATE TABLE maturity_levels (
    id TEXT PRIMARY KEY,
    organization_level VARCHAR(50),  -- 'COMPANY', 'DEPARTMENT'
    organization_id TEXT,
    current_level VARCHAR(10),  -- 'E', 'D', 'C', 'B', 'A'
    current_score REAL,
    previous_level VARCHAR(10),
    assigned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Seeds `regional_kpi_targets` with 6 regions
- [ ] Seeds `scoring_criteria` with baseline thresholds for 3 topic groups

**Estimate**: 1 hour  
**Dependencies**: None (new tables, independent)  
**Assigned to**: Kiro

---

### TASK-1.4: Update Prisma Schema

**Description**: Update `backend/prisma/schema.prisma` to reflect new database columns.

**Acceptance Criteria**:
- [ ] All P0 + P1 columns added to `CiKaizenProposal` model
- [ ] 5 scoring fields added as INTEGER optional fields
- [ ] New models created:
  - `RegionalKpiTarget`
  - `ScoringCriteria`
  - `Award`
  - `OrganizationalAward`
  - `MaturityLevel`
- [ ] Foreign key relationships maintained (e.g., Award → CiKaizenProposal)
- [ ] `npx prisma generate` runs without errors
- [ ] Types regenerated in `node_modules/@prisma/client`
- [ ] No TypeScript errors

**Estimate**: 45 minutes  
**Dependencies**: TASK-1.1, 1.2, 1.3 (all migrations completed first)  
**Assigned to**: Kiro

---

## 🔌 Phase 2: API Endpoint Updates (P0 CRITICAL)

### TASK-2.1: Update GET /api/ci-kaizen — Serialization

**Description**: Ensure API response includes all new fields (18+).

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/ci-kaizen` (with optional filters)
- [ ] Response includes all 21 original columns + 18 new columns (39 total)
- [ ] Backward compatibility: Old fields still present (no renaming/deletion)
- [ ] New filter parameters supported:
  - `?topic_group=PRODUCTIVITY_GROUP`
  - `?customer_brand=SK`
  - `?product_code=SK-001`
  - `?dept_approval_status=DA_XAC_NHAN`
  - `?proposed_month=8&proposed_year=2026`
- [ ] Performance: Query time < 500ms for 1000 proposals with filters
- [ ] Pagination: Supports `?page=1&limit=50`
- [ ] Tested with Postman/curl

**Implementation Notes**:
- Use Prisma `findMany()` with `where` clause for filtering
- Add indexes on frequently filtered columns (topic_group, customer_brand, product_code)
- Cache regional targets if fetched frequently

**Estimate**: 1 hour  
**Dependencies**: TASK-1.4 (Prisma schema updated)  
**Assigned to**: Kiro

---

### TASK-2.2: Update POST /api/ci-kaizen — Request Validation

**Description**: Accept new fields from 5-step form and validate.

**Acceptance Criteria**:
- [ ] Endpoint: `POST /api/ci-kaizen` accepts request body with all new fields
- [ ] Request schema validation (Zod/Joi):
  - `proposer_position` (required, non-empty)
  - `topic_group` (required, enum: PRODUCTIVITY_GROUP | WASTE_GROUP | SAFETY_GROUP | OTHER_GROUP)
  - `pricing_direction` (required, enum: THOI_GIAN | TRI_GIA)
  - **Conditional**: If `pricing_direction=THOI_GIAN`, require `time_before_seconds` AND `time_after_seconds`
  - **Conditional**: If `pricing_direction=TRI_GIA`, require `efficiency_value_vnd`
  - `customer_brand` (optional, but if provided, validate against allowed brands)
  - `agreed_to_terms=true` (required for THI_DUA registration)
- [ ] Auto-calculations:
  - `saved_seconds = time_before_seconds - time_after_seconds` (if time-based)
  - `efficiency_value_vnd` remains as-is (if monetary)
  - `score_points = 0.0` (awaiting evaluation)
- [ ] Response includes generated proposal `code` (e.g., KZ-2026-08-001)
- [ ] Error responses use standard HTTP status codes (400 for validation, 409 for conflicts)
- [ ] Tested with Postman using form data

**Estimate**: 1.5 hours  
**Dependencies**: TASK-2.1 (serialization in place)  
**Assigned to**: Kiro

---

### TASK-2.3: Update PUT /api/ci-kaizen/:id — Update Proposal

**Description**: Allow updates to all new fields without breaking approval workflow.

**Acceptance Criteria**:
- [ ] Endpoint: `PUT /api/ci-kaizen/:id` accepts partial updates
- [ ] All new fields can be updated
- [ ] Automatic recalculation on field change:
  - If `pricing_direction` or `time_before/after_seconds` changes → recalc `saved_seconds`
  - If `efficiency_value_vnd` changes → update dashboard KPI
- [ ] Business logic:
  - Prevent update if `status=APPROVED` (read-only)
  - If `dept_approval_status` changes to `DA_XAC_NHAN` → log approval event (for future notification)
- [ ] Versioning: Increment `version` field on update
- [ ] Response includes updated proposal snapshot

**Estimate**: 1 hour  
**Dependencies**: TASK-2.2 (validation logic)  
**Assigned to**: Kiro

---

### TASK-2.4: Create GET /api/ci-kaizen/kpi-targets — New Endpoint

**Description**: Return regional KPI submission targets with current month progress.

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/ci-kaizen/kpi-targets`
- [ ] Response schema:
  ```json
  {
    "data": [
      {
        "region_name": "Kiên Giang 1",
        "monthly_target": 20,
        "current_month_submitted": 18,
        "completion_percentage": 90,
        "status": "ON_TRACK",
        "alert_level": null
      }
    ]
  }
  ```
- [ ] `status` logic:
  - `>= 100%` → "EXCEEDED"
  - `>= 80%` → "ON_TRACK"
  - `< 80% AND day >= 14` → "AT_RISK"
  - `< 30% AND day >= 14` → "CRITICAL"
- [ ] `current_month_submitted` calculation:
  - COUNT(*) WHERE region_name=X AND MONTH(created_at)=CURRENT_MONTH AND registration_type='THI_DUA'
- [ ] Query by month/year: `?month=8&year=2026` (defaults to current month)
- [ ] Caching: Results cached for 1 hour (alert calculations relatively static)

**Estimate**: 1 hour  
**Dependencies**: TASK-1.3 (regional_kpi_targets table), TASK-2.1 (query patterns)  
**Assigned to**: Kiro

---

### TASK-2.5: Create POST /api/ci-kaizen/scoring/:id — New Endpoint

**Description**: Evaluate proposal with 5 criteria and calculate total score.

**Acceptance Criteria**:
- [ ] Endpoint: `POST /api/ci-kaizen/scoring/:id`
- [ ] Request body:
  ```json
  {
    "evaluator_emp_code": "EMP001",
    "evaluator_name": "Nguyễn Văn A",
    "effectiveness_score": 32,     // 0–35
    "feasibility_score": 18,       // 0–20
    "scalability_score": 16,       // 0–20
    "innovation_score": 14,        // 0–15
    "team_spirit_score": 8,        // 0–10
    "comments": "Excellent..."
  }
  ```
- [ ] Validation:
  - Each score within valid range
  - Sum must not exceed 100
- [ ] Automatic calculation:
  - `total_score = effectiveness + feasibility + scalability + innovation + team_spirit`
  - Round to 1 decimal place
  - Check sum <= 100 (validation error if exceeded)
- [ ] Database updates:
  - Insert row into `ci_kaizen_evaluations` table
  - Update parent proposal: `score_points = total_score`, `sub_status = 'DA_DANH_GIA'`
  - Trigger award assignment logic (if score > 0)
- [ ] Response includes updated proposal snapshot with new score

**Estimate**: 1.5 hours  
**Dependencies**: TASK-2.3 (update logic), TASK-4 (scoring engine)  
**Assigned to**: Kiro

---

### TASK-2.6: Create GET /api/ci-kaizen/alerts — New Endpoint

**Description**: Return active alerts for Ban 2.2 (early warning system).

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/ci-kaizen/alerts`
- [ ] Query parameters:
  - `?alert_type=DEADLINE|KPI|UNEVALUATED|MISSING_EVIDENCE|LOW_PARTICIPATION`
  - `?region=Kiên Giang 1` (filter by region, optional)
  - `?resolved=false` (default: show unresolved)
- [ ] Response schema:
  ```json
  {
    "data": [
      {
        "alert_id": "ALT-2026-08-001",
        "alert_type": "DEADLINE_APPROACHING",
        "severity": "HIGH",
        "message": "Hạn chót ngày 25. Còn 2 ngày.",
        "triggered_at": "2026-08-23T14:30:00Z",
        "resolved": false,
        "affected_count": 125,
        "affected_proposal_ids": ["KZ-001", "KZ-002", ...]
      }
    ]
  }
  ```
- [ ] Alert types calculated on-the-fly or from cache (see TASK-5 for details)
- [ ] Pagination: Supports `?page=1&limit=50`

**Estimate**: 1 hour  
**Dependencies**: TASK-5 (alert triggering logic)  
**Assigned to**: Kiro

---

## ✅ Phase 3: Validation & Pass/Fail Logic (P0 CRITICAL)

### TASK-3.1: Implement is_actually_deployed Check

**Description**: Ensure proposals are marked as actually implemented before submission.

**Acceptance Criteria**:
- [ ] New field: `is_actually_deployed BOOLEAN DEFAULT false`
- [ ] In POST/PUT validation (TASK-2.2/2.3):
  - If `registration_type='THI_DUA'`, require `is_actually_deployed=true`
  - Error message: "Đề xuất chưa được triển khai thực tế. Cần xác nhận triển khai trước khi nộp."
- [ ] Frontend (Antigravity) passes checkbox value in step 2/3 of form
- [ ] Stored in database and returned in API response

**Estimate**: 30 minutes  
**Dependencies**: TASK-2.2 (validation layer), TASK-1.1 (migration, add column)  
**Assigned to**: Kiro

---

### TASK-3.2: Implement Before/After Evidence Check

**Description**: Ensure proposals have image or video evidence.

**Acceptance Criteria**:
- [ ] In POST validation (TASK-2.2):
  - At least ONE of the following must be non-null:
    - `before_image_url` AND `after_image_url`
    - `before_video_url` AND `after_video_url`
    - `before_image_url` AND `before_video_url` AND one of `after_image_url` or `after_video_url`
  - Error message: "Cần cung cấp minh chứng ảnh hoặc video trước-sau cải tiến."
- [ ] Validation runs before proposal creation
- [ ] Frontend uploads to Cloudinary and passes URLs to backend

**Estimate**: 30 minutes  
**Dependencies**: TASK-2.2 (validation), TASK-1.2 (video URL columns)  
**Assigned to**: Kiro

---

### TASK-3.3: Implement Safety Compliance (ATLD) Check

**Description**: Require safety confirmation for safety-related proposals.

**Acceptance Criteria**:
- [ ] New field: `safety_confirmed BOOLEAN DEFAULT false`
- [ ] In POST validation:
  - If `category` IN ('SAFETY', '5S', 'EQUIPMENT', 'AUTOMATION'), require `safety_confirmed=true`
  - Error message: "Cần xác nhận tuân thủ An toàn Lao động (ATLD) trước khi nộp."
- [ ] Mapping: `category` values → safety-critical categories (check TASK-2.2 for category enums)
- [ ] Stored in database

**Estimate**: 30 minutes  
**Dependencies**: TASK-2.2 (validation), TASK-1.2 (safety_confirmed field)  
**Assigned to**: Kiro

---

### TASK-3.4: Implement Duplicate Detection (Warning-Only for MVP)

**Description**: Check for potential duplicate submissions from past 12 months.

**Acceptance Criteria**:
- [ ] New field: `new_development_step BOOLEAN DEFAULT false` (optional, for user context)
- [ ] In POST validation:
  - Query approved proposals from past 12 months
  - Compare `title` using fuzzy string matching (similarity > 85%)
  - If `topic_group` AND `category` both identical → flag as potential duplicate
  - If duplicate found:
    - If `new_development_step=true` → allow submission with flag "New iteration"
    - If `new_development_step=false` → allow submission with warning "Similar to [previous_code]"
    - **For MVP**: Warning-only (not blocking), log in duplicate_detection_log table
- [ ] Create `duplicate_detection_log` table:
  ```sql
  CREATE TABLE duplicate_detection_log (
    id TEXT PRIMARY KEY,
    proposal_id TEXT,
    matched_proposal_id TEXT,
    similarity_score REAL,
    match_type VARCHAR(50),  -- 'TITLE_MATCH', 'CONCEPT_MATCH', 'CATEGORY_MATCH'
    flagged_as_new_iteration BOOLEAN,
    created_at DATETIME
  );
  ```
- [ ] Response includes warning: `{ "warning": "Possible duplicate of KZ-2026-05-001" }`

**Estimate**: 1.5 hours  
**Dependencies**: TASK-2.2 (validation), fuzzy string library  
**Assigned to**: Kiro

---

## 📊 Phase 4: Scoring Engine (P0 CRITICAL)

### TASK-4.1: Implement Effectiveness Score Calculation (Criterion 1, 35 pts)

**Description**: Auto-calculate effectiveness score based on topic_group.

**Acceptance Criteria**:
- [ ] Service method: `calculateEffectivenessScore(proposalId, topic_group, pricing_direction, ...values)`
- [ ] **PRODUCTIVITY_GROUP** (time-based):
  - Formula: `(time_before - time_after) / time_before * 100`
  - Thresholds: 70% → 35pts, 50% → 25pts, 30% → 15pts, 0% → 0pts
  - Interpolate between thresholds
- [ ] **WASTE_GROUP** (cost-based):
  - Formula: `efficiency_value_vnd / baseline_cost * 100`
  - Thresholds: 40% → 35pts, 20% → 20pts, 5% → 8pts
  - Interpolate between thresholds
- [ ] **SAFETY_GROUP** (case avoidance):
  - Input from evaluator: incident types prevented, severity levels
  - Thresholds: Major incident → 35pts, Minor incident → 15pts, Near-miss → 5pts
- [ ] **OTHER_GROUP**: Evaluator assigns 0–35pts manually
- [ ] Store in `effectiveness_score` column
- [ ] Thresholds configurable in `scoring_criteria` table (don't hardcode)

**Estimate**: 1.5 hours  
**Dependencies**: TASK-1.3 (scoring_criteria table), TASK-2.5 (scoring endpoint)  
**Assigned to**: Kiro

---

### TASK-4.2: Implement Feasibility & Investment Score (Criterion 2, 20 pts)

**Description**: Allow evaluator to assess feasibility and resource requirements.

**Acceptance Criteria**:
- [ ] Field: `feasibility_score` (0–20)
- [ ] Levels (user selects or auto-detected from proposal text):
  - Level 1 (< 5M investment) → 20pts
  - Level 2 (5M–50M investment) → 15pts
  - Level 3 (50M–200M investment) → 10pts
  - Level 4 (> 200M investment) → 5pts
- [ ] If cost estimate in proposal comments/description → auto-categorize
- [ ] Evaluator can override with manual score
- [ ] Stored in database

**Estimate**: 1 hour  
**Dependencies**: TASK-2.5 (scoring endpoint)  
**Assigned to**: Kiro

---

### TASK-4.3: Implement Scalability Score (Criterion 3, 20 pts)

**Description**: Assess rollout potential across departments.

**Acceptance Criteria**:
- [ ] Field: `scalability_score` (0–20)
- [ ] Levels:
  - Level 1 (All depts, >5 applicable) → 20pts
  - Level 2 (3–5 departments) → 15pts
  - Level 3 (1–2 departments) → 10pts
  - Level 4 (Single-use only) → 5pts
- [ ] Evaluator selects based on proposal scope
- [ ] Stored in database

**Estimate**: 45 minutes  
**Dependencies**: TASK-2.5 (scoring endpoint)  
**Assigned to**: Kiro

---

### TASK-4.4: Implement Innovation & Initiative Score (Criterion 4, 15 pts)

**Description**: Assess creativity and self-driven improvement.

**Acceptance Criteria**:
- [ ] Field: `innovation_score` (0–15)
- [ ] Levels:
  - Level 1 (Novel, first-time, self-initiated) → 15pts
  - Level 2 (Creative adaptation, some innovation) → 11pts
  - Level 3 (Standard method, minor improvement) → 7pts
  - Level 4 (Incremental/maintenance only) → 3pts
- [ ] Evaluator judges novelty
- [ ] Stored in database

**Estimate**: 45 minutes  
**Dependencies**: TASK-2.5 (scoring endpoint)  
**Assigned to**: Kiro

---

### TASK-4.5: Implement Team Spirit & Dissemination Score (Criterion 5, 10 pts)

**Description**: Assess teamwork and knowledge sharing.

**Acceptance Criteria**:
- [ ] Field: `team_spirit_score` (0–10)
- [ ] Levels:
  - Level 1 (Widely shared, >5 team members) → 10pts
  - Level 2 (Shared with department, 3–5 members) → 7pts
  - Level 3 (Shared with immediate team, 1–2 members) → 3pts
  - Level 4 (Solo effort, not shared) → 0pts
- [ ] Evaluator assesses based on proposal narrative
- [ ] Stored in database

**Estimate**: 45 minutes  
**Dependencies**: TASK-2.5 (scoring endpoint)  
**Assigned to**: Kiro

---

### TASK-4.6: Implement Total Score Calculation & Validation

**Description**: Sum 5 criteria and validate total ≤ 100.

**Acceptance Criteria**:
- [ ] Formula: `total_score = effectiveness + feasibility + scalability + innovation + team_spirit`
  - Max = 35 + 20 + 20 + 15 + 10 = 100
- [ ] Validation: Reject if sum > 100
- [ ] Rounding: Round to 1 decimal place
- [ ] Store in `score_points` column on proposal
- [ ] Update `sub_status = 'DA_DANH_GIA'` on proposal
- [ ] Trigger award assignment if score > 0 (TASK-6.1)
- [ ] Tested with various combinations

**Estimate**: 1 hour  
**Dependencies**: TASK-4.1 to 4.5 (all criteria implemented)  
**Assigned to**: Kiro

---

## 🚨 Phase 5: Early Warning Alerts & Reporting (P1 IMPORTANT)

### TASK-5.1: Implement Deadline Alert (Days to 25th)

**Description**: Detect proposals approaching submission deadline.

**Acceptance Criteria**:
- [ ] Logic: On each day between 20th–24th of month
  - Find all proposals with `registration_type='THI_DUA'` AND `status='SUBMITTED'` AND `created_at` this month
  - Set `alert_flag='DEADLINE_APPROACHING'`
- [ ] New endpoint: `GET /api/ci-kaizen/alerts?alert_type=DEADLINE`
- [ ] Response includes proposal count and days remaining
- [ ] Implementation: Cron job (daily at 6 AM) or lazy-calculation on endpoint call
- [ ] Test by manipulating current date in dev environment

**Estimate**: 45 minutes  
**Dependencies**: TASK-2.6 (alerts endpoint)  
**Assigned to**: Kiro

---

### TASK-5.2: Implement Regional KPI Alert (After 14th)

**Description**: Monitor regional submission targets and alert if off-track.

**Acceptance Criteria**:
- [ ] Logic: After 14th of month, for each region in `regional_kpi_targets`:
  - Calculate: `completion % = current_month_submitted / monthly_target * 100`
  - If `< 80%` → `alert_level='AT_RISK'` (yellow)
  - If `< 30%` → `alert_level='CRITICAL'` (red)
- [ ] Endpoint: `GET /api/ci-kaizen/kpi-targets` (already created in TASK-2.4, just add alert_level)
- [ ] Response includes alert_level per region
- [ ] Test by creating proposals for different regions

**Estimate**: 30 minutes  
**Dependencies**: TASK-2.4 (kpi-targets endpoint)  
**Assigned to**: Kiro

---

### TASK-5.3: Implement Unevaluated Proposals Alert

**Description**: Alert when proposals near evaluation deadline without scores.

**Acceptance Criteria**:
- [ ] Logic: On 26th of month and onwards
  - Find proposals submitted before 25th where `sub_status='CHO_DANH_GIA'` (not yet scored)
  - Create alert with proposal IDs and count
- [ ] Alert message: "X bài thi đua chưa được chấm điểm trước hạn chót tổng kết."
- [ ] Endpoint: `GET /api/ci-kaizen/alerts?alert_type=UNEVALUATED`
- [ ] Response includes list of unevaluated proposal IDs

**Estimate**: 30 minutes  
**Dependencies**: TASK-2.6 (alerts endpoint)  
**Assigned to**: Kiro

---

### TASK-5.4: Implement Missing Evidence Alert

**Description**: Alert proposals missing before/after evidence (images/videos).

**Acceptance Criteria**:
- [ ] Logic: Find proposals with `registration_type='THI_DUA'` where:
  - `before_image_url IS NULL AND before_video_url IS NULL` → "MISSING_BEFORE_EVIDENCE"
  - `after_image_url IS NULL AND after_video_url IS NULL` → "MISSING_AFTER_EVIDENCE"
- [ ] Endpoint: `GET /api/ci-kaizen/alerts?alert_type=MISSING_EVIDENCE`
- [ ] Response includes proposal IDs and type of missing evidence
- [ ] Test by creating proposals without evidence

**Estimate**: 30 minutes  
**Dependencies**: TASK-2.6 (alerts endpoint)  
**Assigned to**: Kiro

---

### TASK-5.5: Implement Low Participation Alert (After 14th)

**Description**: Alert if submission rate too low to meet organizational goals.

**Acceptance Criteria**:
- [ ] Logic: On 15th of month, calculate:
  - `submission_rate = COUNT(current_month_proposals) / COUNT(active_employees_in_system) * 100`
  - If `submission_rate < 30%` → `alert_type='LOW_PARTICIPATION'`
- [ ] Query active employees from user/employee table (or hardcoded estimate: 500–1000 active CTVs)
- [ ] Endpoint: `GET /api/ci-kaizen/alerts?alert_type=LOW_PARTICIPATION`
- [ ] Response: `{ "message": "Tỷ lệ nộp bài chỉ 25%. Cần khuyến khích CTV tham gia." }`
- [ ] Test by adjusting employee count or creating/deleting proposals

**Estimate**: 45 minutes  
**Dependencies**: TASK-2.6 (alerts endpoint), employee list available  
**Assigned to**: Kiro

---

### TASK-5.6: Create Weekly Report Infrastructure

**Description**: Build tables and endpoints for weekly reporting.

**Acceptance Criteria**:
- [ ] Table: `weekly_reports` (created in TASK-1.3)
- [ ] Endpoint: `POST /api/ci-kaizen/weekly-report`
  - Request: `{ "week_start_date": "2026-08-18", "week_end_date": "2026-08-24" }`
  - Auto-calculates:
    - `total_ideas_submitted` = COUNT(*) for week
    - `pending_evaluation_count` = COUNT(*) WHERE sub_status='CHO_DANH_GIA'
    - `registered_for_competition` = COUNT(*) WHERE registration_type='THI_DUA'
  - Returns summary + proposal list
- [ ] Endpoint: `GET /api/ci-kaizen/weekly-report?week_start=2026-08-18`

**Estimate**: 1 hour  
**Dependencies**: TASK-1.3 (weekly_reports table), TASK-2.1 (query patterns)  
**Assigned to**: Kiro

---

### TASK-5.7: Create Monthly Report Infrastructure

**Description**: Build tables and endpoints for monthly reporting.

**Acceptance Criteria**:
- [ ] Table: `monthly_reports` (created in TASK-1.3)
- [ ] Endpoint: `GET /api/ci-kaizen/monthly-report?month=8&year=2026`
  - Auto-calculates:
    - `total_proposals` = COUNT(*) for month
    - `total_competition_entries` = COUNT(*) WHERE registration_type='THI_DUA'
    - `total_evaluated` = COUNT(*) WHERE score_points > 0
    - `average_score` = AVG(score_points) for month
    - `total_value_vnd` = SUM(efficiency_value_vnd)
  - Response includes summary statistics and lists top 5 proposals
- [ ] Endpoint: `POST /api/ci-kaizen/monthly-report` (create/finalize report for Ban 2.2)
- [ ] Tested with realistic data

**Estimate**: 1 hour  
**Dependencies**: TASK-1.3 (monthly_reports table), TASK-2.1 (query patterns)  
**Assigned to**: Kiro

---

## 🏆 Phase 6: Awards & Maturity System (P1 IMPORTANT)

### TASK-6.1: Implement Individual Award Assignment (11 Awards)

**Description**: Automatically rank and assign awards to top proposals.

**Acceptance Criteria**:
- [ ] Stored procedure (or service method): `assignMonthlyAwards(month, year)`
- [ ] Logic:
  1. Query proposals: `WHERE registration_type='THI_DUA' AND score_points > 0 AND status NOT IN ('REJECTED', 'DUPLICATE') AND MONTH(created_at)=month`
  2. ORDER BY `score_points DESC, created_at ASC` (tiebreaker: earlier submission wins)
  3. Assign awards:
     - Rank 1 → "Giải Nhất" (5M VNĐ)
     - Ranks 2–3 → "Giải Nhì" (3M VNĐ each)
     - Ranks 4–6 → "Giải Ba" (2M VNĐ each)
     - Ranks 7–11 → "Giải Khuyến Khích" (800k VNĐ each)
  4. Insert into `awards` table
  5. Update proposal: `award_title`, `status` (if finalized)
- [ ] Endpoint: `POST /api/ci-kaizen/awards/assign-monthly`
  - Request: `{ "month": 8, "year": 2026 }`
  - Response: List of awarded proposals
- [ ] Endpoint: `GET /api/ci-kaizen/awards?month=8&year=2026`
  - Returns all awarded proposals for month
- [ ] Tested with sample data (ensure ranking logic works correctly)

**Estimate**: 2 hours  
**Dependencies**: TASK-4.6 (total score calculated), TASK-1.3 (awards table)  
**Assigned to**: Kiro

---

### TASK-6.2: Implement Organizational Award Calculation (2 Giải Phong Trào)

**Description**: Calculate organizational/team awards based on culture score.

**Acceptance Criteria**:
- [ ] Formula:
  ```
  Culture_Score = (Participation_Rate * 0.50) + (Avg_Team_Score * 0.30) + (Awards_Per_Team * 0.20)
  
  Where:
  - Participation_Rate = team_proposals / total_team_employees * 100
  - Avg_Team_Score = AVG(score_points) for team's proposals
  - Awards_Per_Team = COUNT(awards) for team members
  ```
- [ ] Service method: `calculateOrganizationalScore(department, month, year)`
- [ ] Stored procedure: `assignOrganizationalAwards(month, year)`
  - Calculates score for each department
  - Ranks departments by score
  - Assigns top 2: "Giải Phong Trào Nhất" (5M) and "Giải Phong Trào Nhì" (4M)
  - Inserts into `organizational_awards` table
- [ ] Endpoint: `POST /api/ci-kaizen/organizational-awards/assign-monthly`
- [ ] Endpoint: `GET /api/ci-kaizen/organizational-awards?month=8&year=2026`
- [ ] Tested with multiple departments

**Estimate**: 1.5 hours  
**Dependencies**: TASK-6.1 (individual awards assigned), TASK-1.3 (organizational_awards table)  
**Assigned to**: Kiro

---

### TASK-6.3: Implement Maturity Level Tracking (5-Level CMMI)

**Description**: Track organizational maturity progression.

**Acceptance Criteria**:
- [ ] Table: `maturity_levels` (created in TASK-1.3)
- [ ] Maturity levels:
  - E (0–20) = Chaotic
  - D (21–40) = Repeatable
  - C (41–60) = Defined
  - B (61–80) = Managed
  - A (81–100) = Optimized
- [ ] Calculation (quarterly or annually):
  - Aggregate all proposals for organization
  - Compute: `maturity_score = (avg_proposal_score * 0.5) + (participation_rate * 0.3) + (awards_count_normalized * 0.2)`
  - Map score to level (E–A)
  - Track level progression in table
- [ ] Endpoint: `GET /api/ci-kaizen/maturity-level`
  - Response includes: current_level, previous_level, score, trend
- [ ] Endpoint: `POST /api/ci-kaizen/maturity-level/calculate` (admin-only, trigger recalculation)
- [ ] Tested with sample organizational data

**Estimate**: 1.5 hours  
**Dependencies**: TASK-1.3 (maturity_levels table), TASK-6.1 and 6.2 (award calculations)  
**Assigned to**: Kiro

---

## 🧪 Phase 7: Testing & Integration (P1 IMPORTANT)

### TASK-7.1: Unit Tests for Scoring Engine

**Description**: Test scoring calculation logic with various inputs.

**Acceptance Criteria**:
- [ ] Test suite: `__tests__/scoring-engine.test.ts` (or equivalent)
- [ ] Test cases:
  1. Effectiveness score calculation (time-based, cost-based, safety, custom)
  2. Feasibility level mapping
  3. Scalability level mapping
  4. Innovation level mapping
  5. Team spirit level mapping
  6. Total score calculation (sum, rounding, max validation)
  7. Edge cases (0 scores, 100-point max, rounding precision)
- [ ] All tests passing
- [ ] Coverage > 80%

**Estimate**: 1.5 hours  
**Dependencies**: TASK-4.1 to 4.6 (scoring implemented)  
**Assigned to**: Kiro

---

### TASK-7.2: Integration Tests for API Endpoints

**Description**: Test all new endpoints with realistic data.

**Acceptance Criteria**:
- [ ] Test suite: `__tests__/api-integration.test.ts`
- [ ] Test cases:
  1. POST /api/ci-kaizen with all P0/P1 fields
  2. GET /api/ci-kaizen with new filters (topic_group, customer_brand, product_code)
  3. PUT /api/ci-kaizen/:id (update proposal)
  4. POST /api/ci-kaizen/scoring/:id (calculate score)
  5. GET /api/ci-kaizen/kpi-targets (regional targets)
  6. GET /api/ci-kaizen/alerts (all 5 alert types)
  7. POST /api/ci-kaizen/weekly-report
  8. GET /api/ci-kaizen/monthly-report
  9. POST /api/ci-kaizen/awards/assign-monthly
  10. GET /api/ci-kaizen/organizational-awards
  11. GET /api/ci-kaizen/maturity-level
- [ ] All tests passing
- [ ] Error cases tested (validation errors, not found, etc.)

**Estimate**: 2 hours  
**Dependencies**: All Phase 2–6 tasks (endpoints implemented)  
**Assigned to**: Kiro

---

### TASK-7.3: Backward Compatibility Verification

**Description**: Ensure old API clients still work with new fields.

**Acceptance Criteria**:
- [ ] Old frontend queries (without new filter params) still return correct results
- [ ] Old proposal records (created before migration) still fetch correctly
- [ ] New fields have sensible defaults (no null-pointer errors)
- [ ] Response includes all old fields (no deletions/renames)
- [ ] Test with Postman using old API contract

**Estimate**: 1 hour  
**Dependencies**: TASK-2.1 (serialization), TASK-1.4 (schema updated)  
**Assigned to**: Kiro

---

### TASK-7.4: End-to-End Test with Antigravity Frontend

**Description**: Test complete workflow: Form submission → Scoring → Awards.

**Acceptance Criteria**:
- [ ] Checkout both branches: `agent/kiro-backend` and `agent/antigravity-frontend`
- [ ] Run Antigravity form on frontend
- [ ] Submit 5-step form with all new fields
- [ ] Backend receives and validates data
- [ ] Confirm proposal created with all fields in database
- [ ] Query proposal via GET /api/ci-kaizen/{id}
- [ ] Simulate evaluation (POST /api/ci-kaizen/scoring/{id})
- [ ] Confirm score calculated and displayed on frontend dashboard
- [ ] Simulate award assignment (POST /api/ci-kaizen/awards/assign-monthly)
- [ ] Verify awards visible in library/dashboard
- [ ] No errors in browser console or server logs

**Estimate**: 1.5 hours  
**Dependencies**: All Phase 2–6 tasks, Antigravity branch ready  
**Assigned to**: Kiro (coordinate with Antigravity)

---

## 📋 Task Dependency Map

```
PHASE 1: Database
├─ TASK-1.1 (P0 migrations)
├─ TASK-1.2 (P1 migrations) → depends on 1.1
├─ TASK-1.3 (New tables) → independent
└─ TASK-1.4 (Prisma schema) → depends on 1.1, 1.2, 1.3

PHASE 2: API
├─ TASK-2.1 (GET serialization) → depends on 1.4
├─ TASK-2.2 (POST validation) → depends on 2.1
├─ TASK-2.3 (PUT update) → depends on 2.2
├─ TASK-2.4 (GET kpi-targets) → depends on 1.3, 2.1
├─ TASK-2.5 (POST scoring) → depends on 2.3, 4.x
└─ TASK-2.6 (GET alerts) → depends on 5.x

PHASE 3: Validation
├─ TASK-3.1 (is_actually_deployed) → depends on 2.2, 1.1
├─ TASK-3.2 (Before/After evidence) → depends on 2.2, 1.2
├─ TASK-3.3 (ATLD check) → depends on 2.2, 1.2
└─ TASK-3.4 (Duplicate detection) → depends on 2.2, 1.2

PHASE 4: Scoring
├─ TASK-4.1 (Effectiveness) → depends on 1.3, 2.5
├─ TASK-4.2 (Feasibility) → depends on 2.5
├─ TASK-4.3 (Scalability) → depends on 2.5
├─ TASK-4.4 (Innovation) → depends on 2.5
├─ TASK-4.5 (Team Spirit) → depends on 2.5
└─ TASK-4.6 (Total Score) → depends on 4.1–4.5

PHASE 5: Alerts & Reports
├─ TASK-5.1 (Deadline Alert) → depends on 2.6
├─ TASK-5.2 (KPI Alert) → depends on 2.4
├─ TASK-5.3 (Unevaluated) → depends on 2.6
├─ TASK-5.4 (Missing Evidence) → depends on 2.6
├─ TASK-5.5 (Low Participation) → depends on 2.6
├─ TASK-5.6 (Weekly Report) → depends on 1.3, 2.1
└─ TASK-5.7 (Monthly Report) → depends on 1.3, 2.1

PHASE 6: Awards
├─ TASK-6.1 (Individual Awards) → depends on 4.6, 1.3
├─ TASK-6.2 (Org Awards) → depends on 6.1, 1.3
└─ TASK-6.3 (Maturity Levels) → depends on 1.3, 6.1, 6.2

PHASE 7: Testing
├─ TASK-7.1 (Unit Tests) → depends on 4.x
├─ TASK-7.2 (Integration Tests) → depends on 2.x–6.x
├─ TASK-7.3 (Backward Compat) → depends on 2.1, 1.4
└─ TASK-7.4 (E2E with FE) → depends on 2.x–6.x, Antigravity ready
```

---

## ⏱️ Effort Estimates by Phase

| Phase | Tasks | Hours | Start | End |
|---|---|:---:|---|---|
| 1: Database | 4 | 3–4 | Week 1, Day 1 | Week 1, Day 1 PM |
| 2: API | 6 | 3–4 | Week 1, Day 2 | Week 1, Day 2 PM |
| 3: Validation | 4 | 2–3 | Week 1, Day 3 | Week 1, Day 3 PM |
| 4: Scoring | 6 | 4–5 | Week 1, Day 4 | Week 2, Day 1 AM |
| 5: Alerts & Reports | 7 | 3–4 | Week 2, Day 1 PM | Week 2, Day 2 PM |
| 6: Awards & Maturity | 3 | 3–4 | Week 2, Day 3 | Week 2, Day 4 |
| 7: Testing & Integration | 4 | 2–3 | Week 2, Day 4 PM | Week 2, Day 5 |
| **Total** | **34** | **20–27 hours** | - | - |

---

## ✅ Completion Checklist

### Pre-Implementation
- [ ] All requirements read and understood
- [ ] Gap analysis reviewed
- [ ] Dependencies with Antigravity documented
- [ ] Database backup created (for safety)

### During Implementation
- [ ] Commits pushed to `agent/kiro-backend` branch regularly
- [ ] Code reviewed (peer or self-review before merge)
- [ ] Tests run and passing
- [ ] No TypeScript errors or linting issues

### Pre-Merge to Main
- [ ] All 34 tasks completed and tested
- [ ] E2E test with Antigravity frontend successful
- [ ] Backward compatibility verified
- [ ] API documentation updated
- [ ] Migration tested on staging/copy of prod database
- [ ] Rollback plan documented

### Post-Merge
- [ ] Notify Antigravity team of merge
- [ ] Merge Antigravity branch (after verification)
- [ ] Deploy to staging for final QA
- [ ] Prepare for production deployment

---

**Prepared by**: Kiro Backend Agent  
**Created**: 2026-08-24  
**Status**: Ready for Sprint Planning & Task Assignment  

---

**Next Actions**:
1. Assign tasks to team members
2. Set up development environment (database, Prisma, API framework)
3. Begin Phase 1: Database migrations
4. Track progress in this task file
5. Sync with Antigravity on integration points
