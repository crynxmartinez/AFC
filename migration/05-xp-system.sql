-- =====================================================
-- ARENA FOR CREATIVES - XP SYSTEM CONFIGURATION
-- Level config and XP rewards
-- =====================================================

-- =====================================================
-- LEVEL CONFIGURATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS level_config (
  level INT PRIMARY KEY,
  xp_required INT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default levels (1-100) with linear progression
DO $$
BEGIN
  FOR i IN 1..100 LOOP
    INSERT INTO level_config (level, xp_required, title)
    VALUES (
      i,
      (i - 1) * 100, -- Linear: Level 1 = 0, Level 2 = 100, Level 3 = 200, etc.
      CASE 
        WHEN i <= 4 THEN 'Beginner'
        WHEN i <= 9 THEN 'Apprentice'
        WHEN i <= 19 THEN 'Artist'
        WHEN i <= 29 THEN 'Expert Artist'
        WHEN i <= 49 THEN 'Master Artist'
        ELSE 'Legend'
      END
    )
    ON CONFLICT (level) DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- XP REWARDS CONFIGURATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS xp_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT UNIQUE NOT NULL,
  xp_amount INT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default XP rewards
INSERT INTO xp_rewards (action_type, xp_amount, description) VALUES
  ('submit_entry', 50, 'Submit an entry to a contest'),
  ('get_reaction', 5, 'Receive a reaction on your entry'),
  ('get_comment', 10, 'Receive a comment on your entry'),
  ('get_vote', 5, 'Receive a vote on your entry'),
  ('share_entry', 10, 'Share an entry'),
  ('win_first', 200, 'Win 1st place in a contest'),
  ('win_second', 150, 'Win 2nd place in a contest'),
  ('win_third', 100, 'Win 3rd place in a contest'),
  ('daily_login', 10, 'Login to your account'),
  ('complete_profile', 25, 'Complete your profile (one-time)'),
  ('leave_comment', 3, 'Leave a comment on an entry')
ON CONFLICT (action_type) DO NOTHING;

-- =====================================================
-- RLS POLICIES FOR XP TABLES
-- =====================================================

ALTER TABLE level_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_rewards ENABLE ROW LEVEL SECURITY;

-- Everyone can view level config
CREATE POLICY "Level config is viewable by everyone"
  ON level_config FOR SELECT
  USING (true);

-- Everyone can view XP rewards
CREATE POLICY "XP rewards are viewable by everyone"
  ON xp_rewards FOR SELECT
  USING (true);

-- =====================================================
-- COMPLETED
-- =====================================================
-- XP system configured!
