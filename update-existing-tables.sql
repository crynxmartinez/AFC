-- ============================================
-- UPDATE EXISTING TABLES ONLY
-- For tables that already exist
-- ============================================

-- ============================================
-- UPDATE USERS TABLE - STARTING POINTS
-- ============================================
-- Change default points_balance to 1000 for new users
ALTER TABLE users
ALTER COLUMN points_balance SET DEFAULT 1000;

-- Give existing users with 0 points 1000 points (one-time)
UPDATE users
SET points_balance = 1000
WHERE points_balance = 0;

-- ============================================
-- NOTIFICATION TRIGGERS FOR FOLLOWS
-- ============================================

-- Trigger to create notification when someone follows you
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_username TEXT;
BEGIN
  -- Get follower's username
  SELECT username INTO v_follower_username
  FROM users
  WHERE id = NEW.follower_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    NEW.following_id,
    'follow',
    'New Follower',
    v_follower_username || ' started following you',
    '/users/' || v_follower_username
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_follow ON follows;
CREATE TRIGGER trigger_notify_on_follow
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION notify_on_follow();

-- ============================================
-- NOTIFICATION TRIGGERS FOR COMMENTS
-- ============================================

-- Trigger to create notification when someone comments on your entry
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_owner_id UUID;
  v_commenter_username TEXT;
  v_parent_comment_owner_id UUID;
BEGIN
  -- Get entry owner
  SELECT user_id INTO v_entry_owner_id
  FROM entries
  WHERE id = NEW.entry_id;
  
  -- Get commenter's username
  SELECT username INTO v_commenter_username
  FROM users
  WHERE id = NEW.user_id;
  
  -- If it's a reply, notify the parent comment owner
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_comment_owner_id
    FROM entry_comments
    WHERE id = NEW.parent_comment_id;
    
    -- Don't notify yourself
    IF v_parent_comment_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        v_parent_comment_owner_id,
        'comment_reply',
        'New Reply',
        v_commenter_username || ' replied to your comment',
        '/entries/' || NEW.entry_id::TEXT
      );
    END IF;
  END IF;
  
  -- Notify entry owner (if not commenting on own entry)
  IF v_entry_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      v_entry_owner_id,
      'comment',
      'New Comment',
      v_commenter_username || ' commented on your entry',
      '/entries/' || NEW.entry_id::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_comment ON entry_comments;
CREATE TRIGGER trigger_notify_on_comment
AFTER INSERT ON entry_comments
FOR EACH ROW
EXECUTE FUNCTION notify_on_comment();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_follower_count(UUID);
DROP FUNCTION IF EXISTS get_following_count(UUID);
DROP FUNCTION IF EXISTS is_following(UUID, UUID);
DROP FUNCTION IF EXISTS get_comment_count(UUID);

-- Function to get follower count
CREATE FUNCTION get_follower_count(p_user_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE following_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get following count
CREATE FUNCTION get_following_count(p_user_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE follower_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user A follows user B
CREATE FUNCTION is_following(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = p_follower_id 
    AND following_id = p_following_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get comment count for entry
CREATE FUNCTION get_comment_count(p_entry_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM entry_comments WHERE entry_id = p_entry_id);
END;
$$ LANGUAGE plpgsql;
