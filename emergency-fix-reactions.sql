-- ============================================
-- EMERGENCY FIX FOR REACTIONS
-- ============================================
-- This will fix the constraint issue immediately

-- Step 1: Drop the problematic constraint
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

-- Step 2: Check what we have
SELECT 'Current reactions:' as info;
SELECT reaction_type, COUNT(*) 
FROM reactions 
GROUP BY reaction_type;

-- Step 3: The constraint should now be gone
-- You can now run the full migration script
SELECT 'Constraint dropped. Now run add-full-reaction-system.sql' as next_step;
