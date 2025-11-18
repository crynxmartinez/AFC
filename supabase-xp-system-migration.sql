-- ============================================
-- XP & LEVEL SYSTEM MIGRATION
-- Complete gamification system with admin control
-- ============================================

-- ============================================
-- LEVEL CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS level_config (
  level INT PRIMARY KEY,
  xp_required INT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
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

-- ============================================
-- XP REWARDS CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS xp_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT UNIQUE NOT NULL,
  xp_amount INT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default XP rewards
INSERT INTO xp_rewards (action_type, xp_amount, description) VALUES
  ('submit_entry', 50, 'Submit an entry to a contest'),
  ('get_reaction', 5, 'Receive a reaction on your entry'),
  ('get_comment', 10, 'Receive a comment on your entry'),
  ('win_first', 200, 'Win 1st place in a contest'),
  ('win_second', 150, 'Win 2nd place in a contest'),
  ('win_third', 100, 'Win 3rd place in a contest'),
  ('daily_login', 10, 'Login to your account'),
  ('complete_profile', 25, 'Complete your profile (one-time)'),
  ('follow_user', 2, 'Follow another user'),
  ('get_followed', 5, 'Get followed by another user'),
  ('leave_comment', 3, 'Leave a comment on an entry')
ON CONFLICT (action_type) DO NOTHING;

-- ============================================
-- LEVEL REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS level_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INT NOT NULL,
  reward_type TEXT NOT NULL, -- 'points', 'badge', 'feature', 'perk', 'multiplier'
  reward_value TEXT NOT NULL,
  description TEXT,
  auto_grant BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default level rewards
INSERT INTO level_rewards (level, reward_type, reward_value, description) VALUES
  -- Points rewards
  (5, 'points', '50', 'Bonus points for reaching Level 5'),
  (10, 'points', '100', 'Bonus points for reaching Level 10'),
  (15, 'points', '150', 'Bonus points for reaching Level 15'),
  (20, 'points', '250', 'Bonus points for reaching Level 20'),
  (25, 'points', '500', 'Bonus points for reaching Level 25'),
  (50, 'points', '2000', 'Bonus points for reaching Level 50'),
  
  -- Badge rewards
  (5, 'badge', 'novice_artist', 'Novice Artist Badge 🎨'),
  (10, 'badge', 'rising_star', 'Rising Star Badge ⭐'),
  (25, 'badge', 'master_artist', 'Master Artist Badge 👑'),
  (50, 'badge', 'legend', 'Legend Badge 💎'),
  
  -- XP Multiplier rewards
  (10, 'multiplier', '1.1', '+10% XP Bonus'),
  (20, 'multiplier', '1.2', '+20% XP Bonus'),
  (30, 'multiplier', '1.3', '+30% XP Bonus'),
  (50, 'multiplier', '1.5', '+50% XP Bonus')
ON CONFLICT DO NOTHING;

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  badge_description TEXT,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
ON user_badges FOR SELECT
USING (true);

CREATE POLICY "System can grant badges"
ON user_badges FOR INSERT
WITH CHECK (true);

-- ============================================
-- XP HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  xp_gained INT NOT NULL,
  description TEXT,
  reference_id UUID, -- entry_id, contest_id, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_xp_history_user ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_created ON xp_history(created_at DESC);

-- RLS
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP history"
ON xp_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can add XP history"
ON xp_history FOR INSERT
WITH CHECK (true);

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS xp_multiplier DECIMAL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS profile_title TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS vip_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_date DATE,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to award XP to a user
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_action_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
  xp_gained INT,
  new_total_xp INT,
  new_level INT,
  leveled_up BOOLEAN
) AS $$
DECLARE
  v_xp_amount INT;
  v_multiplier DECIMAL;
  v_final_xp INT;
  v_old_xp INT;
  v_new_xp INT;
  v_old_level INT;
  v_new_level INT;
  v_leveled_up BOOLEAN := false;
