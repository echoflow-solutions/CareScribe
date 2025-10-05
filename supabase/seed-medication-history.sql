-- Seed Medication Administration History
-- Populates historical medication administrations from previous shifts
-- Current date: October 6, 2025 00:23 (Night shift)
-- Shifts: Day (7AM-3PM), Evening (3PM-11PM), Night (11PM-7AM)

-- First, let's get the participant IDs and medication IDs we'll need
-- We'll use the existing participants: James Mitchell, Sarah Chen, Michael Brown, Emma Wilson, David Lee, Lisa Thompson

-- =============================================================================
-- NIGHT SHIFT: October 5-6, 2025 (11:00 PM - 7:00 AM) - PREVIOUS NIGHT
-- Staff: Tom Anderson (night shift worker)
-- =============================================================================

-- Get Tom Anderson's user ID (we'll insert if doesn't exist)
INSERT INTO users (id, email, name, role_id, status, created_at)
SELECT
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'tom.anderson@carescribe.com',
  'Tom Anderson',
  (SELECT id FROM roles WHERE name = 'Support Worker' LIMIT 1),
  'active',
  '2024-01-15 08:00:00+00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tom.anderson@carescribe.com');

-- Night medications (October 6, 2025 at 12:00 AM - midnight dose)
INSERT INTO medication_administration_logs (
  id,
  participant_id,
  medication_id,
  administered_by,
  administered_at,
  dosage,
  notes,
  created_at
) VALUES
-- James Mitchell - Night medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1) AND name = 'Melatonin' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440001',
  '2025-10-06 00:00:00+00',
  '3mg',
  'Given before bed to help with sleep',
  '2025-10-06 00:00:00+00'
),
-- Sarah Chen - Night medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1) AND name = 'Risperidone' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440001',
  '2025-10-06 00:00:00+00',
  '2mg',
  'Night dose administered as scheduled',
  '2025-10-06 00:00:00+00'
),
-- Michael Brown - Night medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1) AND name = 'Melatonin' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440001',
  '2025-10-06 00:00:00+00',
  '3mg',
  'Sleep support medication given',
  '2025-10-06 00:00:00+00'
);

-- =============================================================================
-- EVENING SHIFT: October 5, 2025 (3:00 PM - 11:00 PM)
-- Staff: Emily Chen (evening shift worker)
-- =============================================================================

INSERT INTO users (id, email, name, role_id, status, created_at)
SELECT
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'emily.chen@carescribe.com',
  'Emily Chen',
  (SELECT id FROM roles WHERE name = 'Support Worker' LIMIT 1),
  'active',
  '2024-02-10 08:00:00+00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'emily.chen@carescribe.com');

-- Evening medications (October 5, 2025 at 6:00 PM)
INSERT INTO medication_administration_logs (
  id,
  participant_id,
  medication_id,
  administered_by,
  administered_at,
  dosage,
  notes,
  created_at
) VALUES
-- James Mitchell - Evening medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1) AND name = 'Risperidone' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  '2025-10-05 18:00:00+00',
  '2mg',
  'Evening dose given with dinner',
  '2025-10-05 18:00:00+00'
),
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1) AND name = 'Sertraline' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  '2025-10-05 18:00:00+00',
  '50mg',
  'Given after evening meal',
  '2025-10-05 18:00:00+00'
),
-- Sarah Chen - Evening medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1) AND name = 'Sertraline' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  '2025-10-05 18:00:00+00',
  '50mg',
  'Administered as scheduled',
  '2025-10-05 18:00:00+00'
),
-- Michael Brown - Evening medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1) AND name = 'Risperidone' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  '2025-10-05 18:00:00+00',
  '2mg',
  'Given with evening snack',
  '2025-10-05 18:00:00+00'
),
-- Emma Wilson - Evening medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Emma Wilson' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Emma Wilson' LIMIT 1) LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  '2025-10-05 18:00:00+00',
  '50mg',
  'Evening medication administered',
  '2025-10-05 18:00:00+00'
);

