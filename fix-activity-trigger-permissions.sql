-- Fix activity trigger - add SECURITY DEFINER to bypass RLS
-- This allows the trigger to update entries even with RLS enabled

-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS update_entry_last_activity() CASCADE;

CREATE OR REPLACE FUNCTION update_entry_last_activity()
RETURNS TRIGGER 
SECURITY DEFINER  -- This is the key! Runs with creator's permissions
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE entries 
  SET last_activity_at = NOW() 
  WHERE id = NEW.entry_id;
  RETURN NEW;
END;
$$;

-- Recreate the triggers
DROP TRIGGER IF EXISTS trigger_update_entry_activity_on_comment ON entry_comments;
DROP TRIGGER IF EXISTS trigger_update_entry_activity_on_reaction ON reactions;

CREATE TRIGGER trigger_update_entry_activity_on_comment
AFTER INSERT ON entry_comments
FOR EACH ROW 
EXECUTE FUNCTION update_entry_last_activity();

CREATE TRIGGER trigger_update_entry_activity_on_reaction
AFTER INSERT ON reactions
FOR EACH ROW 
EXECUTE FUNCTION update_entry_last_activity();

-- Test it by checking the function
SELECT 
  routine_name,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'update_entry_last_activity';
