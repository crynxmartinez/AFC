-- =====================================================
-- ADD CONTEST CATEGORIES SYSTEM
-- Adds category support for different contest types
-- =====================================================

-- Step 1: Add category column to contests table
ALTER TABLE contests
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'art';

-- Step 2: Add constraint to ensure valid categories
ALTER TABLE contests
DROP CONSTRAINT IF EXISTS contests_category_check;

ALTER TABLE contests
ADD CONSTRAINT contests_category_check 
CHECK (category IN ('art', 'cosplay', 'photography', 'music', 'video'));

-- Step 3: Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_contests_category ON contests(category);

-- Step 4: Update existing contests to 'art' category
UPDATE contests
SET category = 'art'
WHERE category IS NULL;

-- Step 5: Create contest_phase_config table (optional, for custom phase names)
CREATE TABLE IF NOT EXISTS contest_phase_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  phase_name TEXT NOT NULL,
  phase_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, phase_number)
);

-- Step 6: Add index for phase config lookups
CREATE INDEX IF NOT EXISTS idx_contest_phase_config_contest ON contest_phase_config(contest_id);

-- Step 7: Enable RLS on phase config table
ALTER TABLE contest_phase_config ENABLE ROW LEVEL SECURITY;

-- Step 8: Allow everyone to view phase configs
CREATE POLICY "Phase configs are viewable by everyone"
  ON contest_phase_config FOR SELECT
  USING (true);

-- Step 9: Allow authenticated users to create phase configs
CREATE POLICY "Authenticated users can create phase configs"
  ON contest_phase_config FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if category column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'contests' AND column_name = 'category';

-- Check existing contests
SELECT id, title, category, created_at
FROM contests
ORDER BY created_at DESC
LIMIT 5;

-- Check phase config table
SELECT COUNT(*) as phase_config_count
FROM contest_phase_config;

-- =====================================================
-- COMPLETED
-- =====================================================
-- Next: Create TypeScript types and constants
