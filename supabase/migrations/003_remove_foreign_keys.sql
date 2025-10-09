-- Remove unnecessary foreign key constraints from draft_reports
-- We only need user_id for data isolation, not facility_id or participant_id

-- Drop the foreign key constraints
ALTER TABLE draft_reports
  DROP CONSTRAINT IF EXISTS draft_reports_facility_id_fkey;

ALTER TABLE draft_reports
  DROP CONSTRAINT IF EXISTS draft_reports_participant_id_fkey;

-- The columns remain as UUID fields, just without foreign key constraints
-- This allows drafts to be saved without requiring valid facility/participant records

-- Verify the constraints are removed
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'draft_reports'
  AND con.contype = 'f';  -- 'f' means foreign key

-- This should return only the user_id foreign key
