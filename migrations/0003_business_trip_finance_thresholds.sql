-- ============================================================
-- MIGRATION 0003: BUSINESS TRIPS EXTENSION, FINANCE ADVANCES & THRESHOLDS
-- ============================================================

-- 1. EXTEND EXISTING BUSINESS_TRIPS TABLE WITH INDEPENDENT ALTER STATEMENTS
ALTER TABLE business_trips ADD COLUMN estimated_cost REAL DEFAULT 0.0;
ALTER TABLE business_trips ADD COLUMN approved_level TEXT;
ALTER TABLE business_trips ADD COLUMN l1_approved_by TEXT;
ALTER TABLE business_trips ADD COLUMN l1_approved_at DATETIME;
ALTER TABLE business_trips ADD COLUMN l2_approved_by TEXT;
ALTER TABLE business_trips ADD COLUMN l2_approved_at DATETIME;
ALTER TABLE business_trips ADD COLUMN rejection_reason TEXT;
ALTER TABLE business_trips ADD COLUMN version INTEGER DEFAULT 1;

-- 2. CREATE FINANCE ADVANCES TABLE
CREATE TABLE IF NOT EXISTS finance_advances (
    id TEXT PRIMARY KEY,
    emp_code TEXT NOT NULL,
    amount REAL NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, PENDING_L1, PENDING_L2, APPROVED, REJECTED
    approved_level TEXT,
    l1_approved_by TEXT,
    l1_approved_at DATETIME,
    l2_approved_by TEXT,
    l2_approved_at DATETIME,
    rejection_reason TEXT,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE APPROVAL THRESHOLDS TABLE FOR CONFIGURABLE APPROVAL AMOUNTS
CREATE TABLE IF NOT EXISTS approval_thresholds (
    module TEXT PRIMARY KEY,
    threshold_amount REAL DEFAULT 5000000.0,
    updated_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SEED INITIAL THRESHOLDS (5,000,000 VND FOR BUSINESS TRIPS AND FINANCE ADVANCES)
INSERT OR REPLACE INTO approval_thresholds (module, threshold_amount, updated_by) VALUES
('business_trip', 5000000.0, 'ADMIN-2026'),
('finance_advance', 5000000.0, 'ADMIN-2026');
