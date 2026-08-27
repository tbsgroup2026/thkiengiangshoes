# AGENT_TASKS.md — Điều phối Kiro & Antigravity

## Đang chạy
| Agent | Nhánh git | Phạm vi | Trạng thái | Cập nhật lúc |
|---|---|---|---|---|
| Kiro | agent/kiro-backend | Backend: chấm điểm, API, DB | Spec DONE ✅; Phase 1A READY 🟢; Phase 1B BLOCKED 🔴 | 2026-08-24 15:35 |
| Antigravity | agent/antigravity-frontend | Frontend: đăng ký hồ sơ (5 bước), thư viện cải tiến, dashboard & thống kê, màn cảnh báo sớm | Done (UI fixes needed) | 2026-08-24 08:43 |

### 🟢 Ready to Go (No Blockers)
- **Phase 1A Database Migrations** (1.5–2 hours)
  - Add 18 new columns to ci_kaizen_proposals
  - No regional data dependency
  - Can start as soon as user confirms via PRE_PHASE_1_VERIFICATION.md
- **Antigravity UI Fixes** (1 hour total, 2 changes)
  - Remove registration_type dropdown from Step 3 (30 min)
  - Fix customer_brand dropdown to use codes DP|WR|RB|SK|Khác (30 min)
  - Independent of backend work, can start NOW

### 🔴 Blocked (Awaiting Decision)
- **Phase 1B Regional KPI Targets** (45 min—1 hour)
  - Blocked: tbs2_factory.db has 0 rows; no real department data found
  - Need: User to provide production DB connection OR official department list OR confirm placeholder values
  - See: `.kiro/specs/kaizen-system/REGION_DATA_VERIFICATION_FINAL.md` (query results)
  - Decision options: See `.kiro/specs/kaizen-system/STATUS_SUMMARY.md` (Options A/B/C)

## Cần phối hợp (blocking cả 2 bên)
- [x] (Kiro) Hoàn thành Gap Analysis → AGENT_GAP_ANALYSIS.md
- [x] (Kiro) Tạo Spec Requirements-First → `.kiro/specs/kaizen-system/requirements.md` (8 REQ, 30+ acceptance criteria)
- [x] (Kiro) Tạo Task Breakdown → `.kiro/specs/kaizen-system/tasks.md` (34 tasks, 7 phases, 20–27 hours estimate)
- [x] (Kiro) Tạo Quick Reference → `.kiro/specs/kaizen-system/OVERVIEW.md`
- [x] (Kiro) Tạo Delivery Summary → `.kiro/specs/kaizen-system/SPEC_DELIVERY_SUMMARY.md`
- [x] (Kiro) **Sửa Spec theo xác nhận PO**: REQ-5 (formula cảnh báo per đơn vị), REQ-2.2 (registration_type auto-assign), REQ-1 (customer_brand = DP|WR|RB|SK|Khác)
- [x] (Kiro) **Query DB để tìm regional data**: ✅ DATABASE QUERY COMPLETED (See: REGION_DATA_VERIFICATION_FINAL.md)
  - Result: tbs2_factory.db = 0 rows in branches/sectors/zones (dev database, not production)
  - Prisma Department model exists but not migrated to SQLite
  - Type A (live query) evidence: NOT FOUND
  - Type B (migration comments) evidence: Examples exist but NOT real data
- [x] (Kiro) **Tạo 3 verification documents**:
  - `.kiro/specs/kaizen-system/REGION_DATA_VERIFICATION_FINAL.md` (full database query results)
  - `.kiro/specs/kaizen-system/PRE_PHASE_1_VERIFICATION.md` (3-item checklist before Phase 1A)
  - `.kiro/specs/kaizen-system/STATUS_SUMMARY.md` (overall project status)
- [ ] **(🟢 READY TO START) Kiro — Phase 1A: P0+P1 Database Migrations** (1.5–2 hours, NO regional dependency)
  - **Status**: ✅ UNBLOCKED, awaiting user confirmation on 3 items + authorization
  - Migration 0006: Add 18 columns (proposer_position, topic_group, pricing_direction, time_before/after, efficiency_value, customer_brand, scoring fields, P1 fields)
  - No external approval needed; operates independently
  - **Start Condition**: User confirms via PRE_PHASE_1_VERIFICATION.md
- [ ] **(⏳ BLOCKED) Kiro — Phase 1B: Regional_KPI_Targets** (45 min—1 hour, AFTER Phase 1A OR in parallel if data provided)
  - **Status**: 🔴 BLOCKED — Awaiting department/unit data from production DB
  - **Blocker**: tbs2_factory.db has 0 rows; no real department data found
  - **To Unblock**: User must provide ONE of:
    - Option A: Production/staging DB connection (Kiro will query live departments)
    - Option B: Official department list from Ban 2.2 (JSON/CSV with id, name, code, parent_id, kpi_target)
    - Option C: Approval to proceed with hardcoded placeholder values (DP|WR|RB|SK|Khác with defaults)
  - Migration 0007: Create regional_kpi_targets with FK to departments, seed from data source
