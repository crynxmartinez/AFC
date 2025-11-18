-- Fix the get_level_progress function to return INT instead of NUMERIC
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
