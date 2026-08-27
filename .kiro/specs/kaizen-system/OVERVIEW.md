# Kaizen System Backend Spec — Quick Reference
**Status**: ✅ Requirements & Tasks Ready for Implementation  
**Date**: 2026-08-24

---

## 📚 Spec Structure

| File | Purpose | Status |
|---|---|---|
| **requirements.md** | Comprehensive requirements (8 REQ sections) | ✅ Complete |
| **tasks.md** | 34 actionable implementation tasks (7 phases) | ✅ Complete |
| **OVERVIEW.md** | This quick reference | ✅ You are here |

---

## 🎯 What We're Building

**Feature**: Backend support for "Thư viện Cải tiến / Thi đua Cải tiến" (Kaizen Library + Continuous Improvement Competition System)

**Frontend Status**: ✅ 4 screens completed (Antigravity, `agent/antigravity-frontend` branch)
- Form 5-step proposal submission
- Library with filters
- Dashboard with 6 KPIs + 6 charts
- Early warning alerts for Ban 2.2

**Backend Status**: ❌ Database schema incomplete, missing API features
- Current: 21 columns in `ci_kaizen_proposals` table
- Need: +18 columns + 5 new supporting tables
- Need: 5 new API endpoints
- Need: Scoring engine, awards logic, alerts system

---

## 📊 Key Deliverables

### 1. **Database Schema Extensions** (Phase 1)
- **7 P0 Critical Fields**: proposer_position, topic_group, pricing_direction, time_before_seconds, time_after_seconds, efficiency_value_vnd, customer_brand
- **11 P1 Important Fields**: product_group, product_code, product_quantity, supervisor_name, hr_suggestor_name, dept_approval_status, before_video_url, after_video_url, safety_confirmed, proposed_month, proposed_year
- **5 Scoring Fields**: effectiveness_score, feasibility_score, scalability_score, innovation_score, team_spirit_score
- **5 New Tables**: regional_kpi_targets, scoring_criteria, awards, organizational_awards, maturity_levels

### 2. **API Updates** (Phase 2–3)
- ✅ GET /api/ci-kaizen — Enhanced serialization + new filters
- ✅ POST /api/ci-kaizen — Accept all form fields + validation
- ✅ PUT /api/ci-kaizen/:id — Update with auto-calculation
- ✅ GET /api/ci-kaizen/kpi-targets — Regional targets + alerts (NEW)
- ✅ POST /api/ci-kaizen/scoring/:id — 5-criteria evaluation (NEW)
- ✅ GET /api/ci-kaizen/alerts — Early warning system (NEW)

### 3. **Scoring Engine** (Phase 4)
**5 Criteria = 100 Points Total**:
1. **Effectiveness** (35 pts) — Time/cost saved % or safety cases prevented
2. **Feasibility** (20 pts) — Investment requirement & feasibility level
3. **Scalability** (20 pts) — Rollout potential (1–5 depts)
4. **Innovation** (15 pts) — Creativity & self-initiative level
5. **Team Spirit** (10 pts) — Teamwork & dissemination scope

### 4. **Pass/Fail Pre-Conditions** (Phase 3)
Before scoring, proposals must pass 4 checks:
1. ✅ **Actually Deployed** — `is_actually_deployed=true`
2. ✅ **Has Evidence** — At least one image or video (before + after)
3. ✅ **Safety Confirmed** — If safety-related, `safety_confirmed=true`
4. ✅ **No Duplicate** — Fuzzy match check against past 12 months (warning-only for MVP)

### 5. **Award System** (Phase 6)
- **11 Individual Awards**: 1 Nhất (5M) + 2 Nhì (3M) + 3 Ba (2M) + 5 Khuyến Khích (800k)
- **2 Organizational Awards**: 1 Giải Phong Trào Nhất (5M) + 1 Nhì (4M)
- **Maturity Tracking**: 5-level CMMI model (E→D→C→B→A)

### 6. **Early Warning Alerts** (Phase 5)
- 📌 **Deadline Alert**: Days remaining until 25th submission cutoff
- 📌 **KPI Alert**: Regional submission targets (on-track / at-risk / critical)
- 📌 **Unevaluated Alert**: Proposals awaiting scoring past deadline
- 📌 **Missing Evidence Alert**: Proposals lacking before/after evidence
- 📌 **Low Participation Alert**: Overall participation rate < 30%

### 7. **Reporting Infrastructure** (Phase 5)
- 📊 **Weekly Reports**: CTV → Team Lead (idea counts, pending evaluation)
- 📊 **Monthly Reports**: Team → Ban 2.2 (totals, average score, value, awards)

---

## ⚡ Quick Stats

