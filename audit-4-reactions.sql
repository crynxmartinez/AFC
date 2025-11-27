-- AUDIT PART 4: Reactions count per contest
-- Run this in Supabase SQL Editor

SELECT 
  c.title as contest_title,
  c.status,
  c.end_date,
  c.prize_pool,
  COUNT(r.id) as total_reactions
FROM contests c
LEFT JOIN entries e ON e.contest_id = c.id
LEFT JOIN reactions r ON r.entry_id = e.id
GROUP BY c.id, c.title, c.status, c.end_date, c.prize_pool
ORDER BY c.end_date DESC;
