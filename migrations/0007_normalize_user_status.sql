-- Migration 0007: Normalize User Status to ACTIVE
UPDATE users 
SET status = 'ACTIVE' 
WHERE status IS NULL OR status = '' OR status = '1' OR status = 'true';