-- =============================================================================
-- DAY SHIFT: October 5, 2025 (7:00 AM - 3:00 PM)
-- Staff: Bernard Adjei (current user)
-- =============================================================================

-- Afternoon medications (October 5, 2025 at 12:00 PM)
INSERT INTO medication_administration_logs (
  id,
  participant_id,
  medication_id,
  administered_by,
  administered_at,
  dosage,
  notes,
  created_at
) VALUES
-- James Mitchell - Afternoon medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1) LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 12:00:00+00',
  '2mg',
  'Given with lunch',
  '2025-10-05 12:00:00+00'
),
-- Sarah Chen - Afternoon medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1) LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 12:00:00+00',
  '2mg',
  'Lunch time dose administered',
  '2025-10-05 12:00:00+00'
),
-- Michael Brown - Afternoon medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1) LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 12:00:00+00',
  '500mg',
  'Midday medication given',
  '2025-10-05 12:00:00+00'
);

-- Morning medications (October 5, 2025 at 8:00 AM)
INSERT INTO medication_administration_logs (
  id,
  participant_id,
  medication_id,
  administered_by,
  administered_at,
  dosage,
  notes,
  created_at
) VALUES
-- James Mitchell - Morning medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1) AND name = 'Risperidone' LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 08:00:00+00',
  '2mg',
  'Given with breakfast',
  '2025-10-05 08:00:00+00'
),
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1) AND name = 'Sertraline' LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 08:00:00+00',
  '50mg',
  'Morning dose with food',
  '2025-10-05 08:00:00+00'
),
-- Sarah Chen - Morning medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1) AND name = 'Risperidone' LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 08:00:00+00',
  '2mg',
  'Administered at breakfast',
  '2025-10-05 08:00:00+00'
),
-- Michael Brown - Morning medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Michael Brown' LIMIT 1) AND name = 'Risperidone' LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 08:00:00+00',
  '2mg',
  'Given with breakfast',
  '2025-10-05 08:00:00+00'
),
-- Emma Wilson - Morning medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Emma Wilson' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Emma Wilson' LIMIT 1) LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 08:00:00+00',
  '50mg',
  'Morning medication given',
  '2025-10-05 08:00:00+00'
),
-- David Lee - Morning medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'David Lee' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'David Lee' LIMIT 1) LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 08:00:00+00',
  '2mg',
  'Breakfast time dose',
  '2025-10-05 08:00:00+00'
),
-- Lisa Thompson - Morning medications
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Lisa Thompson' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Lisa Thompson' LIMIT 1) LIMIT 1),
  (SELECT id FROM users WHERE email = 'bernard@carescribe.com' LIMIT 1),
  '2025-10-05 08:00:00+00',
  '2mg',
  'Morning dose administered',
  '2025-10-05 08:00:00+00'
);

-- =============================================================================
-- PREVIOUS NIGHT SHIFT: October 4-5, 2025 (11:00 PM - 7:00 AM)
-- Staff: Tom Anderson
-- =============================================================================

INSERT INTO medication_administration_logs (
  id,
  participant_id,
  medication_id,
  administered_by,
  administered_at,
  dosage,
  notes,
  created_at
) VALUES
-- Night medications from Oct 4-5
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'James Mitchell' LIMIT 1) AND name = 'Melatonin' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440001',
  '2025-10-05 00:00:00+00',
  '3mg',
  'Sleep medication given',
  '2025-10-05 00:00:00+00'
),
(
  gen_random_uuid(),
  (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1),
  (SELECT id FROM participant_medications WHERE participant_id = (SELECT id FROM participants WHERE name = 'Sarah Chen' LIMIT 1) AND name = 'Melatonin' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440001',
  '2025-10-05 00:00:00+00',
  '3mg',
  'Bedtime dose',
  '2025-10-05 00:00:00+00'
);

-- Comment for reference
COMMENT ON TABLE medication_administration_logs IS 'Historical record of all medication administrations with staff member tracking';
