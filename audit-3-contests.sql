-- AUDIT PART 3: Current contests data
-- Run this in Supabase SQL Editor

SELECT 
  id,
  title, 
  status, 
  category,
  start_date, 
  end_date,
  prize_pool,
  prize_pool_distributed
FROM contests
ORDER BY created_at DESC;
