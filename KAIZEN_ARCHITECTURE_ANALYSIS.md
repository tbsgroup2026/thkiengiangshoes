# KAIZEN ARCHITECTURE ANALYSIS – KIÊN GIANG SHOES

## Analysis Summary

This document details the architectural design and database integration model for the **TBS Kiên Giang Shoes Kaizen Portal**.

### 1. Data Integrity & Shared Source of Truth

- **Single Database Binding**: The portal connects directly to Cloudflare D1 database ID `ae3a7efd-ff5d-45c2-8c49-78d1518e3aa1`.
- **No Duplicate Tables**: No separate or duplicate database is created (`KG_KAIZEN_DB` is avoided).
- **Cross-Platform Synchronization**: Submissions created via `tbskiengiangshoeskaizen.workers.dev` are immediately stored in the primary `ci_kaizen_proposals` table, making them instantly visible in central analytics while remaining scoped locally.

### 2. Kiên Giang Scoping Strategy

- **Organizational Tree Mapping**: Restricted to Kiên Giang factories:
  - `Kiên Giang 1` (Xưởng Đế, Xưởng Mũi, Xưởng Gò)
  - `Kiên Giang 2` (Xưởng Mũi, Xưởng Gò)
  - `Kiên Giang 3` (Xưởng Tổng Hợp)
- **API Level Filtering**: Worker API `/api/ci-kaizen` enforces filter criteria:
  `WHERE plant_code IN ('KG1', 'KG2', 'KG3') OR factory LIKE '%Kiên Giang%' OR factory LIKE '%KG%'`

### 3. Record Code Generation Format

Record codes generated for Kiên Giang follow the unified format:
- `KZ-{YYYY}-KG1-{WCODE}-{SEQ}` (e.g. `KZ-2026-KG1-DE-0001`)
- Single atomic counter managed via `record_counters` table in D1.
