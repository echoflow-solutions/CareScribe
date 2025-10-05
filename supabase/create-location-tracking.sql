-- Location Tracking System for CareScribe
-- Hybrid system using Bluetooth beacons, wearables, and manual check-ins

-- 1. Bluetooth Beacons Table
CREATE TABLE IF NOT EXISTS location_beacons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  beacon_id TEXT UNIQUE NOT NULL, -- Physical beacon MAC address or UUID
  room_name TEXT NOT NULL,
  floor_level INTEGER DEFAULT 1,
  installation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_battery_check TIMESTAMP WITH TIME ZONE,
  battery_level INTEGER, -- Percentage 0-100
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wearable Devices Table (optional for participants)
CREATE TABLE IF NOT EXISTS participant_wearables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  device_id TEXT UNIQUE NOT NULL, -- Bluetooth MAC or device UUID
  device_type TEXT DEFAULT 'bluetooth_tag', -- 'bluetooth_tag', 'smartwatch', 'rfid_badge'
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP WITH TIME ZONE,
  battery_level INTEGER,
  is_active BOOLEAN DEFAULT true,
  consent_given BOOLEAN DEFAULT true, -- Privacy compliance
  consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Location History Table
CREATE TABLE IF NOT EXISTS participant_location_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  location TEXT NOT NULL, -- Room name (Bedroom, Kitchen, Craft Room, etc.)
  beacon_id UUID REFERENCES location_beacons(id) ON DELETE SET NULL,
  detection_method TEXT NOT NULL, -- 'bluetooth_beacon', 'manual_checkin', 'wearable_device', 'motion_sensor'
  detected_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Staff member who checked in (for manual)
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  confidence_level INTEGER DEFAULT 100, -- 0-100, lower for motion sensors
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Current Location View (most recent location for each participant)
CREATE OR REPLACE VIEW participant_current_location AS
SELECT DISTINCT ON (participant_id)
  participant_id,
  location,
  beacon_id,
  detection_method,
  detected_by,
  detected_at,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - detected_at))/60 AS minutes_ago
FROM participant_location_history
ORDER BY participant_id, detected_at DESC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_location_beacons_facility ON location_beacons(facility_id);
CREATE INDEX IF NOT EXISTS idx_location_beacons_active ON location_beacons(is_active);
CREATE INDEX IF NOT EXISTS idx_wearables_participant ON participant_wearables(participant_id);
CREATE INDEX IF NOT EXISTS idx_wearables_active ON participant_wearables(is_active);
CREATE INDEX IF NOT EXISTS idx_location_history_participant ON participant_location_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_location_history_detected_at ON participant_location_history(detected_at DESC);

-- Enable Row Level Security
ALTER TABLE location_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_wearables ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for location_beacons
CREATE POLICY "Staff can view beacons"
  ON location_beacons FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage beacons"
  ON location_beacons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- RLS Policies for participant_wearables
CREATE POLICY "Staff can view wearables"
  ON participant_wearables FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage wearables"
  ON participant_wearables FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.level <= 2
    )
  );

-- RLS Policies for location_history
CREATE POLICY "Staff can view location history"
  ON participant_location_history FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Staff can insert location updates"
  ON participant_location_history FOR INSERT
  TO authenticated WITH CHECK (true);

-- Function to automatically update participant location on new history entry
CREATE OR REPLACE FUNCTION update_participant_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the participants table with the new location
  UPDATE participants
  SET current_location = NEW.location
  WHERE id = NEW.participant_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update participant location
DROP TRIGGER IF EXISTS trigger_update_participant_location ON participant_location_history;
CREATE TRIGGER trigger_update_participant_location
  AFTER INSERT ON participant_location_history
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_location();

-- Comments for documentation
COMMENT ON TABLE location_beacons IS 'Bluetooth Low Energy beacons installed in facility rooms for automatic location tracking';
COMMENT ON TABLE participant_wearables IS 'Optional wearable devices (Bluetooth tags, smartwatches) for participants who consent to tracking';
COMMENT ON TABLE participant_location_history IS 'Historical record of participant location changes with detection method and confidence';
COMMENT ON VIEW participant_current_location IS 'Real-time view of each participant''s current location with time since last update';

-- Sample data for demo (Parramatta House - Maxlife Care)
-- Insert beacons for common rooms
INSERT INTO location_beacons (beacon_id, room_name, floor_level, is_active) VALUES
  ('BEACON-BR-001', 'Bedroom 1', 1, true),
  ('BEACON-BR-002', 'Bedroom 2', 1, true),
  ('BEACON-BR-003', 'Bedroom 3', 1, true),
  ('BEACON-KT-001', 'Kitchen', 1, true),
  ('BEACON-LV-001', 'Living Room', 1, true),
  ('BEACON-CR-001', 'Craft Room', 1, true),
  ('BEACON-GD-001', 'Garden', 0, true),
  ('BEACON-DI-001', 'Dining Room', 1, true)
ON CONFLICT (beacon_id) DO NOTHING;
