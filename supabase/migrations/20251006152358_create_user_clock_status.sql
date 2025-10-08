-- Simple user clock-in/out status table
-- Each user has one active clock status record

CREATE TABLE IF NOT EXISTS user_clock_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_clocked_in BOOLEAN NOT NULL DEFAULT false,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user
  CONSTRAINT unique_user_clock_status UNIQUE (user_id)
);

-- Index for fast user lookup
CREATE INDEX idx_user_clock_status_user_id ON user_clock_status(user_id);
CREATE INDEX idx_user_clock_status_clocked_in ON user_clock_status(is_clocked_in);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_clock_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_clock_status_updated_at
  BEFORE UPDATE ON user_clock_status
  FOR EACH ROW
  EXECUTE FUNCTION update_user_clock_status_updated_at();

-- Enable RLS
ALTER TABLE user_clock_status ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own clock status
CREATE POLICY "Users can view own clock status"
  ON user_clock_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clock status"
  ON user_clock_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clock status"
  ON user_clock_status FOR UPDATE
  USING (auth.uid() = user_id);
