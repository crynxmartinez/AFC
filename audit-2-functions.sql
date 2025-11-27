-- AUDIT PART 2: All functions and triggers
-- Run this in Supabase SQL Editor

SELECT 'function' as type, routine_name as name
FROM information_schema.routines
WHERE routine_schema = 'public'
UNION ALL
SELECT 'trigger' as type, trigger_name as name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY type, name;
