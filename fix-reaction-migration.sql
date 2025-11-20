-- ============================================
-- FIX REACTION SYSTEM MIGRATION
-- ============================================
-- This script safely migrates existing reactions to the new system

-- Step 1: Check what reaction types currently exist
SELECT DISTINCT reaction_type, COUNT(*) as count
FROM reactions
GROUP BY reaction_type;

-- Step 2: Migrate old reaction types to new ones
-- Map 'celebrate' -> 'fire' (or whatever makes sense)
UPDATE reactions
SET reaction_type = 'fire'
WHERE reaction_type = 'celebrate';

-- Map any other old types if they exist
-- Add more mappings here if needed

-- Step 3: Now we can safely add the new constraint
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

ALTER TABLE reactions 
ADD CONSTRAINT reactions_reaction_type_check 
CHECK (reaction_type IN ('like', 'love', 'haha', 'fire', 'wow', 'sad', 'cry', 'angry'));

-- Verify all reactions now match the constraint
SELECT reaction_type, COUNT(*) as count
FROM reactions
GROUP BY reaction_type
ORDER BY count DESC;
