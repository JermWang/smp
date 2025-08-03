-- 🔄 RESTORE GLOBAL ECHO COUNT TO 306,640
-- Run this in your Supabase SQL Editor

-- First, check the current count
SELECT 'Current echo count:' as status, total_echoes, updated_at 
FROM global_stats WHERE id = 1;

-- Restore to 306,640 echoes
UPDATE global_stats 
SET total_echoes = 306640, 
    updated_at = NOW() 
WHERE id = 1;

-- Verify the restoration was successful
SELECT 'Restored echo count:' as status, total_echoes, updated_at 
FROM global_stats WHERE id = 1;

-- Show a success message
SELECT '🎉 Successfully restored 306,640 echoes!' as result;