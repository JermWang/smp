-- 🚨 COMPLETE DIAGNOSTIC AND FIX FOR GLOBAL ECHO COUNT

-- Step 1: Check what's actually in the database right now
SELECT 'STEP 1: CURRENT DATABASE STATE' as step;
SELECT id, total_echoes, created_at, updated_at FROM global_stats WHERE id = 1;

-- Step 2: If no record exists, create it with your count
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM global_stats WHERE id = 1) THEN
        INSERT INTO global_stats (id, total_echoes, created_at, updated_at) 
        VALUES (1, 306404, NOW(), NOW());
        RAISE NOTICE 'Created new record with 306,404 echoes';
    ELSE
        UPDATE global_stats 
        SET total_echoes = 306404, updated_at = NOW() 
        WHERE id = 1;
        RAISE NOTICE 'Updated existing record to 306,404 echoes';
    END IF;
END $$;

-- Step 3: Verify the record is there with correct count
SELECT 'STEP 3: AFTER RESTORATION' as step;
SELECT id, total_echoes, created_at, updated_at FROM global_stats WHERE id = 1;

-- Step 4: Check if the increment function exists
SELECT 'STEP 4: FUNCTION CHECK' as step;
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'increment_global_echoes';

-- Step 5: Drop and recreate the increment function (SAFE VERSION)
DROP FUNCTION IF EXISTS increment_global_echoes() CASCADE;

CREATE OR REPLACE FUNCTION increment_global_echoes()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count bigint;
  record_exists boolean;
BEGIN
  -- Check if record exists
  SELECT EXISTS(SELECT 1 FROM global_stats WHERE id = 1) INTO record_exists;
  
  IF NOT record_exists THEN
    RAISE EXCEPTION 'Global stats record with id=1 not found. Database setup required.';
  END IF;
  
  -- Increment the count
  UPDATE global_stats 
  SET total_echoes = total_echoes + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING total_echoes INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Step 6: Test the increment function
SELECT 'STEP 6: TESTING INCREMENT FUNCTION' as step;
SELECT increment_global_echoes() as test_result;

-- Step 7: Check count after test (should be 306,405)
SELECT 'STEP 7: AFTER TEST INCREMENT' as step;
SELECT id, total_echoes, updated_at FROM global_stats WHERE id = 1;

-- Step 8: Reset back to 306,404 (since we just tested)
UPDATE global_stats SET total_echoes = 306404 WHERE id = 1;

-- Step 9: Check RLS policies
SELECT 'STEP 9: RLS POLICIES CHECK' as step;
SELECT tablename, policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'global_stats';

-- Step 10: Recreate RLS policies if missing
DROP POLICY IF EXISTS "Allow read access to global_stats" ON global_stats;
DROP POLICY IF EXISTS "Allow insert to global_stats" ON global_stats;  
DROP POLICY IF EXISTS "Allow update to global_stats" ON global_stats;

CREATE POLICY "Allow read access to global_stats" ON global_stats
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to global_stats" ON global_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to global_stats" ON global_stats  
  FOR UPDATE USING (true);

-- Step 11: Check realtime publication
SELECT 'STEP 11: REALTIME CHECK' as step;
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'global_stats';

-- Step 12: Add to realtime if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'global_stats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE global_stats;
    RAISE NOTICE 'Added global_stats to realtime publication';
  END IF;
END $$;

-- Step 13: Final verification
SELECT 'STEP 13: FINAL VERIFICATION' as step;
SELECT 
  'SUCCESS' as status,
  total_echoes as echo_count,
  'Ready for normal operation' as message,
  updated_at as last_updated
FROM global_stats WHERE id = 1;

-- Step 14: Test one more increment to make sure everything works
SELECT 'STEP 14: FINAL TEST' as step;
SELECT increment_global_echoes() as final_test;

-- Step 15: Reset back to target count
UPDATE global_stats SET total_echoes = 306404 WHERE id = 1;
SELECT 'RESTORATION COMPLETE - COUNT SET TO 306,404' as final_status;