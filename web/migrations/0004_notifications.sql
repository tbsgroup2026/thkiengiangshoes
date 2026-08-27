-- ============================================================
-- MIGRATION 0004: CENTRALIZED NOTIFICATIONS EXTENSION
-- ============================================================

-- EXTEND EXISTING NOTIFICATIONS TABLE WITH INDEPENDENT ALTER STATEMENTS
ALTER TABLE notifications ADD COLUMN module TEXT;
ALTER TABLE notifications ADD COLUMN record_id TEXT;
