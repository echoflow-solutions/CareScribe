-- Check if the update worked after you test the form
-- Run this in Supabase SQL Editor to see the latest entry

SELECT * FROM waitlist 
ORDER BY created_at DESC 
LIMIT 5;

-- If you see entries with NULL values in optional fields,
-- you can manually test the update like this:
-- UPDATE waitlist 
-- SET 
--   company_name = 'Test Company',
--   role = 'manager',
--   company_size = '11-50',
--   state = 'NSW',
--   current_solution = 'paper',
--   how_heard = 'google'
-- WHERE email = 'your-test-email@example.com'
-- RETURNING *;