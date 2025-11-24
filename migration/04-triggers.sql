-- =====================================================
-- ARENA FOR CREATIVES - DATABASE TRIGGERS
-- All database triggers
-- =====================================================

-- =====================================================
-- VOTE TRIGGERS
-- =====================================================

-- Increment vote count when vote is added
DROP TRIGGER IF EXISTS trigger_increment_vote_count ON votes;
CREATE TRIGGER trigger_increment_vote_count
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_entry_vote_count();

-- Decrement vote count when vote is removed
DROP TRIGGER IF EXISTS trigger_decrement_vote_count ON votes;
CREATE TRIGGER trigger_decrement_vote_count
  AFTER DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_entry_vote_count();

-- =====================================================
-- COMMENT TRIGGERS
-- =====================================================

-- Increment comment count when comment is added
DROP TRIGGER IF EXISTS trigger_increment_comment_count ON comments;
CREATE TRIGGER trigger_increment_comment_count
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_entry_comment_count();

-- Decrement comment count when comment is deleted
DROP TRIGGER IF EXISTS trigger_decrement_comment_count ON comments;
CREATE TRIGGER trigger_decrement_comment_count
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_entry_comment_count();

-- =====================================================
-- SHARE TRIGGERS
-- =====================================================

-- Increment share count when share is added
DROP TRIGGER IF EXISTS trigger_increment_share_count ON shares;
CREATE TRIGGER trigger_increment_share_count
  AFTER INSERT ON shares
  FOR EACH ROW
  EXECUTE FUNCTION increment_entry_share_count();

-- =====================================================
-- USER ACTIVITY TRIGGERS
-- =====================================================

-- Update user activity on vote
DROP TRIGGER IF EXISTS trigger_update_activity_on_vote ON votes;
CREATE TRIGGER trigger_update_activity_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

-- Update user activity on comment
DROP TRIGGER IF EXISTS trigger_update_activity_on_comment ON comments;
CREATE TRIGGER trigger_update_activity_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

-- Update user activity on share
DROP TRIGGER IF EXISTS trigger_update_activity_on_share ON shares;
CREATE TRIGGER trigger_update_activity_on_share
  AFTER INSERT ON shares
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

-- Update user activity on entry submission
DROP TRIGGER IF EXISTS trigger_update_activity_on_entry ON entries;
CREATE TRIGGER trigger_update_activity_on_entry
  AFTER INSERT ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

-- =====================================================
-- COMPLETED
-- =====================================================
-- Next: Run 05-seed-data.sql (optional)
