-- Migration 0009: Performance Indexes for Sorting and Filtering
CREATE INDEX IF NOT EXISTS idx_kaizen_created_id ON ci_kaizen_proposals(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_kaizen_substatus ON ci_kaizen_proposals(sub_status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_id ON maintenance_tickets(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_qc_created_id ON qc_defect_reports(created_at DESC, id DESC);
