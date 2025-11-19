-- Add title and description columns to entries table
-- This allows artists to add context to their artwork submissions

-- Add title column (required)
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add description column (optional)
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing entries without titles to have a default title
-- This ensures the constraint can be added
UPDATE entries 
SET title = 'Untitled Entry #' || id::text
WHERE title IS NULL OR TRIM(title) = '';

-- Add constraint to ensure title is not empty when status is not draft
-- (Artists can save drafts without title, but must add title before submitting)
ALTER TABLE entries 
DROP CONSTRAINT IF EXISTS entries_title_required_for_submission;

ALTER TABLE entries 
ADD CONSTRAINT entries_title_required_for_submission 
CHECK (
  (status = 'draft') OR 
  (status != 'draft' AND title IS NOT NULL AND LENGTH(TRIM(title)) > 0)
);

-- Add index for searching entries by title
CREATE INDEX IF NOT EXISTS idx_entries_title ON entries(title);
