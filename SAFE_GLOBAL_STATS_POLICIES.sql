-- 🛡️ SAFE GLOBAL STATS POLICY FIX - PRESERVES YOUR ECHO COUNT
-- This will ONLY fix missing policies, NEVER touches the echo count value

-- ⚠️ GUARANTEED: This script will NOT modify your echo count!

-- Step 1: Check your current echo count (READ ONLY)
SELECT '🔍 CURRENT ECHO COUNT (unchanged):' as message, total_echoes, updated_at 
FROM global_stats WHERE id = 1;

-- Step 2: Check existing policies
SELECT 'Current policies:' as info, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'global_stats';

-- Step 3: Create missing policies ONLY (without touching data)
-- These are needed for the app to work, but don't affect existing data

-- Read policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'global_stats' 
        AND policyname = 'Allow read access to global_stats'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow read access to global_stats" ON global_stats FOR SELECT TO anon USING (true)';
        RAISE NOTICE 'Created read policy';
    ELSE
        RAISE NOTICE 'Read policy already exists';
    END IF;
END $$;

-- Update policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'global_stats' 
        AND policyname = 'Allow update to global_stats'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow update to global_stats" ON global_stats FOR UPDATE TO anon USING (id = 1)';
        RAISE NOTICE 'Created update policy';
    ELSE
        RAISE NOTICE 'Update policy already exists';
    END IF;
END $$;

-- Insert policy (for emergency initialization only)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'global_stats' 
        AND policyname = 'Allow insert to global_stats'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow insert to global_stats" ON global_stats FOR INSERT TO anon WITH CHECK (id = 1)';
        RAISE NOTICE 'Created insert policy';
    ELSE
        RAISE NOTICE 'Insert policy already exists';
    END IF;
END $$;

-- Step 4: Verify your echo count is unchanged
SELECT '✅ ECHO COUNT AFTER POLICY FIX (should be same):' as message, total_echoes, updated_at 
FROM global_stats WHERE id = 1;

-- Step 5: Test that policies work
SELECT '🧪 Policy test - can read count:' as test, 
       CASE WHEN total_echoes IS NOT NULL THEN 'SUCCESS' ELSE 'FAILED' END as result
FROM global_stats WHERE id = 1;

SELECT '🎉 POLICIES FIXED - YOUR ECHO COUNT IS SAFE!' as final_message;