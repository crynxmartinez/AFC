-- ============================================
-- SAFE REACTION SYSTEM MIGRATION
-- ============================================
-- Run this step-by-step to safely migrate reactions

-- STEP 1: Check current state
SELECT 'Current reaction types in database:' as info;
SELECT DISTINCT reaction_type, COUNT(*) as count
FROM reactions
GROUP BY reaction_type;

-- STEP 2: Drop the constraint first (if it exists)
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

-- STEP 3: Migrate old reaction types
UPDATE reactions
SET reaction_type = 'fire'
WHERE reaction_type = 'celebrate';

UPDATE reactions
SET reaction_type = 'like'
WHERE reaction_type NOT IN ('like', 'love', 'haha', 'fire', 'wow', 'sad', 'cry', 'angry');

-- STEP 4: Verify all reactions are now valid
SELECT 'Reaction types after migration:' as info;
SELECT DISTINCT reaction_type, COUNT(*) as count
FROM reactions
GROUP BY reaction_type;

-- STEP 5: Add the new constraint
ALTER TABLE reactions 
ADD CONSTRAINT reactions_reaction_type_check 
CHECK (reaction_type IN ('like', 'love', 'haha', 'fire', 'wow', 'sad', 'cry', 'angry'));

-- STEP 6: Test the constraint
SELECT 'Constraint added successfully!' as result;

-- STEP 7: Verify constraint is active
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'reactions_reaction_type_check';
