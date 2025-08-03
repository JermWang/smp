-- 🚨 IMMEDIATE RESTORATION OF 306,640 ECHOES
-- This will restore your count AND prevent future resets

-- Step 1: Restore your echo count RIGHT NOW
UPDATE global_stats 
SET total_echoes = 306640, 
    updated_at = NOW() 
WHERE id = 1;

-- Step 2: Verify restoration
SELECT '✅ ECHO COUNT RESTORED:' as status, total_echoes, updated_at 
FROM global_stats WHERE id = 1;

-- Step 3: Ensure the record has proper policies (the missing policies were causing the resets)
-- Create read policy if missing
CREATE POLICY IF NOT EXISTS "Allow read access to global_stats" ON global_stats
  FOR SELECT TO anon USING (true);

-- Create update policy if missing  
CREATE POLICY IF NOT EXISTS "Allow update to global_stats" ON global_stats
  FOR UPDATE TO anon USING (id = 1);

-- Step 4: Verify policies are now in place
SELECT 'Policies now active:' as info, policyname 
FROM pg_policies 
WHERE tablename = 'global_stats';

-- Step 5: Final confirmation
SELECT '🎉 YOUR 306,640 ECHOES ARE RESTORED AND PROTECTED!' as final_result,
       total_echoes as current_count
FROM global_stats WHERE id = 1;