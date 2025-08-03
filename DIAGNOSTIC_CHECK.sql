-- 🔍 DIAGNOSTIC CHECK - What's the current state?

-- 1. Check if the global_stats table exists and what's in it
SELECT 'Table Check' as test, 
       id, 
       total_echoes, 
       created_at, 
       updated_at 
FROM global_stats 
WHERE id = 1;

-- 2. Check if the increment function exists
SELECT 'Function Check' as test,
       proname as function_name,
       prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'increment_global_echoes';

-- 3. Test the increment function manually
SELECT 'Manual Test' as test, increment_global_echoes() as result;

-- 4. Check the count after manual test
SELECT 'After Manual Test' as test, 
       total_echoes as current_count 
FROM global_stats 
WHERE id = 1;

-- 5. Check RLS policies
SELECT 'RLS Policies' as test,
       tablename,
       policyname,
       cmd,
       permissive
FROM pg_policies 
WHERE tablename = 'global_stats';

-- 6. Check if realtime is enabled
SELECT 'Realtime Check' as test,
       tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'global_stats';