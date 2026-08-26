-- Migration 0010: Add organizational hierarchy columns and VTCV to users table
ALTER TABLE users ADD COLUMN factory_id TEXT;
ALTER TABLE users ADD COLUMN workshop_id TEXT;
ALTER TABLE users ADD COLUMN line_id TEXT;
ALTER TABLE users ADD COLUMN chuyen_id TEXT;
ALTER TABLE users ADD COLUMN to_id TEXT;
ALTER TABLE users ADD COLUMN vtcv TEXT;
