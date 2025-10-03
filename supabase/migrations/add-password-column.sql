-- Add password column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Add comment
COMMENT ON COLUMN users.password IS 'Plain text password for demo purposes only';
