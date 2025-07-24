-- Update waitlist table to include more comprehensive fields
-- Note: Since we already have a waitlist table, we'll alter it to add new columns

-- Add new columns to existing waitlist table
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS feature_interests TEXT[],
ADD COLUMN IF NOT EXISTS suggestions TEXT,
ADD COLUMN IF NOT EXISTS expected_usage TEXT,
ADD COLUMN IF NOT EXISTS current_solution TEXT;

-- Update the role column to have specific options
ALTER TABLE waitlist 
ADD CONSTRAINT role_check CHECK (
  role IN (
    'support_worker',
    'team_leader', 
    'clinical_manager',
    'area_manager',
    'executive',
    'it_manager',
    'other'
  ) OR role IS NULL
);

-- Add index for company name searches
CREATE INDEX IF NOT EXISTS idx_waitlist_company ON waitlist(company_name);

-- Update RLS policies to allow reading own submission
CREATE POLICY IF NOT EXISTS "Users can view own submission" ON waitlist
  FOR SELECT USING (email = current_setting('request.jwt.claim.email', true));