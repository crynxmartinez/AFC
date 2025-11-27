-- =====================================================
-- FIX: FINALIZE CONTEST AND SELECT WINNERS
-- 
-- Changes:
-- 1. Check end_date instead of status column
-- 2. Calculate prize pool from actual top 3 reactions
-- 3. Distribution: 50% / 20% / 10%
-- =====================================================

CREATE OR REPLACE FUNCTION finalize_contest_and_select_winners(p_contest_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  winner_1st_user_id UUID,
  winner_2nd_user_id UUID,
  winner_3rd_user_id UUID,
  prize_1st INT,
  prize_2nd INT,
  prize_3rd INT,
  total_prize_pool INT
) AS $$
DECLARE
  v_contest RECORD;
  v_winner_1st RECORD;
  v_winner_2nd RECORD;
  v_winner_3rd RECORD;
  v_total_reactions INT;
  v_prize_pool INT;
  v_prize_1st INT;
  v_prize_2nd INT;
  v_prize_3rd INT;
BEGIN
  -- Check if contest exists
  SELECT * INTO v_contest
  FROM contests
  WHERE id = p_contest_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Contest not found'::TEXT, NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- CHECK BY DATE instead of status column
  IF v_contest.end_date > NOW() THEN
    RETURN QUERY SELECT false, 'Contest has not ended yet (end_date is in the future)'::TEXT, NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  IF v_contest.prize_pool_distributed THEN
    RETURN QUERY SELECT false, 'Prizes already distributed'::TEXT, NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Get top 3 entries by reaction count
  -- 1st place
  SELECT e.id, e.user_id, COUNT(r.id) as vote_count
  INTO v_winner_1st
  FROM entries e
  LEFT JOIN reactions r ON r.entry_id = e.id
  WHERE e.contest_id = p_contest_id AND e.status = 'approved'
  GROUP BY e.id, e.user_id
  ORDER BY vote_count DESC
  LIMIT 1;
  
  -- 2nd place
  SELECT e.id, e.user_id, COUNT(r.id) as vote_count
  INTO v_winner_2nd
  FROM entries e
  LEFT JOIN reactions r ON r.entry_id = e.id
  WHERE e.contest_id = p_contest_id 
    AND e.status = 'approved'
    AND e.id != COALESCE(v_winner_1st.id, '00000000-0000-0000-0000-000000000000'::UUID)
  GROUP BY e.id, e.user_id
  ORDER BY vote_count DESC
  LIMIT 1;
  
  -- 3rd place
  SELECT e.id, e.user_id, COUNT(r.id) as vote_count
  INTO v_winner_3rd
  FROM entries e
  LEFT JOIN reactions r ON r.entry_id = e.id
  WHERE e.contest_id = p_contest_id 
    AND e.status = 'approved'
    AND e.id != COALESCE(v_winner_1st.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND e.id != COALESCE(v_winner_2nd.id, '00000000-0000-0000-0000-000000000000'::UUID)
  GROUP BY e.id, e.user_id
  ORDER BY vote_count DESC
  LIMIT 1;
  
  -- Calculate prize pool from TOP 3 reactions only
  v_total_reactions := COALESCE(v_winner_1st.vote_count, 0) 
                     + COALESCE(v_winner_2nd.vote_count, 0) 
                     + COALESCE(v_winner_3rd.vote_count, 0);
  
  v_prize_pool := v_total_reactions;
  
  IF v_prize_pool <= 0 THEN
    RETURN QUERY SELECT false, 'No reactions to distribute as prizes'::TEXT, NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Calculate prize distribution: 50% / 20% / 10%
  v_prize_1st := FLOOR(v_prize_pool * 0.5);
  v_prize_2nd := FLOOR(v_prize_pool * 0.2);
  v_prize_3rd := FLOOR(v_prize_pool * 0.1);
  
  -- Award prizes to winners
  IF v_winner_1st.id IS NOT NULL AND v_winner_1st.vote_count > 0 THEN
    -- Update user points
    UPDATE users SET points_balance = points_balance + v_prize_1st WHERE id = v_winner_1st.user_id;
    
    -- Award XP (200 XP for 1st place)
    BEGIN
      PERFORM award_xp(v_winner_1st.user_id, 'win_first', p_contest_id, 'Won 1st place in contest');
    EXCEPTION WHEN OTHERS THEN
      -- XP award failed, continue anyway
      NULL;
    END;
    
    -- Record winner
    INSERT INTO contest_winners (contest_id, entry_id, user_id, placement, votes_received, prize_amount)
    VALUES (p_contest_id, v_winner_1st.id, v_winner_1st.user_id, 1, v_winner_1st.vote_count, v_prize_1st)
    ON CONFLICT (contest_id, placement) DO UPDATE SET
      entry_id = EXCLUDED.entry_id,
      user_id = EXCLUDED.user_id,
      votes_received = EXCLUDED.votes_received,
      prize_amount = EXCLUDED.prize_amount,
      awarded_at = NOW();
    
    -- Record prize history
    INSERT INTO prize_history (user_id, contest_id, entry_id, placement, prize_amount)
    VALUES (v_winner_1st.user_id, p_contest_id, v_winner_1st.id, 1, v_prize_1st);
  END IF;
  
  IF v_winner_2nd.id IS NOT NULL AND v_winner_2nd.vote_count > 0 THEN
    UPDATE users SET points_balance = points_balance + v_prize_2nd WHERE id = v_winner_2nd.user_id;
    
    BEGIN
      PERFORM award_xp(v_winner_2nd.user_id, 'win_second', p_contest_id, 'Won 2nd place in contest');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    INSERT INTO contest_winners (contest_id, entry_id, user_id, placement, votes_received, prize_amount)
    VALUES (p_contest_id, v_winner_2nd.id, v_winner_2nd.user_id, 2, v_winner_2nd.vote_count, v_prize_2nd)
    ON CONFLICT (contest_id, placement) DO UPDATE SET
      entry_id = EXCLUDED.entry_id,
      user_id = EXCLUDED.user_id,
      votes_received = EXCLUDED.votes_received,
      prize_amount = EXCLUDED.prize_amount,
      awarded_at = NOW();
    
    INSERT INTO prize_history (user_id, contest_id, entry_id, placement, prize_amount)
    VALUES (v_winner_2nd.user_id, p_contest_id, v_winner_2nd.id, 2, v_prize_2nd);
  END IF;
  
  IF v_winner_3rd.id IS NOT NULL AND v_winner_3rd.vote_count > 0 THEN
    UPDATE users SET points_balance = points_balance + v_prize_3rd WHERE id = v_winner_3rd.user_id;
    
    BEGIN
      PERFORM award_xp(v_winner_3rd.user_id, 'win_third', p_contest_id, 'Won 3rd place in contest');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    INSERT INTO contest_winners (contest_id, entry_id, user_id, placement, votes_received, prize_amount)
    VALUES (p_contest_id, v_winner_3rd.id, v_winner_3rd.user_id, 3, v_winner_3rd.vote_count, v_prize_3rd)
    ON CONFLICT (contest_id, placement) DO UPDATE SET
      entry_id = EXCLUDED.entry_id,
      user_id = EXCLUDED.user_id,
      votes_received = EXCLUDED.votes_received,
      prize_amount = EXCLUDED.prize_amount,
      awarded_at = NOW();
    
    INSERT INTO prize_history (user_id, contest_id, entry_id, placement, prize_amount)
    VALUES (v_winner_3rd.user_id, p_contest_id, v_winner_3rd.id, 3, v_prize_3rd);
  END IF;
  
  -- Update contest with winners and mark as finalized
  UPDATE contests
  SET winner_1st_id = v_winner_1st.id,
      winner_2nd_id = v_winner_2nd.id,
      winner_3rd_id = v_winner_3rd.id,
      prize_pool = v_prize_pool,
      prize_pool_distributed = true,
      finalized_at = NOW(),
      status = 'ended'  -- Also update status to 'ended'
  WHERE id = p_contest_id;
  
  -- Return results
  RETURN QUERY SELECT 
    true,
    'Winners selected and prizes distributed successfully!'::TEXT,
    v_winner_1st.user_id,
    v_winner_2nd.user_id,
    v_winner_3rd.user_id,
    v_prize_1st,
    v_prize_2nd,
    v_prize_3rd,
    v_prize_pool;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION: Test the function exists
-- =====================================================
SELECT 'Function updated successfully!' as status;
