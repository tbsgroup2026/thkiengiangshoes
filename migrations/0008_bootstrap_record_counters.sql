-- Migration 0008: Create Record Counters Table & One-Time Seeding from Historical Data
CREATE TABLE IF NOT EXISTS record_counters (
    scope_key TEXT PRIMARY KEY,
    last_seq INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ONE-TIME SEEDING FROM EXISTING HISTORICAL KAIZEN RECORDS
INSERT INTO record_counters (scope_key, last_seq)
SELECT 
    SUBSTR(code, 1, LENGTH(code) - 5) as scope_key,
    MAX(CAST(SUBSTR(code, LENGTH(code) - 3) AS INTEGER)) as last_seq
FROM ci_kaizen_proposals
WHERE code LIKE 'KZ-%' AND LENGTH(code) >= 15
GROUP BY scope_key
ON CONFLICT(scope_key) DO UPDATE SET last_seq = MAX(last_seq, excluded.last_seq);
