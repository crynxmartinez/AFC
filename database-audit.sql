-- =====================================================
-- DATABASE AUDIT SCRIPT - PART 1: CONTESTS TABLE
-- Run this FIRST, then run Part 2, Part 3, etc.
-- =====================================================

SELECT 
  'contests' as table_name,
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'contests'
ORDER BY ordinal_position;

-- =====================================================
-- 2. USERS TABLE STRUCTURE
-- =====================================================
SELECT '=== USERS TABLE ===' as section;

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- 3. ENTRIES TABLE STRUCTURE
-- =====================================================
SELECT '=== ENTRIES TABLE ===' as section;

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'entries'
ORDER BY ordinal_position;

-- =====================================================
-- 4. REACTIONS TABLE STRUCTURE
-- =====================================================
SELECT '=== REACTIONS TABLE ===' as section;

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reactions'
ORDER BY ordinal_position;

-- =====================================================
-- 5. ALL FUNCTIONS IN DATABASE
-- =====================================================
SELECT '=== ALL FUNCTIONS ===' as section;

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- 6. ALL TRIGGERS IN DATABASE
-- =====================================================
SELECT '=== ALL TRIGGERS ===' as section;

SELECT trigger_name, event_object_table, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 7. ALL TABLES IN DATABASE
-- =====================================================
SELECT '=== ALL TABLES ===' as section;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 8. CHECK CONSTRAINTS ON CONTESTS
-- =====================================================
SELECT '=== CONTESTS CONSTRAINTS ===' as section;

SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
AND constraint_name LIKE '%contest%';

-- =====================================================
-- 9. SAMPLE CONTEST DATA
-- =====================================================
SELECT '=== SAMPLE CONTESTS ===' as section;

SELECT id, title, status, start_date, end_date, 
       prize_pool, prize_pool_distributed, category,
       created_at
FROM contests
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 10. SAMPLE USERS DATA (points & xp columns)
-- =====================================================
SELECT '=== SAMPLE USERS ===' as section;

SELECT id, username, 
       points_balance, xp, level,
       created_at
FROM users
LIMIT 5;

-- =====================================================
-- 11. COUNT OF REACTIONS PER CONTEST
-- =====================================================
SELECT '=== REACTIONS PER CONTEST ===' as section;

SELECT c.title as contest_title, 
       c.status,
       c.prize_pool,
       COUNT(r.id) as total_reactions
FROM contests c
LEFT JOIN entries e ON e.contest_id = c.id
LEFT JOIN reactions r ON r.entry_id = e.id
GROUP BY c.id, c.title, c.status, c.prize_pool
ORDER BY c.created_at DESC;

-- =====================================================
-- 12. TOP ENTRIES BY REACTIONS (for ended contests)
-- =====================================================
SELECT '=== TOP ENTRIES BY REACTIONS ===' as section;

SELECT c.title as contest_title,
       e.id as entry_id,
       u.username,
       COUNT(r.id) as reaction_count
FROM contests c
JOIN entries e ON e.contest_id = c.id
JOIN users u ON u.id = e.user_id
LEFT JOIN reactions r ON r.entry_id = e.id
WHERE c.end_date < NOW()
GROUP BY c.title, e.id, u.username
ORDER BY c.title, reaction_count DESC;

-- =====================================================
-- 13. CHECK IF WINNER TABLES EXIST
-- =====================================================
SELECT '=== WINNER RELATED TABLES ===' as section;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('contest_winners', 'prize_history')
ORDER BY table_name;

-- =====================================================
-- 14. CHECK XP RELATED TABLES
-- =====================================================
SELECT '=== XP RELATED TABLES ===' as section;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
AND (table_name LIKE '%xp%' OR table_name LIKE '%level%')
ORDER BY table_name;

-- =====================================================
-- 15. SPECIFIC FUNCTION CHECK
-- =====================================================
SELECT '=== KEY FUNCTIONS CHECK ===' as section;

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'finalize_contest_and_select_winners',
  'award_xp',
  'add_vote_to_prize_pool',
  'get_level_progress',
  'add_points',
  'deduct_points'
);

-- =====================================================
-- DONE!
-- =====================================================
SELECT '=== AUDIT COMPLETE ===' as section;
SELECT 'Copy all results and share with me!' as instruction;
