-- ============================================================
-- One-time migration — run exactly once against the live masterclass-db.
-- Adds user_code + status to the existing `users` table and backfills
-- a unique code for every row that doesn't have one yet.
-- ============================================================

ALTER TABLE users ADD COLUMN user_code TEXT;
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';

UPDATE users
SET user_code = 'MC-' || strftime('%d%m%Y', created_at) || '-' || substr('0000' || rowid, -4, 4)
WHERE user_code IS NULL;
