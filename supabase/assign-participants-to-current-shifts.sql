-- First, let's check what shifts exist
SELECT
  s.id,
  s.status,
  s.start_time,
  u.name as staff_name,
  u.email,
  r.name as role_name,
  r.level as role_level
FROM shifts s
JOIN users u ON s.staff_id = u.id
JOIN roles r ON u.role_id = r.id
ORDER BY s.start_time DESC
LIMIT 10;

-- Check if participants exist
SELECT id, name FROM participants
WHERE name IN ('Michael Brown', 'Emma Wilson', 'Lisa Thompson');

-- If you have active shifts, this will assign the participants
-- If not, we need to create a shift first
INSERT INTO shift_participants (shift_id, participant_id)
SELECT
  s.id as shift_id,
  p.id as participant_id
FROM shifts s
CROSS JOIN participants p
WHERE s.status = 'active'  -- Only active shifts
  AND p.name IN ('Michael Brown', 'Emma Wilson', 'Lisa Thompson')
ON CONFLICT (shift_id, participant_id) DO NOTHING;

-- Verify assignments
SELECT
  COUNT(*) as assignment_count,
  'Total assignments created' as description
FROM shift_participants;
