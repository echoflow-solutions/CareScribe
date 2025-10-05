-- ============================================================================
-- CareScribe Comprehensive Shifts Management Schema (FIXED)
-- ============================================================================

-- IMPORTANT: Drop existing tables to start fresh
DROP TABLE IF EXISTS shift_assignments CASCADE;
DROP TABLE IF EXISTS shift_handovers CASCADE;
DROP TABLE IF EXISTS shift_swap_requests CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

-- ============================================================================
-- 1. Facilities Table
-- ============================================================================
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  capacity INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. Staff Table
-- ============================================================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
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
CREATE TABLE shifts (
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
  shift_type TEXT NOT NULL,

  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'scheduled',

  -- Clock In/Out Tracking
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  clocked_in_by UUID REFERENCES users(id),
  clocked_out_by UUID REFERENCES users(id),

  -- Assignment Information
  assigned_by UUID REFERENCES users(id),
  assigned_by_name TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Co-workers
  co_worker_ids UUID[],
  co_worker_names TEXT[],

  -- Handover Information
  handover_notes TEXT,
  handover_critical_info TEXT[],
  handover_completed_at TIMESTAMPTZ,
  handover_received_by UUID REFERENCES users(id),

  -- Break Tracking
  breaks_taken JSONB,

  -- Additional Metadata
  notes TEXT,
  tags TEXT[],
  recurring_shift_id UUID,

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
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  role_in_shift TEXT,
  status TEXT DEFAULT 'assigned',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  notes TEXT,

  UNIQUE(shift_id, staff_id)
);

-- ============================================================================
-- 5. Shift Handovers Table
-- ============================================================================
CREATE TABLE shift_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  to_shift_id UUID REFERENCES shifts(id),
  from_staff_id UUID REFERENCES staff(id),
  to_staff_id UUID REFERENCES staff(id),

  -- Handover Content
  critical_information TEXT[],
  general_notes TEXT,
  participant_updates JSONB,
  medication_notes TEXT,
  incidents_summary TEXT,
  upcoming_tasks TEXT[],

  -- Status
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  CONSTRAINT valid_handover_status CHECK (status IN ('pending', 'acknowledged', 'completed'))
);

-- ============================================================================
-- 6. Shift Swap Requests Table
-- ============================================================================
CREATE TABLE shift_swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  original_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  target_staff_id UUID REFERENCES staff(id),
  target_shift_id UUID REFERENCES shifts(id),

  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',

  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  CONSTRAINT valid_swap_status CHECK (status IN ('pending', 'approved', 'declined', 'cancelled'))
);

-- ============================================================================
-- 7. Indexes for Performance
-- ============================================================================
CREATE INDEX idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX idx_shifts_facility_id ON shifts(facility_id);
CREATE INDEX idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_shift_type ON shifts(shift_type);
CREATE INDEX idx_shifts_date_status ON shifts(shift_date, status);

CREATE INDEX idx_shift_handovers_from_shift ON shift_handovers(from_shift_id);
CREATE INDEX idx_shift_handovers_to_shift ON shift_handovers(to_shift_id);
CREATE INDEX idx_shift_handovers_status ON shift_handovers(status);

CREATE INDEX idx_shift_swap_requests_status ON shift_swap_requests(status);
CREATE INDEX idx_shift_swap_requests_requesting_staff ON shift_swap_requests(requesting_staff_id);

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
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE! Schema is ready for shift management
-- ============================================================================
