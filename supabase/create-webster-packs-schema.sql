-- Webster Pack Medication Management System
-- Comprehensive schema for NDIS medication management with pharmacy integration

-- 1. Medication Timing Slots (Morning, Afternoon, Evening, Night)
CREATE TABLE IF NOT EXISTS medication_timing_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slot_name TEXT NOT NULL UNIQUE, -- 'Morning', 'Afternoon', 'Evening', 'Night'
  default_time TIME NOT NULL, -- '08:00', '12:00', '18:00', '22:00'
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default timing slots
INSERT INTO medication_timing_slots (slot_name, default_time, display_order) VALUES
  ('Morning', '08:00:00', 1),
  ('Afternoon', '12:00:00', 2),
  ('Evening', '18:00:00', 3),
  ('Night', '22:00:00', 4)
ON CONFLICT (slot_name) DO NOTHING;

-- 2. Enhanced Medications Table (extends participant_medications)
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true; -- Whether medication is currently active
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS webster_pack_enabled BOOLEAN DEFAULT true;
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS pill_description TEXT; -- 'Small white round pill', 'Large yellow capsule'
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS pill_count_per_dose INTEGER DEFAULT 1; -- Number of pills per administration
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS pharmacy_id TEXT; -- Pharmacy identifier for sync
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS pharmacy_medication_id TEXT; -- Pharmacy's internal medication ID
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS ndc_code TEXT; -- National Drug Code
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS fhir_medication_id TEXT; -- FHIR resource ID
ALTER TABLE participant_medications ADD COLUMN IF NOT EXISTS last_pharmacy_sync TIMESTAMP WITH TIME ZONE;

-- 3. Webster Packs Table
CREATE TABLE IF NOT EXISTS webster_packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  pharmacy_id TEXT NOT NULL, -- Pharmacy that prepared the pack
  pack_number TEXT NOT NULL, -- Pack identifier from pharmacy
  week_starting DATE NOT NULL, -- First day of the week this pack covers
  week_ending DATE NOT NULL, -- Last day of the week
  prepared_date DATE NOT NULL, -- When pharmacy packed it
  expected_pill_count INTEGER NOT NULL, -- Total pills in this week's pack
  actual_pill_count INTEGER, -- Verified count when received
  status TEXT DEFAULT 'pending', -- 'pending', 'received', 'verified', 'in_use', 'depleted', 'discarded'
  received_date TIMESTAMP WITH TIME ZONE,
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_date TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_notes TEXT,
  discrepancy_reported BOOLEAN DEFAULT false,
  fhir_medication_request_id TEXT, -- Link to pharmacy FHIR MedicationRequest
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant_id, pack_number, week_starting)
);

