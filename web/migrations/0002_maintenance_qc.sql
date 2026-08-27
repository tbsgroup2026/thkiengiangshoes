-- ============================================================
-- MIGRATION 0002: MAINTENANCE TICKETS EXTENSION & QC MODULE TABLES
-- ============================================================

-- 1. EXTEND EXISTING MAINTENANCE_TICKETS TABLE WITH INDEPENDENT ALTER STATEMENTS
ALTER TABLE maintenance_tickets ADD COLUMN created_by TEXT;
ALTER TABLE maintenance_tickets ADD COLUMN assigned_to TEXT;
ALTER TABLE maintenance_tickets ADD COLUMN resolved_note TEXT;
ALTER TABLE maintenance_tickets ADD COLUMN resolved_at DATETIME;
ALTER TABLE maintenance_tickets ADD COLUMN reopen_reason TEXT;
ALTER TABLE maintenance_tickets ADD COLUMN source_module TEXT;
ALTER TABLE maintenance_tickets ADD COLUMN source_record_id TEXT;
ALTER TABLE maintenance_tickets ADD COLUMN version INTEGER DEFAULT 1;

-- 2. CREATE QC DEFECT REPORTS TABLE
CREATE TABLE IF NOT EXISTS qc_defect_reports (
    id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'REPORTED', -- REPORTED, INVESTIGATING, ACTION_REQUIRED, RESOLVED, VERIFIED
    created_by TEXT NOT NULL,
    description TEXT NOT NULL,
    action_required_note TEXT,
    resolved_at DATETIME,
    verified_by TEXT,
    verified_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE QC KAIZEN SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS qc_kaizen_submissions (
    id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED
    submitted_by TEXT NOT NULL,
    description TEXT NOT NULL,
    review_note TEXT,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    implemented_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
