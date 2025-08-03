-- 🚨 EMERGENCY RESTORE 306,640 ECHOES + INVESTIGATION
-- This will restore your count AND investigate what's causing resets

-- Step 1: Show current situation
SELECT '🔍 INVESTIGATION - Current state:' as step, 
       total_echoes as current_count, 
       updated_at as last_modified,
       EXTRACT(EPOCH FROM (NOW() - updated_at)) as seconds_since_last_update
FROM global_stats WHERE id = 1;

-- Step 2: Check for any conflicting records
SELECT '🔍 Checking for duplicate records:' as step, COUNT(*) as record_count
FROM global_stats;

SELECT '🔍 All records in global_stats:' as step, id, total_echoes, created_at, updated_at
FROM global_stats ORDER BY id;

-- Step 3: Check policies that might be interfering
SELECT '🔍 Current policies:' as step, policyname, cmd, qual
FROM pg_policies WHERE tablename = 'global_stats';

-- Step 4: Check recent activity (if there's a log table)
SELECT '🔍 Checking for recent database connections:' as step, 
       COUNT(*) as active_connections
FROM pg_stat_activity 
WHERE datname = current_database() AND state = 'active';

-- Step 5: RESTORE YOUR COUNT TO 306,640
UPDATE global_stats 
SET total_echoes = 306640, 
    updated_at = NOW() 
WHERE id = 1;

-- Step 6: Verify restoration
SELECT '✅ RESTORED COUNT:' as result, 
       total_echoes as restored_count, 
       updated_at as restoration_time
FROM global_stats WHERE id = 1;

-- Step 7: Create a backup trigger to log any unauthorized changes
CREATE OR REPLACE FUNCTION log_global_stats_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- If someone tries to reset the count to a low number, log it
    IF NEW.total_echoes < 1000 AND OLD.total_echoes > 100000 THEN
        RAISE WARNING 'SUSPICIOUS: Echo count dropped from % to % at %', 
                     OLD.total_echoes, NEW.total_echoes, NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS global_stats_change_monitor ON global_stats;

-- Create trigger to monitor changes
CREATE TRIGGER global_stats_change_monitor
    BEFORE UPDATE ON global_stats
    FOR EACH ROW
    EXECUTE FUNCTION log_global_stats_changes();

SELECT '🛡️ PROTECTION ACTIVATED - Will log any suspicious echo count changes!' as security;