| Metric | Value |
|---|---|
| **Total New Database Columns** | 18 (7 P0 + 11 P1 + 5 scoring) |
| **New Tables** | 5 (kpi_targets, scoring_criteria, awards, org_awards, maturity) |
| **New API Endpoints** | 3 (`/kpi-targets`, `/scoring`, `/alerts`) |
| **Updated API Endpoints** | 3 (`GET/POST/PUT /api/ci-kaizen`) |
| **Scoring Criteria** | 5 (35 + 20 + 20 + 15 + 10 = 100 points) |
| **Pass/Fail Conditions** | 4 (deployed, evidence, safety, duplicate) |
| **Award Tiers** | 13 (11 individual + 2 organizational) |
| **Maturity Levels** | 5 (E→D→C→B→A) |
| **Alert Types** | 5 (deadline, KPI, unevaluated, missing evidence, low participation) |
| **Total Implementation Tasks** | 34 |
| **Estimated Effort** | 14–20 hours |
| **Target Sprint** | Week of 2026-08-26 (5 working days) |

---

## 🔄 Implementation Phases

| Phase | Focus | Duration | Tasks | Priority |
|---|---|---|---|---|
| **1** | Database migrations (7 columns + 5 tables) | 3–4 hrs | TASK-1.1 to 1.4 | 🔴 P0 |
| **2** | API endpoint updates (serialization + validation) | 3–4 hrs | TASK-2.1 to 2.6 | 🔴 P0 |
| **3** | Validation & pass/fail logic (4 checks) | 2–3 hrs | TASK-3.1 to 3.4 | 🔴 P0 |
| **4** | Scoring engine (5 criteria) | 4–5 hrs | TASK-4.1 to 4.6 | 🔴 P0 |
| **5** | Alerts, reports, weekly/monthly | 3–4 hrs | TASK-5.1 to 5.7 | 🟡 P1 |
| **6** | Awards assignment & maturity tracking | 3–4 hrs | TASK-6.1 to 6.3 | 🟡 P1 |
| **7** | Testing & E2E integration | 2–3 hrs | TASK-7.1 to 7.4 | 🟡 P1 |
| **Total** | All phases | **20–27 hrs** | **34 tasks** | - |

---

## 🚀 Critical Path (Do First!)

To unblock Antigravity frontend testing:
1. ✅ **TASK-1.1 → 1.2 → 1.3 → 1.4** — All database work (3–4 hours)
2. ✅ **TASK-2.1 → 2.2 → 2.3** — Core API endpoints (3 hours)
3. ✅ **TASK-3.1 → 3.2 → 3.3** — Pass/fail validation (1.5 hours)

**Total Critical Path: ~7–8 hours** → Then Antigravity can test form submission

Remaining phases (4–6) are "nice to have" for MVP (can be deferred to next sprint if time-bound).

---

## 📝 Key Business Rules

### Monthly Cycle
- **Days 1–24**: CTV submits proposals (thi đua nộp bài)
- **Day 25**: Submission cutoff (hard stop)
- **Days 26–29**: Preliminary evaluation (chấm điểm sơ bộ)
- **Days 30–3 (next month)**: Final evaluation & awards (chấm điểm cuối cùng & công bố giải)

### Submission Types
- **Thi Đua** (Competition) — Eligible for awards, required scoring, public ranking
- **Lưu Trữ** (Archive) — Knowledge base only, not scored, no awards

### Topic Groups (3 Main + Other)
- **PRODUCTIVITY_GROUP** (Năng suất) — Efficiency improvements (time/unit saved)
- **WASTE_GROUP** (Lãng phí) — Cost reductions (materials, energy, etc.)
- **SAFETY_GROUP** (An toàn) — Safety incidents prevented
- **OTHER_GROUP** — Custom/mixed improvements

### Pricing Direction
- **THOI_GIAN** (Time-based) — Measure: seconds/unit saved
- **TRI_GIA** (Monetary) — Measure: VNĐ saved

### Regional Targets (Monthly KPIs)
- Kiên Giang 1: 20 proposals
- Kiên Giang 2: 15 proposals
- Kiên Giang 3: 15 proposals
- Hoàn Thiện Đế: 15 proposals
- Nhà Máy Miền Đông: 25 proposals
- VP Chuỗi (R&D): 10 proposals
- **Total**: ~100 proposals/month (target)

---

## 🔗 Integration Points with Antigravity

### Frontend → Backend (Form Submission)
Antigravity will POST all 5 steps to:
```
POST /api/ci-kaizen
{
  // Step 1: Registration
  "proposer_name": "...",
  "proposer_emp_code": "...",
  "proposer_position": "...",      // NEW
  "factory": "...",
  "department": "...",
  "region": "...",
  "category": "PRODUCTIVITY",
  "category_label": "3.Tăng Năng suất",
  "topic_group": "PRODUCTIVITY_GROUP",  // NEW
  
  // Step 2: Implementation & Evidence
  "title": "...",
  "before_description": "...",
  "after_solution": "...",
  "pricing_direction": "THOI_GIAN",     // NEW
  "time_before_seconds": 120,            // NEW
  "time_after_seconds": 80,              // NEW
  "efficiency_value_vnd": 500000,        // NEW (if TRI_GIA)
  "before_image_url": "https://...",
  "after_image_url": "https://...",
  "before_video_url": "https://...",     // NEW
  "after_video_url": "https://...",      // NEW
  
  // Step 3: Product Details
  "registration_type": "THI_DUA",
  "product_group": "Quai",               // NEW
  "product_code": "SK-001",              // NEW
  "product_quantity": 500,               // NEW
  "customer_brand": "SK",                // NEW
  
  // Step 4: Approval
  "supervisor_name": "Nguyễn Văn A",    // NEW
  "hr_suggestor_name": "Trần Thị B",    // NEW
  "dept_approval_status": "PENDING",    // NEW (auto-set)
  
  // Step 5: Terms
  "agreed_to_terms": true,               // NEW
  "is_actually_deployed": true,          // NEW (validation)
  "safety_confirmed": true               // NEW (if safety category)
}
```

