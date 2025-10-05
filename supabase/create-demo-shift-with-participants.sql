-- ============================================================================
-- CREATE DEMO SHIFT AT PARRAMATTA WITH 3 PARTICIPANTS
-- This creates shifts for all support workers and assigns the 3 participants
-- ============================================================================

-- Step 1: Find the Parramatta facility (or House 3 which is the main facility)
-- We'll use the facility that has our 3 demo participants

DO $$
DECLARE
  v_facility_id UUID;
  v_shift_id UUID;
  v_support_worker_id UUID;
BEGIN
  -- Get the facility ID where our participants are located
  SELECT DISTINCT facility_id INTO v_facility_id
  FROM participants
  WHERE name IN ('Michael Brown', 'Emma Wilson', 'Lisa Thompson')
  LIMIT 1;

  -- If no facility found, raise an error
  IF v_facility_id IS NULL THEN
    RAISE EXCEPTION 'Could not find facility for participants';
  END IF;

  -- Create active shifts for ALL support workers (role level 4)
  -- Set start time to today at 7:00 AM, end time at 3:00 PM
  FOR v_support_worker_id IN
    SELECT u.id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.level = 4  -- Support Worker role
  LOOP
    -- Create a shift for this support worker
    INSERT INTO shifts (
      staff_id,
      facility_id,
      start_time,
      end_time,
      status,
      handover_notes
    )
    VALUES (
      v_support_worker_id,
      v_facility_id,
      CURRENT_DATE + INTERVAL '7 hours',  -- Today at 7:00 AM
      CURRENT_DATE + INTERVAL '15 hours', -- Today at 3:00 PM
      'active',
      'Morning shift at Parramatta - 3 participants assigned'
    )
    RETURNING id INTO v_shift_id;

    -- Assign the 3 participants to this shift
    INSERT INTO shift_participants (shift_id, participant_id)
    SELECT
      v_shift_id,
      p.id
    FROM participants p
    WHERE p.name IN ('Michael Brown', 'Emma Wilson', 'Lisa Thompson')
    ON CONFLICT (shift_id, participant_id) DO NOTHING;

    RAISE NOTICE 'Created shift % for support worker %', v_shift_id, v_support_worker_id;
  END LOOP;

END $$;

-- Verify the shifts were created
SELECT
  s.id as shift_id,
  u.name as staff_name,
  u.email as staff_email,
  r.name as role_name,
  f.name as facility_name,
  s.start_time,
  s.end_time,
  s.status,
  COUNT(sp.participant_id) as participants_assigned
FROM shifts s
JOIN users u ON s.staff_id = u.id
JOIN roles r ON u.role_id = r.id
JOIN facilities f ON s.facility_id = f.id
LEFT JOIN shift_participants sp ON s.id = sp.shift_id
WHERE s.status = 'active'
GROUP BY s.id, u.name, u.email, r.name, f.name, s.start_time, s.end_time, s.status
ORDER BY u.name;

-- Verify participant assignments
SELECT
  u.name as staff_name,
  u.email as staff_email,
  p.name as participant_name,
  s.start_time,
  s.status
FROM shift_participants sp
JOIN shifts s ON sp.shift_id = s.id
JOIN users u ON s.staff_id = u.id
JOIN participants p ON sp.participant_id = p.id
WHERE s.status = 'active'
ORDER BY u.name, p.name;

-- Show summary
SELECT
  COUNT(DISTINCT s.id) as total_shifts_created,
  COUNT(DISTINCT sp.participant_id) as unique_participants,
  COUNT(sp.id) as total_assignments
FROM shifts s
LEFT JOIN shift_participants sp ON s.id = sp.shift_id
WHERE s.status = 'active';
