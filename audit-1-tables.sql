-- AUDIT PART 1: All table structures combined
-- Run this in Supabase SQL Editor

SELECT 
  table_name,
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('contests', 'users', 'entries', 'reactions', 'contest_winners', 'prize_history')
ORDER BY table_name, ordinal_position;
