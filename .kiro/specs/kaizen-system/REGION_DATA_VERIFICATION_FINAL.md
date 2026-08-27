# Regional/Department Data Verification — FINAL REPORT
**Date**: 2026-08-24  
**Status**: ⏳ BLOCKED — No production data found  
**Evidence Type**: Type A (Live database queries only)

---

## 🔍 Query Results Summary

### 1. Departments Table
**Prisma Model Found**: ✅ YES — `Department` model exists in `backend/prisma/schema.prisma`
```prisma
model Department {
  id        String     @id @default(uuid())
  name      String
  code      String     @unique
  parentId  String?
  parent    Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children  Department[] @relation("DepartmentHierarchy")
  users     User[]
  // ... relations to Documents, ChatRooms, Jobs
}
```

**SQLite Database Table Status**: ❌ NO — Table does not exist in `tbs2_factory.db`
```
Query: SELECT * FROM sqlite_master WHERE type='table' AND name='Department';
Result: (empty)
```

**Data Count**: 0 rows
```sql
-- If table existed, query would be:
SELECT COUNT(*) FROM Department;
-- Actual result: Database file queried but table doesn't exist
```

---

### 2. Organizational Unit Tables in SQLite Database

**Database File Queried**: `d:\Work\TBS II\backend\tbs2_factory.db`

| Table Name | Row Count | Status | Notes |
|---|---|---|---|
| `branches` | 0 | Empty | Schema: id, name, region, address |
| `sectors` | 0 | Empty | Schema: id, code, name |
| `zones` | 0 | Empty | Schema: id, code, name |
| `users` | 0 | Empty | Has FK to branch_id, sector_id |
| `departments` | ❌ Not in DB | N/A | Exists only in Prisma schema, not migrated |

**Query Execution Summary**:
```sql
SELECT 'sectors' as tbl, COUNT(*) as cnt FROM sectors 
UNION ALL 
SELECT 'zones', COUNT(*) FROM zones 
UNION ALL 
SELECT 'branches', COUNT(*) FROM branches;

Result:
sectors|0
zones|0
branches|0
```

---

### 3. Regional Data in Migration Files

**File Checked**: `d:\Work\TBS II\web\migrations\0005_ci_kaizen.sql`

**Evidence Found**: Type B (Example comments ONLY — NOT live data)
```sql
-- Example region values from comment:
region TEXT NOT NULL, -- LONG XUYÊN, ĐẾ, ĐÀ NẴNG, HỘI AN, ĐỒNG XOÀI...
dept_code TEXT DEFAULT 'SK', -- DP, SK, RB, WR, Khác
```

**Classification**: 
- ✅ These ARE the **actual system codes** we should use (DP, WR, RB, SK, Khác)
- ❌ But the region examples (LONG XUYÊN, ĐẾ, ĐÀ NẴNG, etc.) are **written by humans in comments**, not extracted from actual data
- ⚠️ **Risk**: These region names may be placeholder/demo values, not official TBS organizational structure

---

## 📊 Current Database State (Type A Evidence)

### What EXISTS in Production DB:
✅ **Prisma Schema Models** (confirmed):
- Department (hierarchical structure with parentId)
- User (with departmentId FK)
- Sector, Zones, Branches (tables with codes/names)

✅ **SQLite Table Schemas** (confirmed via `.schema`):
- `branches`: id, name, region, address
- `sectors`: id, code, name
- `zones`: id, code, name
- `users`: includes department, branch_id, sector_id fields

### What DOES NOT EXIST in Production DB:
❌ **Live Data** (confirmed via COUNT queries):
- 0 rows in branches
- 0 rows in sectors
- 0 rows in zones
- 0 rows in users
- 0 rows in departments (table not migrated)

❌ **Real Organizational Structure**:
- No production data to query
- Cannot verify if Prisma Department model was ever populated
- Cannot extract actual TBS unit names, codes, or hierarchies

---

## 🚨 Root Cause Analysis

### Why is the database empty?

**Hypothesis 1**: This is a **development/demo database** (`tbs2_factory.db`), not a production backup
- File location: `D:\Work\TBS II\backend\tbs2_factory.db` (local machine, not production server)
- All organizational tables are empty
- Likely used for testing/schema verification only

**Hypothesis 2**: Production data exists on a **different database** (staging/production server)
- Current query was against local dev DB only
- Actual production DB at `staging.tbs.com` or internal server may have data
- Need access to real database connection string

