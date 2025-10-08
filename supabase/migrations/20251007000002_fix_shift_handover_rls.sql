-- Disable RLS for shift_handover_notes table (demo mode - no Supabase Auth)
ALTER TABLE shift_handover_notes DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own handover notes" ON shift_handover_notes;
DROP POLICY IF EXISTS "Users can insert their own handover notes" ON shift_handover_notes;
DROP POLICY IF EXISTS "Users can update their own handover notes" ON shift_handover_notes;
