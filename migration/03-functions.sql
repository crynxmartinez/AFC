-- =====================================================
-- ARENA FOR CREATIVES - DATABASE FUNCTIONS
-- All database functions and stored procedures
-- =====================================================

-- =====================================================
-- UPDATE USER SHARE STATS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_share_stats(
  user_uuid UUID,
  share_date DATE
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_stats (user_id, stat_date, shares_made)
  VALUES (user_uuid, share_date, 1)
  ON CONFLICT (user_id, stat_date)
  DO UPDATE SET shares_made = user_stats.shares_made + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET LEVEL PROGRESS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_level_progress(user_uuid UUID)
RETURNS TABLE (
  current_level INT,
  current_xp INT,
  xp_for_current_level INT,
  xp_for_next_level INT,
  xp_progress INT,
  xp_needed INT,
  progress_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.level as current_level,
    u.total_xp as current_xp,
    COALESCE((SELECT xp_required FROM level_config WHERE level = u.level), 0) as xp_for_current_level,
    COALESCE((SELECT xp_required FROM level_config WHERE level = u.level + 1), u.total_xp) as xp_for_next_level,
    u.total_xp - COALESCE((SELECT xp_required FROM level_config WHERE level = u.level), 0) as xp_progress,
    COALESCE((SELECT xp_required FROM level_config WHERE level = u.level + 1), u.total_xp) - u.total_xp as xp_needed,
    CASE 
      WHEN COALESCE((SELECT xp_required FROM level_config WHERE level = u.level + 1), u.total_xp) - COALESCE((SELECT xp_required FROM level_config WHERE level = u.level), 0) = 0 THEN 100
      ELSE ROUND(
        ((u.total_xp - COALESCE((SELECT xp_required FROM level_config WHERE level = u.level), 0))::DECIMAL / 
        (COALESCE((SELECT xp_required FROM level_config WHERE level = u.level + 1), u.total_xp) - COALESCE((SELECT xp_required FROM level_config WHERE level = u.level), 0))::DECIMAL * 100)::DECIMAL,
        2
      )
    END as progress_percentage
  FROM users u
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AWARD XP FUNCTION
-- =====================================================

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
    v_xp_amount := 10; -- Default XP if action not found
  END IF;
  
  -- Get current XP and level
  SELECT total_xp, level INTO v_old_xp, v_old_level
  FROM users
  WHERE id = p_user_id;
  
  -- Add XP
  v_new_xp := v_old_xp + v_xp_amount;
  
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
  SET total_xp = v_new_xp,
      level = v_new_level
  WHERE id = p_user_id;
  
  -- Record XP transaction
  INSERT INTO xp_transactions (user_id, amount, action_type, reference_id, description)
  VALUES (p_user_id, v_xp_amount, p_action_type, p_reference_id, p_description);
  
  -- Return results
  RETURN QUERY SELECT v_xp_amount, v_new_xp, v_new_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INCREMENT ENTRY VOTE COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION increment_entry_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entries
  SET vote_count = vote_count + 1
  WHERE id = NEW.entry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DECREMENT ENTRY VOTE COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION decrement_entry_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entries
  SET vote_count = vote_count - 1
  WHERE id = OLD.entry_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INCREMENT ENTRY COMMENT COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION increment_entry_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entries
  SET comment_count = comment_count + 1
  WHERE id = NEW.entry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DECREMENT ENTRY COMMENT COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION decrement_entry_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entries
  SET comment_count = comment_count - 1
  WHERE id = OLD.entry_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INCREMENT ENTRY SHARE COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION increment_entry_share_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entries
  SET share_count = share_count + 1
  WHERE id = NEW.entry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE USER ACTIVITY
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_activity_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETED
-- =====================================================
-- Next: Run 04-triggers.sql