### Backend → Frontend (Dashboard Data)
Antigravity will GET data for dashboard charts:
```
GET /api/ci-kaizen?topic_group=PRODUCTIVITY_GROUP&month=8&year=2026
GET /api/ci-kaizen/kpi-targets  ← Regional progress for early warning
GET /api/ci-kaizen/alerts?alert_type=DEADLINE  ← Alert counts
```

### Sync Points
1. **Phase 2 Complete** — Antigravity tests form submission
2. **Phase 3 Complete** — Form validation working (no invalid proposals)
3. **Phase 4 Complete** — Scoring appears in dashboard (points visible)
4. **Phase 5 Complete** — Alerts trigger properly in early warning component
5. **Phase 6 Complete** — Awards display in dashboard

---

## 📋 Files to Review

### Requirements & Design
- `requirements.md` — Full requirements (8 sections, 30+ acceptance criteria)
- `tasks.md` — 34 tasks, effort estimates, dependencies
- `AGENT_GAP_ANALYSIS.md` — Field-by-field gap analysis (source of truth)

### Database & ORM
- `web/migrations/0005_ci_kaizen.sql` — Current schema (baseline)
- `web/migrations/0006_ci_kaizen_extended_p0.sql` — To be created (7 P0 columns)
- `web/migrations/0007_ci_kaizen_extended_p1.sql` — To be created (11 P1 columns)
- `backend/prisma/schema.prisma` — To be updated (new models)

### API & Business Logic
- `backend/routes/ci-kaizen.ts` — Main API routes (to be enhanced)
- `backend/services/scoring-engine.ts` — To be created (scoring logic)
- `backend/services/award-engine.ts` — To be created (awards assignment)
- `backend/jobs/alerts.ts` — To be created (daily alert jobs)

### Frontend Reference
- `web/src/modules/ci/KaizenFiveStepSubmitForm.tsx` — Form fields reference
- `web/src/modules/ci/KaizenDashboard.tsx` — Dashboard data needs
- `web/src/modules/ci/KaizenEarlyWarning.tsx` — Alert component needs
- `web/KAIZEN_FIELD_GUIDE.md` — Field documentation

---

## ✅ Definition of Done

All of the following must be true before closing spec:

1. ✅ **Database**: All 18+ columns added, 5 new tables created
2. ✅ **API**: All endpoints return new fields (backward compatible)
3. ✅ **Validation**: 4 pass/fail conditions working
4. ✅ **Scoring**: 5 criteria engine produces correct 100-point totals
5. ✅ **Awards**: Top 11 proposals assigned correctly
6. ✅ **Alerts**: All 5 alert types trigger correctly
7. ✅ **Reports**: Weekly/monthly reports generate data
8. ✅ **Tests**: All unit & integration tests passing
9. ✅ **E2E**: Antigravity form→API→Dashboard flow works end-to-end
10. ✅ **Code**: No TypeScript errors, linting clean, committed to `agent/kiro-backend` branch

---

## 🎯 Success Metrics

After implementation, verify:

| Metric | Target | How to Measure |
|---|---|---|
| **Schema Completeness** | 100% | All 23 fields + 5 tables created |
| **API Coverage** | 100% | All 6 endpoints (3 updated + 3 new) working |
| **Backward Compatibility** | 100% | Old queries still work, old fields present |
| **Scoring Accuracy** | 100% | Total score always = 100 max, round to 1 dp |
| **Award Assignment** | 100% | Top 11 ranked correctly by score DESC, created_at ASC |
| **Alert Triggers** | 100% | All 5 alert types trigger on correct days/conditions |
| **E2E Test Pass Rate** | 100% | Form → API → Dashboard → Scoring → Awards flow |
| **Code Quality** | 100% | 0 TypeScript errors, 0 linting warnings |
| **Test Coverage** | ≥ 80% | Unit + integration tests for all new logic |
| **Performance** | < 500ms | API queries return < 500ms for 1000 proposals |

---

## 📞 Questions? Contact Points

- **Spec Questions** → Review `requirements.md` section by section
- **Task Questions** → Check `tasks.md` for detailed acceptance criteria
- **Gap Analysis Details** → See `AGENT_GAP_ANALYSIS.md` (field-by-field mapping)
- **Integration with FE** → See "Integration Points with Antigravity" section above
- **Business Rules** → Refer to "Key Business Rules" section or `XÂY_DỰNG_VĂN_HÓA_CẢI_TIẾN.PDF`

---

**Prepared by**: Kiro Backend Agent  
**Date**: 2026-08-24  
**Status**: Ready for Implementation Sprint  
**Next**: Begin Phase 1 (Database Migrations)

