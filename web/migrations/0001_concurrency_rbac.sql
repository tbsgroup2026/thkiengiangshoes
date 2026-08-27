-- ============================================================
-- MIGRATION 0001: CONCURRENCY HARDENING, RBAC & AUDIT INFRASTRUCTURE
-- ============================================================

-- 1. ADD VERSION COLUMN FOR OPTIMISTIC LOCKING ON EXISTING TABLES
ALTER TABLE room_bookings ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE user_profile ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE jobs ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE job_applications ADD COLUMN version INTEGER DEFAULT 1;

-- 2. CREATE UNIQUE INDEX FOR DOUBLE BOOKING PREVENTION ON ROOMS
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_booking_unique ON room_bookings(room_id, booking_date, time_slot) WHERE status != 'CANCELLED';

-- 3. IDEMPOTENCY LOGS TABLE FOR DUPLICATE SUBMIT PREVENTION
CREATE TABLE IF NOT EXISTS idempotency_logs (
    key TEXT PRIMARY KEY,
    endpoint TEXT NOT NULL,
    response_json TEXT NOT NULL,
    status_code INTEGER DEFAULT 200,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. AUDIT LOGS TABLE FOR CENTRALIZED CHANGE TRACKING
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    emp_code TEXT,
    role_code TEXT,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    record_id TEXT,
    data_before TEXT,
    data_after TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
