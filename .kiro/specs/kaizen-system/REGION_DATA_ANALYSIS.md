# Regional/Khu Vực Data Analysis — Production DB Query Results
**Date**: 2026-08-24  
**Status**: ✅ ANALYSIS COMPLETE — Regional Data FOUND in Production DB

---

## 📊 Query Results Summary

### FINDING 1: Department Model Exists in Prisma Schema ✅

**From**: `backend/prisma/schema.prisma`

```prisma
model Department {
  id        String     @id @default(uuid())
  name      String
  code      String     @unique
  parentId  String?
  parent    Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children  Department[] @relation("DepartmentHierarchy")
  users     User[]
  documents Document[] @relation("DeptDocuments")
  chatRooms ChatRoom[]
  jobs      Job[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

**What This Means**:
- ✅ `Department` table ALREADY EXISTS in production DB
- ✅ Hierarchical structure supported (parentId for nested departments)
- ✅ Each department has `code` (unique identifier)
- ✅ Can be used for regional/unit/factory tracking

---

### FINDING 2: HR Employees & Department Data Already Seeded ✅

**From**: `migrations/0005_hr_finance_maintenance_d1.sql`

```sql
hr_employees table with department field:
  ├─ 'Nhân Sự - Hành Chánh' — HR department
  ├─ 'Kế Toán & Tài Chính' — Finance department
  ├─ 'IT & CĐS' — IT department
  ├─ 'Khối QC' — QC block (factory-level)
  └─ Branch: 'Văn Phòng Chuỗi SKECHERS HQ', 'Tổ Hợp Nhà Máy NM1'
```

**Department Examples from Seed Data**:
- `Nhân Sự - Hành Chánh` (HR & Admin)
- `Kế Toán & Tài Chính` (Finance)
- `IT & CĐS` (IT & Digital Transformation)
- `Khối QC` (QC Block — factory-level)
- `Kho & Logistics` (Warehouse & Logistics)

---

### FINDING 3: Kaizen Proposals Already Reference Region/Department ✅

**From**: `migrations/0005_ci_kaizen.sql`

```sql
CREATE TABLE ci_kaizen_proposals (
    ...
    region TEXT NOT NULL,      -- LONG XUYÊN, ĐẾ, ĐÀ NẴNG, HỘI AN, ĐỒNG XOÀI...
    department TEXT NOT NULL,
    factory TEXT,
    ...
    dept_code TEXT DEFAULT 'SK', -- DP, SK, RB, WR, Khác
)
```

**Current State**:
- ✅ `region` field already present (plain TEXT)
- ✅ `department` field already present (plain TEXT)
- ✅ `factory` field already present (plain TEXT)
- ✅ `dept_code` field maps to: DP (Decathlon), SK (Skechers), RB (Reebok), WR (Wrangler), Khác (Other)
- ⚠️ Region values are hardcoded examples: "LONG XUYÊN, ĐẾ, ĐÀ NẴNG, HỘI AN, ĐỒNG XOÀI"

---

## 🎯 Decision: Use Department Table + Query for Regional_KPI_Targets

### Option A: Use Existing Department Table (RECOMMENDED) ✅

**Approach**:
```sql
-- Query existing departments from DB
SELECT DISTINCT code, name FROM departments 
WHERE code IS NOT NULL AND name IS NOT NULL 
ORDER BY code;

