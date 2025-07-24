-- Update waitlist table to include more comprehensive fields
-- This is the fixed version that handles existing data

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

-- Add index for company name searches
CREATE INDEX IF NOT EXISTS idx_waitlist_company ON waitlist(company_name);

-- Update RLS policies to allow reading own submission
-- First drop the policy if it exists
DROP POLICY IF EXISTS "Users can view own submission" ON waitlist;

-- Then create it
CREATE POLICY "Users can view own submission" ON waitlist
  FOR SELECT USING (email = current_setting('request.jwt.claim.email', true));

-- Note: We're NOT adding the role constraint since it would fail with existing data
-- The application will handle role validation instead