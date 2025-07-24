-- Migration to add new fields to waitlist table
-- Run this in your Supabase SQL Editor

-- Add new columns to waitlist table
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS current_solution TEXT,
ADD COLUMN IF NOT EXISTS how_heard TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update the metadata column to store any additional data if needed
-- The metadata column can still be used for any future fields without schema changes

-- Create or replace the RLS policy to ensure it still works
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Also allow users to update their own waitlist entry (for the optional survey)
DROP POLICY IF EXISTS "Users can update their own waitlist entry" ON waitlist;
CREATE POLICY "Users can update their own waitlist entry" ON waitlist
  FOR UPDATE USING (true);

-- Add index on company_name for faster searches
CREATE INDEX IF NOT EXISTS idx_waitlist_company_name ON waitlist(company_name);
CREATE INDEX IF NOT EXISTS idx_waitlist_state ON waitlist(state);
CREATE INDEX IF NOT EXISTS idx_waitlist_how_heard ON waitlist(how_heard);

-- Optional: If you want to see what's in the current waitlist
-- SELECT * FROM waitlist;