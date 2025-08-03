-- 🚨 EMERGENCY: Check current global echo count status

-- 1. Check current count in database
SELECT 
  'CURRENT STATUS' as check_type,
  id, 
  total_echoes, 
  updated_at,
  created_at
FROM global_stats 
WHERE id = 1;

-- 2. Check if the increment function still exists and is safe
SELECT 
  'FUNCTION CHECK' as check_type,
  proname as function_name,
  prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'increment_global_echoes';

-- 3. Check recent activity (if any logs exist)
SELECT 
  'TABLE INFO' as check_type,
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'global_stats';

-- 4. Test if the function works properly
SELECT 'FUNCTION TEST' as check_type, increment_global_echoes() as test_result;

-- 5. Check the count after test (should be +1 from step 1)
SELECT 
  'AFTER TEST' as check_type,
  total_echoes as count_after_test
FROM global_stats 
WHERE id = 1;

-- 6. Reset the test increment (IMPORTANT!)
UPDATE global_stats 
SET total_echoes = total_echoes - 1 
WHERE id = 1;

-- 7. Final status
SELECT 
  'FINAL STATUS' as check_type,
  total_echoes as final_count,
  updated_at as last_updated
FROM global_stats 
WHERE id = 1;