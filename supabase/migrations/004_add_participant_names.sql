-- Add participant name columns to incidents table
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS participant_first_name TEXT,
ADD COLUMN IF NOT EXISTS participant_last_name TEXT;

-- Add index for faster participant name searches
CREATE INDEX IF NOT EXISTS idx_incidents_participant_names
ON incidents(participant_first_name, participant_last_name);
