-- ============================================
-- SOCIAL FEATURES MIGRATION
-- Reactions, Comments, Follows, Notifications
-- ============================================

-- Add notification preferences to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notify_reactions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_artist_contests BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_contests_joined BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_contests_won BOOLEAN DEFAULT true;

-- ============================================
-- REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow', 'sad', 'angry', 'celebrate')),
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, entry_id)
);

-- Indexes for reactions
CREATE INDEX IF NOT EXISTS idx_reactions_entry ON reactions(entry_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- RLS policies for reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
ON reactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add reactions"
ON reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON reactions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
ON reactions FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited BOOLEAN DEFAULT false,
  edited_at timestamp,
  created_at timestamp DEFAULT now()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_entry ON comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);

-- RLS policies for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- RLS policies for follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
ON follows FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can follow"
ON follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON follows FOR DELETE
USING (auth.uid() = follower_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reaction', 'comment', 'artist_contest', 'reply')),
  actor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE,
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get reaction counts for an entry
CREATE OR REPLACE FUNCTION get_reaction_counts(entry_uuid uuid)
RETURNS TABLE (
  reaction_type TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.reaction_type, COUNT(*)::BIGINT
  FROM reactions r
  WHERE r.entry_id = entry_uuid
  GROUP BY r.reaction_type;
END;
$$ LANGUAGE plpgsql;

-- Function to get total reaction count for an entry
CREATE OR REPLACE FUNCTION get_total_reactions(entry_uuid uuid)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM reactions WHERE entry_id = entry_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_uuid uuid)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE following_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_uuid uuid)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE follower_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get contests joined count
CREATE OR REPLACE FUNCTION get_contests_joined(user_uuid uuid)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT contest_id) FROM entries WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get contests won count (top 3 in ended contests)
CREATE OR REPLACE FUNCTION get_contests_won(user_uuid uuid)
RETURNS BIGINT AS $$
DECLARE
  win_count BIGINT := 0;
  contest_record RECORD;
  entry_record RECORD;
  rank_position INT;
BEGIN
  -- Loop through all ended contests
  FOR contest_record IN 
    SELECT id FROM contests WHERE status = 'ended'
  LOOP
    rank_position := 0;
    -- Get top 3 entries for this contest
    FOR entry_record IN
      SELECT e.user_id, COUNT(r.id) as vote_count
      FROM entries e
      LEFT JOIN reactions r ON e.id = r.entry_id
      WHERE e.contest_id = contest_record.id
      GROUP BY e.id, e.user_id
      ORDER BY vote_count DESC
      LIMIT 3
    LOOP
      rank_position := rank_position + 1;
      IF entry_record.user_id = user_uuid THEN
        win_count := win_count + 1;
        EXIT; -- Found user in top 3, move to next contest
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN win_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE reactions IS 'Stores user reactions (like, love, etc.) on entries';
COMMENT ON TABLE comments IS 'Stores comments and replies on entries';
COMMENT ON TABLE follows IS 'Stores user follow relationships';
COMMENT ON TABLE notifications IS 'Stores user notifications';
COMMENT ON COLUMN users.notify_reactions IS 'Notify when someone reacts to user entries';
COMMENT ON COLUMN users.notify_comments IS 'Notify when someone comments on user entries';
COMMENT ON COLUMN users.notify_artist_contests IS 'Notify when followed artists join contests';
COMMENT ON COLUMN users.show_contests_joined IS 'Show contests joined count on profile';
COMMENT ON COLUMN users.show_contests_won IS 'Show contests won count on profile';
