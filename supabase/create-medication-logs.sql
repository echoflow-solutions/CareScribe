-- Create medication_administration_logs table
CREATE TABLE IF NOT EXISTS medication_administration_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES participant_medications(id) ON DELETE CASCADE,
  administered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  administered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  dosage TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medication_logs_participant ON medication_administration_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication ON medication_administration_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_administered_by ON medication_administration_logs(administered_by);
CREATE INDEX IF NOT EXISTS idx_medication_logs_administered_at ON medication_administration_logs(administered_at);

-- Enable Row Level Security
ALTER TABLE medication_administration_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for staff to view medication logs
CREATE POLICY "Staff can view medication logs"
  ON medication_administration_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for staff to insert medication logs
CREATE POLICY "Staff can insert medication logs"
  ON medication_administration_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for staff to update their own medication logs
CREATE POLICY "Staff can update their own medication logs"
  ON medication_administration_logs
  FOR UPDATE
  TO authenticated
  USING (administered_by = auth.uid());

-- Add comment to the table
COMMENT ON TABLE medication_administration_logs IS 'Tracks when medications are administered to participants';
