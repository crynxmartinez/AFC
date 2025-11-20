-- ============================================
-- ADD FULL REACTION SYSTEM
-- ============================================
-- Adds multiple reaction types to both entries and comments

-- Step 1: Update comment_likes table to support reaction types
-- Rename table to comment_reactions
ALTER TABLE comment_likes RENAME TO comment_reactions;

-- Add reaction_type column
ALTER TABLE comment_reactions 
ADD COLUMN IF NOT EXISTS reaction_type TEXT NOT NULL DEFAULT 'like';

-- Drop old primary key and create new one with reaction_type
ALTER TABLE comment_reactions DROP CONSTRAINT IF EXISTS comment_likes_pkey;
ALTER TABLE comment_reactions 
ADD CONSTRAINT comment_reactions_pkey 
PRIMARY KEY (user_id, comment_id, reaction_type);

-- Update indexes
DROP INDEX IF EXISTS idx_comment_likes_comment;
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment 
  ON comment_reactions(comment_id);

-- Step 2: Update entry_comments table to support reaction counts
ALTER TABLE entry_comments 
DROP COLUMN IF EXISTS likes_count CASCADE;

ALTER TABLE entry_comments 
ADD COLUMN IF NOT EXISTS reaction_counts JSONB DEFAULT '{}'::jsonb;

-- Step 3: Update reactions table (for entries) to support new types
-- Check if reaction_type column has the right constraint
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;

-- Add new reaction types
ALTER TABLE reactions 
ADD CONSTRAINT reactions_reaction_type_check 
CHECK (reaction_type IN ('like', 'love', 'haha', 'fire', 'wow', 'sad', 'cry', 'angry'));

-- Step 4: Update comment reaction trigger function
DROP FUNCTION IF EXISTS update_comment_likes_count() CASCADE;

CREATE OR REPLACE FUNCTION update_comment_reaction_counts()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_counts JSONB;
BEGIN
  -- Recalculate reaction counts for the comment
  SELECT jsonb_object_agg(reaction_type, count)
  INTO v_counts
  FROM (
    SELECT reaction_type, COUNT(*)::int as count
    FROM comment_reactions
    WHERE comment_id = COALESCE(NEW.comment_id, OLD.comment_id)
    GROUP BY reaction_type
  ) subquery;
  
  -- Update the comment with new counts
  UPDATE entry_comments
  SET reaction_counts = COALESCE(v_counts, '{}'::jsonb)
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
  
  RETURN NULL;
END;
$$;

-- Create trigger for comment reactions
DROP TRIGGER IF EXISTS on_comment_reaction_change ON comment_reactions;
CREATE TRIGGER on_comment_reaction_change
  AFTER INSERT OR DELETE ON comment_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reaction_counts();

-- Step 5: Update RLS policies
DROP POLICY IF EXISTS "Users can view all comment likes" ON comment_reactions;
DROP POLICY IF EXISTS "Users can like comments" ON comment_reactions;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON comment_reactions;

CREATE POLICY "Users can view all comment reactions"
  ON comment_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can react to comments"
  ON comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Initialize reaction_counts for existing comments
UPDATE entry_comments
SET reaction_counts = '{}'::jsonb
WHERE reaction_counts IS NULL;

-- Verify the changes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('comment_reactions', 'reactions', 'entry_comments')
  AND column_name IN ('reaction_type', 'reaction_counts')
ORDER BY table_name, column_name;