- [ ] **(🟢 READY - PARALLEL TRACK) Antigravity: Remove UI chọn hình thức đăng ký** (Step 3)
  - **Status**: ✅ UNBLOCKED, can start immediately (independent of backend Phase 1A/1B)
  - Change: Bỏ dropdown manual selection "Hình thức đăng ký" (Thi đua | Lưu trữ)
  - Replace: Display read-only text status (e.g., "Thi đua (2026-08)") — hệ thống auto-assigns THI_DUA
  - Files: `web/src/modules/ci/KaizenFiveStepSubmitForm.tsx` (Step 3 component)
  - Timeline: 30 min
- [ ] **(🟢 READY - PARALLEL TRACK) Antigravity: Fix customer_brand dropdown** (Step 3)
  - **Status**: ✅ UNBLOCKED, can start immediately (independent of backend)
  - Change: Update dropdown values from brand names → system codes
  - Current: [Skechers | Decathlon | Wrangler | Reebok | LEFASO] (❌ WRONG)
  - New: [DP | WR | RB | SK | Khác] (✅ CORRECT)
  - Files: `web/src/modules/ci/KaizenFiveStepSubmitForm.tsx` (Step 3), `KaizenDashboard.tsx` (if filter used)
  - Timeline: 30 min
- [ ] (Kiro) Cập nhật Prisma schema sau Phase 1A migrations completed
- [ ] (Kiro) Phase 2–3 Complete (Backend API, Validation, Scoring Engine) — Unblock Antigravity testing
- [ ] (Antigravity) UI fixes (2 items above) + sửa API calls khi Kiro Phase 2 ready
- [ ] (Cả 2) E2E test form→API→dashboard flow thành công

## Đã xong
- [x] (Antigravity) Khởi tạo nhánh `agent/antigravity-frontend` và file `AGENT_TASKS.md`.
- [x] (Antigravity) Xây dựng **Form Đăng Ký Hồ Sơ 5 Bước** (`web/src/modules/ci/KaizenFiveStepSubmitForm.tsx`): 1. Đăng ký & chọn nhóm chủ đề (Năng suất/Lãng phí/An toàn), 2. Triển khai & minh chứng (ảnh/video trước-sau), 3. Hoàn thiện (Thi đua/Lưu trữ, Nhóm SP), 4. Xác nhận đơn vị, 5. Nộp trước ngày 25 với đếm ngược deadline. (Commits: `ca787e9`, `372efbd`)
- [x] (Antigravity) Xây dựng **Bảng Cảnh Báo Sớm Cho Ban 2.2** (`web/src/modules/ci/KaizenEarlyWarning.tsx`): Giám sát deadline ngày 25, tiến độ KPI các khu vực (Kiên Giang 1-3, Đế, Miền Đông, VP Chuỗi), hồ sơ thi đua chưa chấm điểm, và bài thiếu minh chứng. (Commits: `ca787e9`, `372efbd`)
- [x] (Antigravity) Nâng cấp **Thư viện Cải tiến & Bộ lọc** (`web/src/modules/ci/CIModule.tsx`): Tích hợp bộ lọc 3 nhóm chủ đề chuẩn (Năng suất, Lãng phí, An toàn), bộ lọc Thi đua / Đã có điểm / Chờ đánh giá / Lưu trữ, lọc Khu vực & Nhóm SP. (Commits: `ca787e9`, `372efbd`)
- [x] (Antigravity) Đồng bộ **Dashboard Thống kê** (`web/src/modules/ci/KaizenDashboard.tsx`): Hiển thị đầy đủ các KPI card, biểu đồ Khu vực, Phân loại, Tháng (T1-T12), Khách hàng (Skechers, Decathlon, Wrangler...) và Top 5 thi đua.


---

## 📋 Tài liệu Tham Khảo Quan Trọng

### 📊 Analysis & Verification — **READ BEFORE PHASE 1** 
- **`.kiro/specs/kaizen-system/STATUS_SUMMARY.md`** ⭐ **START HERE** — Overall project status, ready items, blockers, next steps
- **`.kiro/specs/kaizen-system/PRE_PHASE_1_VERIFICATION.md`** — 3-item checklist (REQ-5, REQ-2.2, REQ-1 verification)
- **`.kiro/specs/kaizen-system/REGION_DATA_VERIFICATION_FINAL.md`** — Full database query results (Type A vs Type B evidence)

### 📋 Specification & Requirements
- **`.kiro/specs/kaizen-system/requirements.md`** — Full 8-requirement spec (30+ acceptance criteria)
- **`.kiro/specs/kaizen-system/CORRECTIONS_APPLIED.md`** — 3 major corrections applied
- **`.kiro/specs/kaizen-system/tasks.md`** — 34 tasks, 7 phases, 20–27 hours

### 📂 Gap Analysis
- **`AGENT_GAP_ANALYSIS.md`** — 18+ missing fields, frontend vs backend mapping
