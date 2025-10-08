-- ══════════════════════════════════════════════════════════════════════════════
-- COMPREHENSIVE HANDOVER COMMUNICATION SYSTEM
-- Replaces paper book with digital handover notes that prevent information loss
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop existing tables if they exist
DROP TABLE IF EXISTS handover_note_reads CASCADE;
DROP TABLE IF EXISTS handover_notes CASCADE;

-- Enhanced Handover Notes Table
CREATE TABLE handover_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id),
  shift_id UUID REFERENCES shifts(id),

  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general', -- general, participant, medication, maintenance, incident, follow-up

  -- Priority/Urgency
  priority VARCHAR(20) NOT NULL DEFAULT 'info', -- urgent, action-required, info, fyi
  action_required BOOLEAN DEFAULT false,
  action_deadline TIMESTAMP WITH TIME ZONE, -- When action must be completed by

  -- Targeting
  target_shift VARCHAR(50), -- 'next-shift', 'morning', 'afternoon', 'night', 'all', specific date
  target_date DATE, -- Specific date this note is relevant to
  relevant_until DATE, -- Note expires after this date

  -- Participants/Staff related
  participant_ids UUID[], -- Array of participant IDs this note relates to
  mentioned_staff_ids UUID[], -- Staff members mentioned in the note

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, resolved, archived
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT
);

-- Handover Note Reads (tracking who has acknowledged reading notes)
CREATE TABLE handover_note_reads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  handover_note_id UUID REFERENCES handover_notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  shift_id UUID REFERENCES shifts(id), -- Which shift they were on when they read it
  read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  acknowledged BOOLEAN DEFAULT false, -- Did they explicitly acknowledge (for urgent notes)
  acknowledged_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(handover_note_id, user_id, shift_id)
);

-- Indexes for performance
CREATE INDEX idx_handover_notes_facility ON handover_notes(facility_id);
CREATE INDEX idx_handover_notes_shift ON handover_notes(shift_id);
CREATE INDEX idx_handover_notes_priority ON handover_notes(priority);
CREATE INDEX idx_handover_notes_status ON handover_notes(status);
CREATE INDEX idx_handover_notes_target_date ON handover_notes(target_date);
CREATE INDEX idx_handover_notes_relevant_until ON handover_notes(relevant_until);
CREATE INDEX idx_handover_notes_created_at ON handover_notes(created_at DESC);
CREATE INDEX idx_handover_note_reads_user ON handover_note_reads(user_id);
CREATE INDEX idx_handover_note_reads_note ON handover_note_reads(handover_note_id);

-- Sample handover data spanning multiple days (demonstrating the problem this solves)
-- This shows notes from different days that all need to be read by current shift

