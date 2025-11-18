-- Debug: Check entries in database
SELECT 
  e.id,
  e.user_id,
  e.contest_id,
  e.status,
  e.created_at,
  u.username,
  c.title as contest_title
FROM entries e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN contests c ON e.contest_id = c.id
ORDER BY e.created_at DESC
LIMIT 10;
