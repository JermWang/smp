-- 🚨 QUICK FIX for Global Stats Error - CORRECTED SYNTAX
-- Copy and paste this entire block into your Supabase SQL Editor and run it

-- Step 1: Check what policies already exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'global_stats';

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow insert to global_stats" ON global_stats;
DROP POLICY IF EXISTS "Allow update to global_stats" ON global_stats;
DROP POLICY IF EXISTS "Allow read access to global_stats" ON global_stats;

-- Step 3: Recreate all policies with correct syntax
CREATE POLICY "Allow read access to global_stats" ON global_stats
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow update to global_stats" ON global_stats
  FOR UPDATE TO anon USING (id = 1);

CREATE POLICY "Allow insert to global_stats" ON global_stats
  FOR INSERT TO anon WITH CHECK (id = 1);

-- Step 4: Check current echo count BEFORE making changes
SELECT 'Current echo count before fix:' as status, total_echoes 
FROM global_stats WHERE id = 1;

-- Step 5: Ensure the record exists (but don't reset count to 0!)
INSERT INTO global_stats (id, total_echoes, created_at, updated_at) 
VALUES (1, 0, NOW(), NOW()) 
ON CONFLICT (id) DO NOTHING;

-- Step 6: Verify the final count
SELECT 'Final echo count after fix:' as status, total_echoes 
FROM global_stats WHERE id = 1;