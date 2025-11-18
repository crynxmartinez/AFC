-- ============================================
-- CREATE ENTRY COMMENTS TABLE
-- ============================================

-- Create entry_comments table
CREATE TABLE IF NOT EXISTS entry_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES entry_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entry_comments_entry ON entry_comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_comments_user ON entry_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_entry_comments_parent ON entry_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_entry_comments_created ON entry_comments(created_at DESC);

-- RLS
ALTER TABLE entry_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entry_comments' 
    AND policyname = 'Anyone can view comments'
  ) THEN
    CREATE POLICY "Anyone can view comments"
    ON entry_comments FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entry_comments' 
    AND policyname = 'Authenticated users can comment'
  ) THEN
    CREATE POLICY "Authenticated users can comment"
    ON entry_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entry_comments' 
    AND policyname = 'Users can update their own comments'
  ) THEN
    CREATE POLICY "Users can update their own comments"
    ON entry_comments FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entry_comments' 
    AND policyname = 'Users can delete their own comments'
  ) THEN
    CREATE POLICY "Users can delete their own comments"
    ON entry_comments FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- NOTIFICATION TRIGGER FOR COMMENTS
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

-- Function to get comment count for entry
CREATE OR REPLACE FUNCTION get_comment_count(p_entry_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM entry_comments WHERE entry_id = p_entry_id);
END;
$$ LANGUAGE plpgsql;