-- Get facility and staff IDs (we'll use variables in actual implementation)
DO $$
DECLARE
  v_facility_id UUID;
  v_staff_id UUID;
  v_shift_id UUID;
  v_participant_id1 UUID;
  v_participant_id2 UUID;
  v_participant_id3 UUID;
BEGIN
  -- Get first facility
  SELECT id INTO v_facility_id FROM facilities LIMIT 1;

  -- Get Bernard's staff ID
  SELECT id INTO v_staff_id FROM staff WHERE email = 'bernard.adjei@maxlifecare.com.au' LIMIT 1;

  -- Get some participants
  SELECT id INTO v_participant_id1 FROM participants WHERE name = 'Lisa Thompson' LIMIT 1;
  SELECT id INTO v_participant_id2 FROM participants WHERE name = 'Michael Brown' LIMIT 1;
  SELECT id INTO v_participant_id3 FROM participants WHERE name = 'Emma Wilson' LIMIT 1;

  -- Get a recent shift
  SELECT id INTO v_shift_id FROM shifts WHERE staff_id = v_staff_id ORDER BY shift_date DESC LIMIT 1;

  -- Insert sample handover notes from different days

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- TUESDAY AFTERNOON (4 days ago) - URGENT note that gets missed
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    action_required, action_deadline, target_shift, target_date, relevant_until,
    participant_ids, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    '⚠️ URGENT: Lisa Thompson - Medical Appointment Saturday',
    'Lisa Thompson has a specialist appointment on Saturday morning at 9:00 AM at Westmead Hospital.

    ACTION REQUIRED:
    - Transport MUST be booked by Friday
    - Bring her medication list and NDIS plan
    - She needs to fast from midnight (no breakfast)
    - Allow 45 minutes travel time

    Contact Dr. Sarah Chen''s office if any questions: 02 9845 1234

    ⚠️ This appointment was rescheduled from 3 months ago - DO NOT MISS IT!',
    'participant',
    'urgent',
    true,
    (CURRENT_DATE + INTERVAL '2 days')::TIMESTAMP, -- Saturday
    'morning',
    (CURRENT_DATE + INTERVAL '2 days')::DATE,
    (CURRENT_DATE + INTERVAL '3 days')::DATE,
    ARRAY[v_participant_id1],
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '6 hours'),
    'active'
  );

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- WEDNESDAY MORNING (3 days ago) - Maintenance issue
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    action_required, target_shift, relevant_until, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    '🔧 ACTION REQUIRED: Bathroom Leak in West Wing',
    'Bathroom in west wing (near Michael''s room) has a slow leak under the sink.

    Plumber is scheduled for Friday afternoon but may come earlier if available.

    ACTION NEEDED:
    - Place towels under sink daily
    - Check for water damage each shift
    - Call Max (plumber) if leak gets worse: 0412 345 678

    Maintenance ticket #MT-2547',
    'maintenance',
    'action-required',
    true,
    'all',
    (CURRENT_DATE + INTERVAL '4 days')::DATE,
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '2 hours'),
    'active'
  );

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- WEDNESDAY NIGHT (3 days ago) - Medication change
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    action_required, target_shift, relevant_until, participant_ids, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    '💊 Michael Brown - New Medication Started',
    'Dr. Wilson has prescribed new anxiety medication for Michael Brown starting Thursday.

    Medication: Sertraline 50mg
    Timing: Morning with breakfast
    Side effects to watch: Nausea, drowsiness, dry mouth

    Please monitor and document:
    - Any side effects in first week
    - Mood changes
    - Sleep patterns

    This is in addition to his regular meds. Webster pack has been updated.',
    'medication',
    'action-required',
    true,
    'morning',
    (CURRENT_DATE + INTERVAL '7 days')::DATE,
    ARRAY[v_participant_id2],
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '2 hours'),
    'active'
  );

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- THURSDAY AFTERNOON (2 days ago) - Behavioral pattern
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    target_shift, relevant_until, participant_ids, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    'ℹ️ Emma Wilson - Early Morning Routine Working Well',
    'Update on Emma: The new early morning routine is showing great results!

    She''s been waking naturally around 5:30 AM and really enjoying the quiet time before breakfast.

    Continue:
    - Light breakfast at 6:00 AM (she likes toast with honey)
    - Morning walk in garden at 6:30 AM
    - Regular breakfast with group at 8:00 AM

    This has reduced her afternoon agitation significantly. Please maintain this routine.',
    'participant',
    'info',
    'morning',
    (CURRENT_DATE + INTERVAL '14 days')::DATE,
    ARRAY[v_participant_id3],
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '4 hours'),
    'active'
  );

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- THURSDAY NIGHT (2 days ago) - Incident follow-up
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    action_required, target_shift, target_date, relevant_until,
    participant_ids, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    '📋 FOLLOW-UP: Lisa Thompson Incident from Tuesday',
    'Following up on Tuesday''s incident where Lisa became upset about noise during quiet time.

    Implemented changes:
    - Moved her quiet time to the sunroom (quieter)
    - Reduced group activities in common room between 2-4 PM
    - Lisa responded very positively

    FRIDAY FOLLOW-UP REQUIRED:
    - Check in with Lisa about the new arrangement
    - Document if she seems more relaxed during quiet time
    - Report back to team leader by Friday evening

    Clinical manager wants update for Monday meeting.',
    'follow-up',
    'action-required',
    true,
    'afternoon',
    (CURRENT_DATE + INTERVAL '1 day')::DATE,
    (CURRENT_DATE + INTERVAL '2 days')::DATE,
    ARRAY[v_participant_id1],
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '3 hours'),
    'active'
  );

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- FRIDAY MORNING (1 day ago) - General house update
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    target_shift, relevant_until, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    '🏠 Weekend Activity Plan',
    'Weekend activities planned:

    SATURDAY:
    - 10:00 AM: Trip to local markets (weather permitting)
    - 2:00 PM: Movie afternoon (participants chose "The Lion King")
    - 5:00 PM: BBQ dinner if weather is nice

    SUNDAY:
    - 9:00 AM: Gardening club for those interested
    - 11:00 AM: Family visits (3 families expected)
    - 3:00 PM: Arts and crafts session

    Shopping list for BBQ is in kitchen. Markets trip requires 2 staff minimum.',
    'general',
    'info',
    'all',
    (CURRENT_DATE + INTERVAL '3 days')::DATE,
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '3 hours'),
    'active'
  );

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- FRIDAY AFTERNOON (yesterday) - Dietary update
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    target_shift, relevant_until, participant_ids, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    '🍽️ Michael Brown - Updated Dietary Requirements',
    'Michael''s dietician has updated his meal plan due to cholesterol concerns.

    NEW GUIDELINES (starting this weekend):
    - Reduce red meat to once per week
    - More fish and chicken
    - Low-fat dairy products
    - More vegetables and whole grains
    - Limit fried foods

    Kitchen has been informed. Updated meal plan is posted in kitchen.

    FYI: Michael is actually excited about trying new healthy recipes!',
    'participant',
    'info',
    'all',
    (CURRENT_DATE + INTERVAL '30 days')::DATE,
    ARRAY[v_participant_id2],
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour'),
    'active'
  );

  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -- FRIDAY NIGHT (last night) - Immediate handover
  -- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    target_shift, target_date, relevant_until, created_by, created_at, status
  ) VALUES (
    v_facility_id, v_shift_id,
    '🌙 Quiet Night - All Participants Settled',
    'Friday night shift report:

    OVERALL: Very quiet night, no incidents.

    ALL PARTICIPANTS:
    - Everyone sleeping soundly by 11:00 PM
    - All medications administered on time
    - No emergency calls
    - House temperature comfortable

    NOTES FOR SATURDAY MORNING:
    - Coffee machine is low on beans (enough for tomorrow but order needed)
    - Bread delivery arrives at 7:00 AM
    - Emma will be up early as usual - remember her toast!
    - Lisa''s transport for hospital appointment needs confirmation

    Have a great Saturday!',
    'general',
    'info',
    'morning',
    CURRENT_DATE::DATE,
    (CURRENT_DATE + INTERVAL '1 day')::DATE,
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    'active'
  );

  -- Add one resolved example to show the system working
  INSERT INTO handover_notes (
    facility_id, shift_id, title, content, category, priority,
    action_required, target_shift, relevant_until, participant_ids,
    created_by, created_at, status, resolved_at, resolved_by, resolution_notes
  ) VALUES (
    v_facility_id, v_shift_id,
    '✅ RESOLVED: Washing Machine Repair',
    'Washing machine in laundry was making loud noise.

    Technician visited Wednesday afternoon.
    Replaced belt and bearings.
    Machine working perfectly now.

    Invoice sent to accounts.',
    'maintenance',
    'action-required',
    false,
    'all',
    (CURRENT_DATE - INTERVAL '1 day')::DATE,
    ARRAY[v_participant_id1],
    v_staff_id,
    (CURRENT_TIMESTAMP - INTERVAL '5 days'),
    'resolved',
    (CURRENT_TIMESTAMP - INTERVAL '3 days'),
    v_staff_id,
    'Technician confirmed machine is working perfectly. Tested with full load. No issues.'
  );

