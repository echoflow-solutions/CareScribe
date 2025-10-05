-- ============================================================================
-- CareScribe Comprehensive Shifts Management Schema
-- ============================================================================

-- Drop existing table if you want to start fresh (BE CAREFUL!)
-- DROP TABLE IF EXISTS shift_assignments CASCADE;
-- DROP TABLE IF EXISTS shift_handovers CASCADE;
-- DROP TABLE IF EXISTS shifts CASCADE;
-- DROP TABLE IF EXISTS facilities CASCADE;
-- DROP TABLE IF EXISTS staff CASCADE;

-- ============================================================================
-- 1. Facilities Table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  capacity INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. Staff Table (extended from users, or standalone)
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Support Worker', 'Team Leader', 'Nurse', etc.
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Comprehensive Shifts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Staff & Facility Information
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL,

  -- Scheduling Information
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT NOT NULL, -- 'morning', 'afternoon', 'night'

  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'active', 'completed', 'cancelled'

  -- Clock In/Out Tracking
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  clocked_in_by UUID REFERENCES users(id),
  clocked_out_by UUID REFERENCES users(id),

  -- Assignment Information
  assigned_by UUID REFERENCES users(id),
  assigned_by_name TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Co-workers (stored as array of staff IDs who share the shift time)
  co_worker_ids UUID[],
  co_worker_names TEXT[],

  -- Handover Information
  handover_notes TEXT,
  handover_critical_info TEXT[],
  handover_completed_at TIMESTAMPTZ,
  handover_received_by UUID REFERENCES users(id),

  -- Break Tracking
  breaks_taken JSONB, -- Array of {start_time, end_time, duration_minutes}

  -- Additional Metadata
  notes TEXT,
  tags TEXT[], -- For categorization
  recurring_shift_id UUID, -- Link to recurring shift pattern

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  CONSTRAINT valid_shift_type CHECK (shift_type IN ('morning', 'afternoon', 'night'))
);

-- ============================================================================
-- 4. Shift Assignments Junction Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  role_in_shift TEXT, -- 'primary', 'support', 'relief'
  status TEXT DEFAULT 'assigned', -- 'assigned', 'accepted', 'declined', 'completed'
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  notes TEXT,

  UNIQUE(shift_id, staff_id)
);

-- ============================================================================
-- 5. Shift Handovers Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS shift_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  to_shift_id UUID REFERENCES shifts(id),
  from_staff_id UUID REFERENCES staff(id),
  to_staff_id UUID REFERENCES staff(id),

  -- Handover Content
  critical_information TEXT[],
  general_notes TEXT,
  participant_updates JSONB, -- {participant_id, updates}
  medication_notes TEXT,
  incidents_summary TEXT,
  upcoming_tasks TEXT[],

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'acknowledged', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  CONSTRAINT valid_handover_status CHECK (status IN ('pending', 'acknowledged', 'completed'))
);

-- ============================================================================
-- 6. Shift Swap Requests Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS shift_swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  original_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  target_staff_id UUID REFERENCES staff(id),
  target_shift_id UUID REFERENCES shifts(id),

  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined', 'cancelled'

  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  CONSTRAINT valid_swap_status CHECK (status IN ('pending', 'approved', 'declined', 'cancelled'))
);

-- ============================================================================
-- 7. Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_facility_id ON shifts(facility_id);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_type ON shifts(shift_type);
CREATE INDEX IF NOT EXISTS idx_shifts_date_status ON shifts(shift_date, status);

CREATE INDEX IF NOT EXISTS idx_shift_handovers_from_shift ON shift_handovers(from_shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_to_shift ON shift_handovers(to_shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_status ON shift_handovers(status);

CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_status ON shift_swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_requesting_staff ON shift_swap_requests(requesting_staff_id);

-- ============================================================================
-- 8. Functions for Auto-Update Timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Row Level Security (Optional - enable if needed)
-- ============================================================================
-- ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shift_handovers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- Create policies as needed for your authentication setup

-- ============================================================================
-- 10. Grant Permissions (adjust based on your setup)
-- ============================================================================
-- GRANT ALL ON shifts TO authenticated;
-- GRANT ALL ON shift_handovers TO authenticated;
-- GRANT ALL ON shift_swap_requests TO authenticated;
-- GRANT ALL ON facilities TO authenticated;
-- GRANT ALL ON staff TO authenticated;

-- ============================================================================
-- DONE! Schema is ready for shift management
-- ============================================================================
