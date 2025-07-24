-- Verify the waitlist table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
ORDER BY ordinal_position;

-- Check all constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'waitlist'::regclass;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'waitlist';

-- Check RLS policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'waitlist';

-- Test insert (this will create a test entry)
INSERT INTO waitlist (email) 
VALUES ('test@example.com')
RETURNING *;

-- Test update (to verify optional survey works)
UPDATE waitlist 
SET 
    company_name = 'Test Organization',
    role = 'manager',
    company_size = '11-50',
    state = 'NSW',
    current_solution = 'paper',
    how_heard = 'google'
WHERE email = 'test@example.com'
RETURNING *;

-- View the test data
SELECT * FROM waitlist WHERE email = 'test@example.com';

-- Clean up test data
DELETE FROM waitlist WHERE email = 'test@example.com';