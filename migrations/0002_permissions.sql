-- ============================================================
-- One-time migration — run exactly once against the live masterclass-db.
-- Adds a permissions column (JSON array of permission keys) to users.
-- ============================================================

ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[]';