END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- VIEWS FOR EASY QUERYING
-- ══════════════════════════════════════════════════════════════════════════════

-- View for unread urgent handover notes for a staff member
CREATE OR REPLACE VIEW unread_urgent_handovers AS
SELECT
  hn.*,
  f.name as facility_name,
  u.name as created_by_name,
  CASE
    WHEN hnr.id IS NULL THEN true
    ELSE false
  END as is_unread
FROM handover_notes hn
LEFT JOIN facilities f ON hn.facility_id = f.id
LEFT JOIN users u ON hn.created_by = u.id
LEFT JOIN handover_note_reads hnr ON hn.id = hnr.handover_note_id
WHERE hn.status = 'active'
  AND hn.priority IN ('urgent', 'action-required')
  AND (hn.relevant_until IS NULL OR hn.relevant_until >= CURRENT_DATE);

COMMENT ON TABLE handover_notes IS 'Digital replacement for paper handover book. Prevents information loss when staff don''t read all previous pages.';
COMMENT ON TABLE handover_note_reads IS 'Tracks which staff have read which handover notes, ensuring accountability.';
COMMENT ON COLUMN handover_notes.priority IS 'urgent = Must read immediately, action-required = Need to do something, info = Good to know, fyi = Optional reading';
COMMENT ON COLUMN handover_notes.target_date IS 'Specific date this note is relevant to (e.g., Saturday appointment)';
COMMENT ON COLUMN handover_notes.relevant_until IS 'Note automatically archives after this date';
