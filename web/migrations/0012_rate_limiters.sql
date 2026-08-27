-- Migration 0012: D1 Atomic Rate Limiters Table
CREATE TABLE IF NOT EXISTS rate_limiters (
    key TEXT PRIMARY KEY,
    request_count INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
