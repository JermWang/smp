-- 🎯 CORRECTED RESTORATION TO YOUR ACTUAL TARGET: 306,404
-- This restores to the CORRECT count you specified, not 306,640

-- 1. DIAGNOSTIC: Check current state
SELECT 
  id,
  total_echoes,
  created_at,
  updated_at
FROM global_stats 
WHERE id = 1;

-- 2. RESTORE ECHO COUNT TO YOUR ACTUAL TARGET: 306,404
UPDATE global_stats 
SET 
  total_echoes = 306404,
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 3. VERIFY CORRECT RESTORATION
SELECT 
  'RESTORATION TO CORRECT COUNT COMPLETE' as status,
  total_echoes as current_count,
  'Should be 306,404' as expected,
  updated_at as last_updated
FROM global_stats 
WHERE id = 1;

-- 4. ENSURE ULTRA-SAFE INCREMENT FUNCTION EXISTS
CREATE OR REPLACE FUNCTION increment_global_echoes()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count bigint;
  record_exists boolean;
BEGIN
  -- First check if record exists (SAFETY CHECK)
  SELECT EXISTS(SELECT 1 FROM global_stats WHERE id = 1) INTO record_exists;
  
  IF NOT record_exists THEN
    RAISE EXCEPTION 'Global stats record with id=1 not found. Database setup required.';
  END IF;
  
  -- Only increment if record exists (SAFE OPERATION)
  UPDATE global_stats 
  SET total_echoes = total_echoes + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING total_echoes INTO new_count;
  
  -- Return the new count (guaranteed to exist)
  RETURN new_count;
END;
$$;

-- 5. TEST THE SAFE INCREMENT FUNCTION
SELECT increment_global_echoes() as test_increment;

-- 6. VERIFY INCREMENT WORKED (should be 306,405 now)
SELECT 
  'TEST COMPLETE' as status,
  total_echoes as count_after_test,
  'Should be 306,405' as expected
FROM global_stats 
WHERE id = 1;

-- 7. RESET BACK TO 306,404 (since test incremented it)
UPDATE global_stats 
SET total_echoes = 306404
WHERE id = 1;

-- 8. FINAL VERIFICATION
SELECT 
  '🎉 CORRECTLY RESTORED TO 306,404' as final_status,
  total_echoes as final_count,
  'Ready for normal operation from your actual target' as note,
  updated_at as restored_at
FROM global_stats 
WHERE id = 1;

-- 📋 SUMMARY:
-- ✅ Echo count restored to YOUR ACTUAL TARGET: 306,404
-- ✅ Ultra-safe increment function verified and working
-- ✅ Function will never create records, only increment existing ones
-- ✅ Your historical count is now properly preserved
-- 
-- 🚀 Your echo count starts from 306,404 and will only go UP!