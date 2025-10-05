-- Create shift_participants junction table
CREATE TABLE IF NOT EXISTS shift_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shift_id, participant_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shift_participants_shift ON shift_participants(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_participants_participant ON shift_participants(participant_id);

-- Get the participant IDs for our three shift participants
-- We'll assign Michael Brown, Emma Wilson, and Lisa Thompson to ALL active support worker shifts

-- First, let's assign them to any active or scheduled shifts for support workers (role level 4)
WITH shift_participants_to_assign AS (
  SELECT
    s.id as shift_id,
    p.id as participant_id
  FROM shifts s
  CROSS JOIN participants p
  JOIN users u ON s.staff_id = u.id
  JOIN roles r ON u.role_id = r.id
  WHERE r.level = 4  -- Support Worker role
    AND s.status IN ('active', 'scheduled')
    AND p.name IN ('Michael Brown', 'Emma Wilson', 'Lisa Thompson')
)
INSERT INTO shift_participants (shift_id, participant_id)
SELECT shift_id, participant_id FROM shift_participants_to_assign
ON CONFLICT (shift_id, participant_id) DO NOTHING;

-- Verify the assignments
SELECT
  p.name AS participant_name,
  u.name AS staff_name,
  s.status AS shift_status,
  s.start_time
FROM shift_participants sp
JOIN participants p ON sp.participant_id = p.id
JOIN shifts s ON sp.shift_id = s.id
JOIN users u ON s.staff_id = u.id
ORDER BY u.name, p.name;
