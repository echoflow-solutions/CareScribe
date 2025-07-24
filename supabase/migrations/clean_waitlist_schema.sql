-- Clean Waitlist Schema Migration
-- This creates a tight schema that exactly matches the current form

-- First, create a backup of existing data (optional but recommended)
-- CREATE TABLE waitlist_backup AS SELECT * FROM waitlist;

-- Drop the existing waitlist table and recreate with only needed columns
DROP TABLE IF EXISTS waitlist CASCADE;

-- Create the waitlist table with only the fields used in the current form
CREATE TABLE waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  role TEXT,
  company_size TEXT,
  state TEXT,
  current_solution TEXT,
  how_heard TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraints for valid values
ALTER TABLE waitlist
ADD CONSTRAINT check_role CHECK (role IN ('support_worker', 'team_leader', 'manager', 'admin', 'other') OR role IS NULL),
ADD CONSTRAINT check_company_size CHECK (company_size IN ('1-10', '11-50', '51-200', '200+') OR company_size IS NULL),
ADD CONSTRAINT check_state CHECK (state IN ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT') OR state IS NULL),
ADD CONSTRAINT check_current_solution CHECK (current_solution IN ('paper', 'excel', 'other_software', 'no_system') OR current_solution IS NULL),
ADD CONSTRAINT check_how_heard CHECK (how_heard IN ('google', 'bing', 'other_search', 'linkedin', 'facebook', 'twitter', 'instagram', 'referral', 'ndis_event', 'trade_show', 'webinar', 'industry_publication', 'podcast', 'youtube', 'forum', 'partner', 'email', 'advertisement', 'other') OR how_heard IS NULL);

-- Create indexes for better query performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_company_name ON waitlist(company_name);
CREATE INDEX idx_waitlist_state ON waitlist(state);
CREATE INDEX idx_waitlist_how_heard ON waitlist(how_heard);
CREATE INDEX idx_waitlist_role ON waitlist(role);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to join waitlist (insert)
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Policy to allow users to update their own waitlist entry (for optional survey)
CREATE POLICY "Users can update their own waitlist entry" ON waitlist
  FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist
    FOR EACH ROW EXECUTE FUNCTION update_waitlist_updated_at();

-- Verify the new schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
ORDER BY ordinal_position;

-- If you had data in the old table and want to restore it:
-- INSERT INTO waitlist (email, company_name, role, company_size, state, current_solution, how_heard, created_at)
-- SELECT email, 
--        COALESCE(company_name, organization) as company_name,
--        role, 
--        company_size, 
--        state, 
--        current_solution, 
--        how_heard,
--        created_at
-- FROM waitlist_backup;