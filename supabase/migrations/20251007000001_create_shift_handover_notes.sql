-- Create shift handover notes table
CREATE TABLE IF NOT EXISTS shift_handover_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in_time TIMESTAMPTZ NOT NULL,
  clock_out_time TIMESTAMPTZ NOT NULL,
  duration_hours DECIMAL(4,2),
  break_time_seconds INTEGER DEFAULT 0,
  handover_notes TEXT NOT NULL,
  progress_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shift_handover_notes_user_id ON shift_handover_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_shift_handover_notes_shift_date ON shift_handover_notes(shift_date);

-- Enable RLS
ALTER TABLE shift_handover_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own handover notes"
  ON shift_handover_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own handover notes"
  ON shift_handover_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own handover notes"
  ON shift_handover_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_shift_handover_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shift_handover_notes_updated_at
  BEFORE UPDATE ON shift_handover_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_handover_notes_updated_at();
