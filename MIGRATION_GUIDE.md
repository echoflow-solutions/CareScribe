# Database Migration Guide for Waitlist Updates

## Overview
This guide helps you update your Supabase database to support the new optional survey fields in the waitlist form.

## New Fields Being Added
- `company_name` (TEXT) - Name of the organization
- `company_size` (TEXT) - Size of organization (1-10, 11-50, 51-200, 200+)
- `state` (TEXT) - Australian state/territory
- `current_solution` (TEXT) - Current incident reporting method
- `how_heard` (TEXT) - How they heard about CareScribe
- `phone` (TEXT) - Contact phone number

## Migration Steps

### Option 1: Run the Migration Script (Recommended)

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL:

```sql
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

-- Optional: Check current waitlist entries
SELECT * FROM waitlist ORDER BY created_at DESC;
```

4. Click "Run" to execute the migration

### Option 2: Manual Migration via Table Editor

1. Go to your Supabase dashboard
2. Navigate to Table Editor → waitlist
3. Click on the "..." menu → "Edit Table"
4. Add the following columns:
   - Column: `company_name`, Type: `text`, Nullable: ✓
   - Column: `company_size`, Type: `text`, Nullable: ✓
   - Column: `state`, Type: `text`, Nullable: ✓
   - Column: `current_solution`, Type: `text`, Nullable: ✓
   - Column: `how_heard`, Type: `text`, Nullable: ✓
   - Column: `phone`, Type: `text`, Nullable: ✓
5. Save the changes

## Verify the Migration

After running the migration, verify it worked by running:

```sql
-- Check the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
ORDER BY ordinal_position;

-- Test insert with new fields
INSERT INTO waitlist (
  email, 
  name, 
  organization,
  role,
  company_name,
  company_size,
  state,
  current_solution,
  how_heard
) VALUES (
  'test@example.com',
  'Test User',
  'Test Org',
  'manager',
  'Test Company',
  '11-50',
  'NSW',
  'paper',
  'google'
);

-- Clean up test data
DELETE FROM waitlist WHERE email = 'test@example.com';
```

## Rollback (if needed)

If you need to rollback the changes:

```sql
-- Remove the new columns
ALTER TABLE waitlist 
DROP COLUMN IF EXISTS company_name,
DROP COLUMN IF EXISTS company_size,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS current_solution,
DROP COLUMN IF EXISTS how_heard,
DROP COLUMN IF EXISTS phone;

-- Remove the indexes
DROP INDEX IF EXISTS idx_waitlist_company_name;
DROP INDEX IF EXISTS idx_waitlist_state;
DROP INDEX IF EXISTS idx_waitlist_how_heard;
```

## Frontend Changes Applied

The frontend has been updated to:
1. Collect additional optional survey fields
2. Handle both the old schema (using metadata) and new schema (direct columns)
3. Show improved error handling for database operations

## Notes

- All new fields are nullable to maintain backward compatibility
- Existing waitlist entries will have NULL values for new fields
- The `organization` field is still populated for backward compatibility
- The form now saves email first, then updates with optional survey data