BEGIN
  -- Get XP amount for this action
  SELECT xp_amount INTO v_xp_amount
  FROM xp_rewards
  WHERE action_type = p_action_type AND enabled = true;
  
  IF v_xp_amount IS NULL THEN
    RAISE EXCEPTION 'Invalid action type: %', p_action_type;
  END IF;
  
  -- Get user's XP multiplier
  SELECT xp_multiplier INTO v_multiplier
  FROM users
  WHERE id = p_user_id;
  
  -- Calculate final XP with multiplier
  v_final_xp := FLOOR(v_xp_amount * v_multiplier);
  
  -- Get current XP and level
  SELECT xp, level INTO v_old_xp, v_old_level
  FROM users
  WHERE id = p_user_id;
  
  -- Add XP
  v_new_xp := v_old_xp + v_final_xp;
  
  -- Calculate new level
  SELECT COALESCE(MAX(level), 1) INTO v_new_level
  FROM level_config
  WHERE xp_required <= v_new_xp;
  
  -- Check if leveled up
  IF v_new_level > v_old_level THEN
    v_leveled_up := true;
  END IF;
  
  -- Update user
  UPDATE users
  SET xp = v_new_xp,
      level = v_new_level,
      profile_title = (SELECT title FROM level_config WHERE level = v_new_level)
  WHERE id = p_user_id;
  
  -- Record XP history
  INSERT INTO xp_history (user_id, action_type, xp_gained, description, reference_id)
  VALUES (p_user_id, p_action_type, v_final_xp, p_description, p_reference_id);
  
  -- If leveled up, grant level rewards
  IF v_leveled_up THEN
    PERFORM grant_level_rewards(p_user_id, v_new_level);
  END IF;
  
  -- Return results
  RETURN QUERY SELECT v_final_xp, v_new_xp, v_new_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql;

-- Function to grant level rewards
CREATE OR REPLACE FUNCTION grant_level_rewards(p_user_id UUID, p_level INT)
RETURNS VOID AS $$
DECLARE
  reward RECORD;
BEGIN
  FOR reward IN 
    SELECT * FROM level_rewards WHERE level = p_level AND auto_grant = true
  LOOP
    CASE reward.reward_type
      WHEN 'points' THEN
        -- Grant points
        UPDATE users
        SET points_balance = points_balance + reward.reward_value::INT
        WHERE id = p_user_id;
        
      WHEN 'badge' THEN
        -- Grant badge
        INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description)
        VALUES (p_user_id, reward.reward_value, reward.description, reward.description)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
      WHEN 'multiplier' THEN
        -- Update XP multiplier
        UPDATE users
        SET xp_multiplier = reward.reward_value::DECIMAL
        WHERE id = p_user_id;
        
      WHEN 'perk' THEN
        -- Grant VIP status or other perks
        IF reward.reward_value = 'vip' THEN
          UPDATE users
          SET vip_status = true
          WHERE id = p_user_id;
        END IF;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's progress to next level
CREATE OR REPLACE FUNCTION get_level_progress(p_user_id UUID)
RETURNS TABLE (
  current_level INT,
  current_xp INT,
  current_level_xp INT,
  next_level_xp INT,
  xp_to_next_level INT,
  progress_percentage INT
) AS $$
DECLARE
  v_user_xp INT;
  v_user_level INT;
  v_current_level_xp INT;
  v_next_level_xp INT;
BEGIN
  -- Get user's current XP and level
  SELECT xp, level INTO v_user_xp, v_user_level
  FROM users
  WHERE id = p_user_id;
  
  -- Get XP required for current level
  SELECT xp_required INTO v_current_level_xp
  FROM level_config
  WHERE level = v_user_level;
  
  -- Get XP required for next level
  SELECT xp_required INTO v_next_level_xp
  FROM level_config
  WHERE level = v_user_level + 1;
  
  -- If no next level, use current level XP
  IF v_next_level_xp IS NULL THEN
    v_next_level_xp := v_current_level_xp;
  END IF;
  
  RETURN QUERY SELECT
    v_user_level,
    v_user_xp,
    v_current_level_xp,
    v_next_level_xp,
    v_next_level_xp - v_user_xp AS xp_to_next,
    CASE 
      WHEN v_next_level_xp = v_current_level_xp THEN 100
      ELSE FLOOR(((v_user_xp - v_current_level_xp)::DECIMAL / (v_next_level_xp - v_current_level_xp)::DECIMAL) * 100)::INT
    END AS progress_pct;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE level_config IS 'Configuration for levels and XP requirements';
COMMENT ON TABLE xp_rewards IS 'XP rewards for different actions';
COMMENT ON TABLE level_rewards IS 'Rewards granted when reaching certain levels';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
COMMENT ON TABLE xp_history IS 'History of all XP gains';
COMMENT ON FUNCTION award_xp IS 'Awards XP to a user and handles level ups';
COMMENT ON FUNCTION grant_level_rewards IS 'Grants rewards when user levels up';
COMMENT ON FUNCTION get_level_progress IS 'Gets user progress to next level';