**Hypothesis 3**: **Data seeding not yet executed**
- Prisma schema defines Department model
- Migration files exist for ci_kaizen tables
- But no seed script (e.g., `prisma/seed.ts`) found to populate initial data
- Department table never migrated to SQLite

---

## 📋 Classification: Type A vs Type B Evidence

| Evidence Type | Definition | Example | Status |
|---|---|---|---|
| **Type A** (Trustworthy) | Live data returned from actual queries on production DB | SELECT COUNT(*) FROM departments; Result: 147 | ❌ NOT FOUND |
| **Type B** (Unreliable) | Example comments in migration files written by developers | `-- region: LONG XUYÊN, ĐẾ, etc.` | ✅ FOUND but unusable |

**Current Status**: Only Type B evidence found. No Type A data to confirm regional structure.

---

## 🛑 Impact on Phase 1B (regional_kpi_targets)

### REQ-1 Status for regional_kpi_targets Table

**Requirement**: 
> Seed `regional_kpi_targets` from existing department codes (DP, SK, RB, WR, Khác) with default 10 proposals/month per unit

**Can We Execute?**
- ❌ **NO** — Without actual department data in DB, we cannot:
  - Generate Foreign Keys (`department_id`) 
  - Create meaningful seed data beyond placeholder entries
  - Verify the structure matches real TBS operations

**What Needs to Happen**:

1. **Short-term** (Do not block Phase 1A):
   - Keep Phase 1A running: P0+P1 columns migration (proposer_position, topic_group, etc.)
   - Phase 1B marked `[BLOCKED]` pending department data

2. **To Unblock Phase 1B**:
   - Option A: Provide production DB connection → Query real departments
   - Option B: Provide official department list from Ban 2.2 with codes and names
   - Option C: Verify if Prisma seeding exists and run `prisma db seed`

3. **Temporary Workaround** (if Option A/B unavailable):
   - Use hardcoded 5 dept codes: DP, SK, RB, WR, Khác (from system)
   - Create regional_kpi_targets with placeholder default values
   - Marked as `[CẦN BAN 2.2 CUNG CẤP DANH SÁCH CHÍNH THỨC]`

---

## ✅ Verification Checklist

**Queries Executed**:
- [x] List all tables in `tbs2_factory.db`
- [x] Check `.schema branches`, `.schema sectors`, `.schema zones`
- [x] COUNT(*) on all organizational tables
- [x] Verify Prisma schema for Department model
- [x] Search migration files for seeded data
- [x] Check for alternative database files

**Queries NOT Executed** (need authorization):
- [ ] SELECT from production/staging database (different server/creds)
- [ ] Check if seeding script exists and can be run
- [ ] Query actual TBS HR system for department list

---

## 📌 Recommendation

### For Kiro (Backend Agent):
1. **Proceed with Phase 1A immediately** — No regional dependency
   - P0 columns: proposer_position, topic_group, pricing_direction, time_before/after_seconds, efficiency_value_vnd, customer_brand
   - P1 fields: product_group, product_code, etc.
   - Migration: `0006_ci_kaizen_extended.sql`
   - **NOT BLOCKED by regional data**

2. **Hold Phase 1B** — Requires regional data:
   - Table: regional_kpi_targets
   - Migration: `0007_ci_kaizen_regional_kpi_targets.sql`
   - **BLOCKED** until Type A data confirmed or official list provided

### For User:
1. Confirm: Is `tbs2_factory.db` the correct production DB, or should we query elsewhere?
2. If regional data needed:
   - Option A: Provide connection string to staging/production DB
   - Option B: Provide official department/unit list from Ban 2.2
   - Option C: Confirm to use hardcoded values (DP, SK, RB, WR, Khác) with placeholder defaults

---

## 🔗 Related Files
- `.kiro/specs/kaizen-system/requirements.md` — REQ-1 (regional_kpi_targets section)
- `.kiro/specs/kaizen-system/tasks.md` — Phase 1A/1B split
- `d:\Work\TBS II\backend\prisma\schema.prisma` — Department model definition
- `d:\Work\TBS II\web\migrations\0005_ci_kaizen.sql` — Migration with example region comments

---

**Status**: ⏳ **AWAITING USER INPUT** — Phase 1A can proceed; Phase 1B blocked until regional data confirmed.
