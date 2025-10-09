-- Draft Reports Table
-- This table stores work-in-progress report conversations for auto-save and recovery

CREATE TABLE IF NOT EXISTS draft_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Foreign keys
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,

  -- Draft data
  conversation JSONB NOT NULL DEFAULT '[]', -- Array of {question, answer, category}
  current_question JSONB, -- Current question being answered
  current_answer TEXT, -- Current answer in progress
  progress INTEGER DEFAULT 0, -- Progress percentage (0-100)

  -- Metadata
  report_type VARCHAR(50) DEFAULT 'ai-guided', -- 'ai-guided', 'quick', 'abc', etc.
  is_complete BOOLEAN DEFAULT false,

  -- Auto-save tracking
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  save_count INTEGER DEFAULT 0,

  -- Session info
  session_id VARCHAR(255), -- Browser session ID
  device_info JSONB, -- Browser, OS, etc.

  -- Network resilience
  offline_changes JSONB DEFAULT '[]', -- Changes made while offline
  sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days') -- Auto-cleanup after 7 days
);

-- Create indexes for better performance
CREATE INDEX idx_draft_reports_user ON draft_reports(user_id);
CREATE INDEX idx_draft_reports_facility ON draft_reports(facility_id);
CREATE INDEX idx_draft_reports_session ON draft_reports(session_id);
CREATE INDEX idx_draft_reports_activity ON draft_reports(last_activity_at);
CREATE INDEX idx_draft_reports_expires ON draft_reports(expires_at);

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_draft_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  NEW.last_saved_at = CURRENT_TIMESTAMP;
  NEW.save_count = OLD.save_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER draft_reports_updated_at
  BEFORE UPDATE ON draft_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_reports_updated_at();

-- Create a function to clean up expired drafts (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_drafts()
RETURNS void AS $$
BEGIN
  DELETE FROM draft_reports
  WHERE expires_at < CURRENT_TIMESTAMP
    AND is_complete = false;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE draft_reports IS 'Stores work-in-progress incident reports for auto-save and recovery';
COMMENT ON COLUMN draft_reports.conversation IS 'Array of conversation turns [{question, answer, category, timestamp}]';
COMMENT ON COLUMN draft_reports.offline_changes IS 'Array of changes made while offline for conflict resolution';
COMMENT ON COLUMN draft_reports.expires_at IS 'Drafts are auto-deleted after this timestamp if not completed';
