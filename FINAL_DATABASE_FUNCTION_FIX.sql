-- 🚨 FINAL FIX - REPLACE DATABASE FUNCTION WITH SAFE VERSION
-- The increment_global_echoes function in Supabase might have INSERT logic that resets to 0

-- Step 1: Drop the existing function completely
DROP FUNCTION IF EXISTS increment_global_echoes() CASCADE;

-- Step 2: Create a SAFE version that NEVER creates records
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
    -- DO NOT CREATE RECORD - just return NULL to prevent reset
    RAISE NOTICE 'Global stats record with id=1 not found. Increment failed.';
    RETURN NULL;
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

-- Step 3: Verify your count is still there
SELECT 'DATABASE FUNCTION FIXED' as status, total_echoes as your_count 
FROM global_stats WHERE id = 1;

-- Step 4: Test the safe function
SELECT increment_global_echoes() as test_result;

-- Step 5: Reset back to your count (since we just incremented it)
UPDATE global_stats SET total_echoes = 306640 WHERE id = 1;

-- Step 6: Final verification
SELECT 'SAFE FUNCTION INSTALLED' as status, total_echoes as final_count
FROM global_stats WHERE id = 1;

-- This function will NEVER create records with 0, only increment existing ones