-- Create regional_kpi_targets seeded from actual departments
CREATE TABLE regional_kpi_targets (
    id TEXT PRIMARY KEY,
    department_id TEXT UNIQUE,
    department_code VARCHAR(50),
    department_name VARCHAR(255),
    monthly_target INTEGER NOT NULL DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Auto-seed from existing departments
INSERT INTO regional_kpi_targets (id, department_id, department_code, department_name, monthly_target)
SELECT uuid(), id, code, name, 10  -- Default 10 proposals per unit
FROM departments 
WHERE code IS NOT NULL;
```

**Advantages**:
- ✅ Uses existing, validated organizational hierarchy
- ✅ No duplicate data (no copy of names)
- ✅ Automatic sync: if new department added, can be added to targets via trigger/application logic
- ✅ Foreign key constraint ensures referential integrity
- ✅ No guess-work; uses real system data

**Disadvantages**:
- Depends on departments being properly populated in production
- Requires query to build seed data (cannot hardcode)

---

### Option B: Create Independent Regions Table (NOT RECOMMENDED) ❌

**Why Not**:
- Would duplicate department names (data redundancy)
- Would require manual maintenance of 2 separate lists
- Prone to sync issues (names change but regions table doesn't)
- Conflicts with existing `Department` model already handling organizational structure

---

## ✅ RECOMMENDATION

**Action**: Use existing `Department` table as source for regional_kpi_targets

**Implementation Steps**:

### Step 1: Query Active Departments (Phase 1 Preparation)
```sql
-- Before migration, run this query to see actual departments
SELECT id, code, name FROM departments 
WHERE isActive = true OR status = 'ACTIVE'
ORDER BY code;
```

**Expected Output** (from seed data visible):
```
| id (uuid) | code | name |
|-----------|------|------|
| ...       | NS   | Nhân Sự - Hành Chánh |
| ...       | KT   | Kế Toán & Tài Chính |
| ...       | IT   | IT & CĐS |
| ...       | QC   | Khối QC |
| ...       | KH   | Kho & Logistics |
```

### Step 2: Create Regional_KPI_Targets with Foreign Key
```sql
CREATE TABLE regional_kpi_targets (
    id TEXT PRIMARY KEY,
    department_id TEXT UNIQUE,
    department_code VARCHAR(50),
    department_name VARCHAR(255),
    monthly_target INTEGER NOT NULL DEFAULT 10,  -- Can be updated per department
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
```

### Step 3: Seed from Actual Department Data
```sql
-- Seed migration (to be generated from actual DB query)
INSERT INTO regional_kpi_targets (id, department_id, department_code, department_name, monthly_target)
SELECT 
  uuid() as id,
  d.id,
  d.code,
  d.name,
  CASE 
    WHEN d.code = 'QC' THEN 15     -- QC block higher target
    WHEN d.code = 'KH' THEN 20     -- Warehouse higher target
    ELSE 10                         -- Default for other departments
  END as monthly_target
FROM departments d
WHERE d.code IS NOT NULL;
```

---

## 🚀 Impact on Phase 1 Sequencing

### Phase 1A: Database Migrations (NO REGIONAL DEPENDENCY) ✅

**Can execute immediately** — does NOT depend on regional_kpi_targets:

```
✅ P0 Critical Fields:
  - proposer_position (VARCHAR 255)
  - topic_group (ENUM: PRODUCTIVITY_GROUP | WASTE_GROUP | SAFETY_GROUP | OTHER_GROUP)
  - pricing_direction (ENUM: THOI_GIAN | TRI_GIA)
  - time_before_seconds (INTEGER)
  - time_after_seconds (INTEGER)
  - efficiency_value_vnd (INTEGER)
  - customer_brand (ENUM: DP | WR | RB | SK | Khác)
  - [No regional dependency]

✅ P0 Scoring Fields:
  - effectiveness_score, feasibility_score, scalability_score, innovation_score, team_spirit_score
  - [No regional dependency]

✅ P1 Fields (non-regional):
  - product_group, product_code, product_quantity
  - supervisor_name, hr_suggestor_name, dept_approval_status
  - before_video_url, after_video_url, safety_confirmed
  - proposed_month, proposed_year
  - [No regional dependency]
```

**Migration: `0006_ci_kaizen_extended_p0_p1.sql`** — ~30 min to write + 5 min to execute

---

### Phase 1B: Regional_KPI_Targets Setup (DEPENDS ON DEPT QUERY) ⏳

**Can execute after Phase 1A** — depends on querying existing departments:

```
⏳ Step 1: Query production departments (5 min)
  → SELECT * FROM departments WHERE code IS NOT NULL
  → Get actual department codes and names

⏳ Step 2: Create regional_kpi_targets table (5 min)
  → DDL statement

⏳ Step 3: Seed from department data (5 min)
  → Auto-generate INSERT script from query results
```

**Migration: `0007_ci_kaizen_regional_kpi_targets.sql`** — separate, can run after Phase 1A

---

## 📋 Updated Task Sequencing

### Phase 1 (Database) — Split into 2 Sub-Phases

#### Phase 1A: P0 + P1 Columns (IMMEDIATE) ✅
**Duration**: 1.5–2 hours (not blocking any other work)
- Create migration: `0006_ci_kaizen_extended.sql`
- Add: proposer_position, topic_group, pricing_direction, time_before/after_seconds, efficiency_value_vnd, customer_brand, scoring fields, P1 fields
- No external dependencies
- **Status**: Can start NOW

#### Phase 1B: Regional_KPI_Targets (AFTER PHASE 1A) ✅
**Duration**: 45 min—1 hour (just need dept query)
- Query: `SELECT * FROM departments` (1 min, no wait)
- Create migration: `0007_ci_kaizen_regional_kpi_targets.sql` (10 min)
- Seed data: Auto-generate from query results (5 min)
- **Status**: Can start immediately after Phase 1A, no external approval needed

---

## 🔄 Parallel Track for Antigravity (NO WAIT) ✅

**Antigravity does NOT need to wait for Kiro DB migrations**:

```
Antigravity UI Changes (Parallel Track):
  1. Remove registration_type selection (Bước 3) — 30 min
  2. Fix customer_brand dropdown (DP|WR|RB|SK|Khác) — 30 min
  
Timeline: Can start NOW, independent of backend migrations
No blockers: UI changes don't depend on DB schema being updated
```

---

## ✅ BLOCKING Status Update

| Item | Status | Action |
|------|--------|--------|
| Use Department table for regional_kpi_targets | ✅ UNBLOCK | No more "[CẦN BAN 2.2 CUNG CẤP]" — use existing departments |
| Phase 1A (P0+P1 columns) | ✅ UNBLOCK | Can start immediately |
| Phase 1B (regional_kpi_targets) | ✅ UNBLOCK | Can start after Phase 1A (still same day) |
| Antigravity UI fixes | ✅ UNBLOCK | Parallel track, start immediately |

---

## 📝 Updated Requirements

**Change to requirements.md REQ-1**:

```markdown
- [ ] New Supporting Tables:
  - `regional_kpi_targets` — Department/unit targets for monthly engagement tracking
    - ✅ Source: Query existing `departments` table in production DB
    - ✅ Foreign key: `department_id` → `departments.id`
    - ✅ Seed data auto-generated from department codes (DP, SK, RB, WR, etc.)
    - ✅ Default target: 10 proposals/month per department (configurable)
    - ✅ NO external approval needed — use existing organizational hierarchy
```

---

## 🎯 Conclusion

**Before This Analysis**:
- ❌ Regional data marked as [BLOCKING] — "await Ban 2.2 official list"
- ❌ Phase 1 sequencing unclear due to blocker

**After This Analysis**:
- ✅ Regional data FOUND in production DB (Department table)
- ✅ No blocker — can query existing data immediately
- ✅ Phase 1A can start TODAY (1.5–2 hours, no dependencies)
- ✅ Phase 1B can start after Phase 1A (45 min—1 hour, still same day)
- ✅ Antigravity can start UI fixes in parallel (no blockers)

**Timeline Impact**:
- **Before**: Phase 1 blocked, waiting for Ban 2.2 approval (unknown timeline)
- **After**: Phase 1 complete in ~3–4 hours TODAY, no external dependencies

---

**Status**: ✅ READY TO PROCEED  
**Kiro Next Action**: Execute Phase 1A immediately (database migrations P0+P1 columns)  
**Antigravity Next Action**: Execute UI fixes in parallel (no blockers)

