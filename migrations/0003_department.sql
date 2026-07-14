-- ============================================================
-- One-time migration — run exactly once against the live masterclass-db.
-- Adds a free-text department column to users (for staff filtering).
-- ============================================================

ALTER TABLE users ADD COLUMN department TEXT DEFAULT '';
