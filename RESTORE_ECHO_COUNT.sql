-- 🔄 RESTORE GLOBAL ECHO COUNT
-- Use this AFTER running the QUICK_FIX_GLOBAL_STATS.sql

-- Option 1: If you know your previous echo count, replace XXXX with that number
-- UPDATE global_stats SET total_echoes = XXXX, updated_at = NOW() WHERE id = 1;

-- Option 2: If you want to set it to a specific number (example: 1000)
-- UPDATE global_stats SET total_echoes = 1000, updated_at = NOW() WHERE id = 1;

-- Option 3: If you want to add some echoes to the current count
-- UPDATE global_stats SET total_echoes = total_echoes + 100, updated_at = NOW() WHERE id = 1;

-- Check the current count
SELECT 'Current global echo count:' as status, total_echoes, updated_at 
FROM global_stats WHERE id = 1;

-- Example: Uncomment one of these lines and modify the number:
-- UPDATE global_stats SET total_echoes = 500, updated_at = NOW() WHERE id = 1;
-- UPDATE global_stats SET total_echoes = 1000, updated_at = NOW() WHERE id = 1;
-- UPDATE global_stats SET total_echoes = 2500, updated_at = NOW() WHERE id = 1;