-- 4. Webster Pack Slots (Individual medication doses in the pack)
CREATE TABLE IF NOT EXISTS webster_pack_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webster_pack_id UUID REFERENCES webster_packs(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES participant_medications(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  slot_date DATE NOT NULL,
  timing_slot_id UUID REFERENCES medication_timing_slots(id),
  timing_slot_name TEXT NOT NULL, -- 'Morning', 'Afternoon', 'Evening', 'Night'
  expected_pill_count INTEGER NOT NULL DEFAULT 1,
  actual_pill_count INTEGER, -- Verified when unpacking
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  pill_description TEXT,
  administration_status TEXT DEFAULT 'pending', -- 'pending', 'administered', 'missed', 'refused', 'double_checked'
  administered_at TIMESTAMP WITH TIME ZONE,
  administered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_required BOOLEAN DEFAULT false, -- High-risk meds need double-checking
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pharmacy Integration/FHIR Sync Table
CREATE TABLE IF NOT EXISTS pharmacy_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  pharmacy_name TEXT NOT NULL,
  pharmacy_id TEXT NOT NULL UNIQUE, -- Pharmacy business identifier
  pharmacy_address TEXT,
  pharmacy_phone TEXT,
  pharmacy_email TEXT,
  fhir_endpoint_url TEXT, -- FHIR API endpoint
  fhir_api_key_encrypted TEXT, -- Encrypted API key
  integration_type TEXT DEFAULT 'fhir', -- 'fhir', 'erx', 'custom_api', 'manual'
  sync_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT, -- 'success', 'failed', 'partial'
  sync_frequency_hours INTEGER DEFAULT 24, -- How often to sync
  auto_verify_packs BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Pharmacy Sync Log (Audit trail of all sync operations)
CREATE TABLE IF NOT EXISTS pharmacy_sync_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pharmacy_integration_id UUID REFERENCES pharmacy_integrations(id) ON DELETE CASCADE,
  sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  medications_synced INTEGER DEFAULT 0,
  webster_packs_synced INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,
  error_details JSONB,
  sync_details JSONB, -- Full log of what was synced
  initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Medication Discrepancies (When pharmacy made errors)
CREATE TABLE IF NOT EXISTS medication_discrepancies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webster_pack_id UUID REFERENCES webster_packs(id) ON DELETE CASCADE,
  webster_pack_slot_id UUID REFERENCES webster_pack_slots(id) ON DELETE SET NULL,
  discrepancy_type TEXT NOT NULL, -- 'wrong_medication', 'wrong_count', 'missing_dose', 'extra_dose', 'damaged'
  expected_medication TEXT,
  expected_count INTEGER,
  actual_medication TEXT,
  actual_count INTEGER,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pharmacy_notified BOOLEAN DEFAULT false,
  pharmacy_notified_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  pharmacy_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Medication Session Summary View (for quick overview)
CREATE OR REPLACE VIEW medication_session_summary AS
SELECT
  wp.id as webster_pack_id,
  wp.participant_id,
  p.name as participant_name,
  wps.timing_slot_name,
  wps.slot_date,
  COUNT(wps.id) as total_medications,
  SUM(wps.expected_pill_count) as expected_pill_count,
  SUM(wps.actual_pill_count) as actual_pill_count,
  SUM(CASE WHEN wps.administration_status = 'administered' THEN 1 ELSE 0 END) as administered_count,
  SUM(CASE WHEN wps.administration_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  SUM(CASE WHEN wps.administration_status = 'missed' THEN 1 ELSE 0 END) as missed_count,
  MAX(wps.administered_at) as last_administered_at
FROM webster_packs wp
JOIN participants p ON wp.participant_id = p.id
JOIN webster_pack_slots wps ON wp.id = wps.webster_pack_id
GROUP BY wp.id, wp.participant_id, p.name, wps.timing_slot_name, wps.slot_date;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webster_packs_participant ON webster_packs(participant_id);
CREATE INDEX IF NOT EXISTS idx_webster_packs_week ON webster_packs(week_starting, week_ending);
CREATE INDEX IF NOT EXISTS idx_webster_packs_status ON webster_packs(status);
CREATE INDEX IF NOT EXISTS idx_webster_pack_slots_pack ON webster_pack_slots(webster_pack_id);
CREATE INDEX IF NOT EXISTS idx_webster_pack_slots_date ON webster_pack_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_webster_pack_slots_status ON webster_pack_slots(administration_status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_sync_log_pharmacy ON pharmacy_sync_log(pharmacy_integration_id);
CREATE INDEX IF NOT EXISTS idx_medication_discrepancies_pack ON medication_discrepancies(webster_pack_id);
CREATE INDEX IF NOT EXISTS idx_medication_discrepancies_resolved ON medication_discrepancies(resolved);

-- Enable Row Level Security
ALTER TABLE webster_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webster_pack_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_discrepancies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webster_packs
CREATE POLICY "Staff can view webster packs"
  ON webster_packs FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can insert webster packs"
  ON webster_packs FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update webster packs"
  ON webster_packs FOR UPDATE
  TO authenticated USING (true);

-- RLS Policies for webster_pack_slots
CREATE POLICY "Staff can view webster pack slots"
  ON webster_pack_slots FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can update webster pack slots"
  ON webster_pack_slots FOR UPDATE
  TO authenticated USING (true);

-- RLS Policies for pharmacy_integrations
CREATE POLICY "Staff can view pharmacy integrations"
  ON pharmacy_integrations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Managers can manage pharmacy integrations"
  ON pharmacy_integrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- RLS Policies for pharmacy_sync_log
CREATE POLICY "Staff can view pharmacy sync log"
  ON pharmacy_sync_log FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for medication_discrepancies
CREATE POLICY "Staff can view medication discrepancies"
  ON medication_discrepancies FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can report medication discrepancies"
  ON medication_discrepancies FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update medication discrepancies"
  ON medication_discrepancies FOR UPDATE
  TO authenticated USING (true);

-- Function to auto-generate webster pack slots when a pack is created
CREATE OR REPLACE FUNCTION generate_webster_pack_slots()
RETURNS TRIGGER AS $$
DECLARE
  slot_date_var DATE;
  day_counter INTEGER;
  participant_meds RECORD;
  slot_record RECORD;
BEGIN
  -- For each day in the week
  FOR day_counter IN 0..6 LOOP
    slot_date_var := NEW.week_starting + day_counter;

    -- For each timing slot
    FOR slot_record IN SELECT * FROM medication_timing_slots ORDER BY display_order LOOP
      -- For each active medication for this participant
      FOR participant_meds IN
        SELECT pm.* FROM participant_medications pm
        WHERE pm.participant_id = NEW.participant_id
          AND pm.active = true
          AND pm.webster_pack_enabled = true
          AND pm.time = slot_record.default_time::TEXT
      LOOP
        -- Insert a slot for this medication
        INSERT INTO webster_pack_slots (
          webster_pack_id,
          medication_id,
          day_of_week,
          slot_date,
          timing_slot_id,
          timing_slot_name,
          expected_pill_count,
          medication_name,
          dosage,
          pill_description
        ) VALUES (
          NEW.id,
          participant_meds.id,
          day_counter,
          slot_date_var,
          slot_record.id,
          slot_record.slot_name,
          participant_meds.pill_count_per_dose,
          participant_meds.name,
          participant_meds.dosage,
          participant_meds.pill_description
        );
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slots
DROP TRIGGER IF EXISTS trigger_generate_webster_pack_slots ON webster_packs;
CREATE TRIGGER trigger_generate_webster_pack_slots
  AFTER INSERT ON webster_packs
  FOR EACH ROW
  EXECUTE FUNCTION generate_webster_pack_slots();

-- Comments for documentation
COMMENT ON TABLE webster_packs IS 'Weekly medication packs prepared by pharmacy with all medications organized by day and time';
COMMENT ON TABLE webster_pack_slots IS 'Individual medication doses within a Webster pack for each day/time combination';
COMMENT ON TABLE pharmacy_integrations IS 'Integration settings for pharmacy systems using FHIR or custom APIs';
COMMENT ON TABLE pharmacy_sync_log IS 'Audit log of all pharmacy synchronization operations';
COMMENT ON TABLE medication_discrepancies IS 'Track pharmacy errors or discrepancies in Webster packs for quality control';
COMMENT ON VIEW medication_session_summary IS 'Aggregated view of medications grouped by participant, date, and timing slot (Morning/Afternoon/Evening/Night)';
