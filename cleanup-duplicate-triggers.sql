-- ============================================
-- CLEANUP DUPLICATE ACTIVITY TRACKING TRIGGERS
-- ============================================
-- This script removes duplicate triggers that were created
-- Run this ONCE to clean up the database

-- Step 1: Drop ALL activity-related triggers (both old and new)
DROP TRIGGER IF EXISTS update_entry_activity_on_comment ON entry_comments;
DROP TRIGGER IF EXISTS update_entry_activity_on_reaction ON reactions;
DROP TRIGGER IF EXISTS trigger_update_entry_activity_on_comment ON entry_comments;
DROP TRIGGER IF EXISTS trigger_update_entry_activity_on_reaction ON reactions;

-- Step 2: Drop the function (we'll recreate it)
DROP FUNCTION IF EXISTS update_entry_last_activity();

-- Step 3: Recreate the function (clean version)
CREATE OR REPLACE FUNCTION update_entry_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entries 
  SET last_activity_at = NOW() 
  WHERE id = NEW.entry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the triggers (clean version)
CREATE TRIGGER trigger_update_entry_activity_on_comment
AFTER INSERT ON entry_comments
FOR EACH ROW 
EXECUTE FUNCTION update_entry_last_activity();

CREATE TRIGGER trigger_update_entry_activity_on_reaction
AFTER INSERT ON reactions
FOR EACH ROW 
EXECUTE FUNCTION update_entry_last_activity();

-- Step 5: Verify - should only see 2 triggers
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%activity%'
ORDER BY trigger_name;

-- Step 6: Test the trigger
-- Uncomment and run these lines to test:
-- SELECT id, last_activity_at FROM entries LIMIT 1;
-- INSERT INTO entry_comments (entry_id, user_id, comment_text) 
-- VALUES ('YOUR_ENTRY_ID', 'YOUR_USER_ID', 'Test trigger');
-- SELECT id, last_activity_at FROM entries WHERE id = 'YOUR_ENTRY_ID';
