-- Add activity tracking to entries table
-- This allows sorting by most recent activity (comments, replies, reactions)

-- Add last_activity_at column
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Initialize last_activity_at for existing entries
UPDATE entries 
SET last_activity_at = created_at 
WHERE last_activity_at IS NULL;

-- Create function to update last_activity_at
CREATE OR REPLACE FUNCTION update_entry_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entries 
  SET last_activity_at = NOW() 
  WHERE id = NEW.entry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_entry_activity_on_comment ON entry_comments;
DROP TRIGGER IF EXISTS trigger_update_entry_activity_on_reaction ON reactions;

-- Create trigger for comments (includes replies since they're in entry_comments)
CREATE TRIGGER trigger_update_entry_activity_on_comment
AFTER INSERT ON entry_comments
FOR EACH ROW 
EXECUTE FUNCTION update_entry_last_activity();

-- Create trigger for reactions
CREATE TRIGGER trigger_update_entry_activity_on_reaction
AFTER INSERT ON reactions
FOR EACH ROW 
EXECUTE FUNCTION update_entry_last_activity();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_entries_last_activity_at ON entries(last_activity_at DESC);
