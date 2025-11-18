-- ============================================
-- WINNER & PRIZE DISTRIBUTION SYSTEM
-- Automated winner selection based on votes
-- Prize pool distribution: 1st=50%, 2nd=20%, 3rd=10%, System=20%
-- ============================================

-- ============================================
-- UPDATE CONTESTS TABLE
-- ============================================
ALTER TABLE contests
ADD COLUMN IF NOT EXISTS prize_pool INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS prize_pool_distributed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS winner_1st_id UUID REFERENCES entries(id),
ADD COLUMN IF NOT EXISTS winner_2nd_id UUID REFERENCES entries(id),
ADD COLUMN IF NOT EXISTS winner_3rd_id UUID REFERENCES entries(id),
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP;

-- Add index for winner lookups
CREATE INDEX IF NOT EXISTS idx_contests_winners ON contests(winner_1st_id, winner_2nd_id, winner_3rd_id);

-- ============================================
-- CONTEST WINNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contest_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  placement INT NOT NULL CHECK (placement IN (1, 2, 3)),
  votes_received INT NOT NULL DEFAULT 0,
  prize_amount INT NOT NULL DEFAULT 0,
  awarded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(contest_id, placement)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contest_winners_contest ON contest_winners(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_winners_user ON contest_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_winners_entry ON contest_winners(entry_id);

-- RLS
ALTER TABLE contest_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view winners"
ON contest_winners FOR SELECT
USING (true);

CREATE POLICY "System can insert winners"
ON contest_winners FOR INSERT
WITH CHECK (true);

-- ============================================
-- PRIZE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prize_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  placement INT NOT NULL CHECK (placement IN (1, 2, 3)),
  prize_amount INT NOT NULL,
  awarded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prize_history_user ON prize_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prize_history_contest ON prize_history(contest_id);
CREATE INDEX IF NOT EXISTS idx_prize_history_awarded ON prize_history(awarded_at DESC);

-- RLS
ALTER TABLE prize_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prize history"
ON prize_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view all prize history"
ON prize_history FOR SELECT
USING (true);

CREATE POLICY "System can insert prize history"
ON prize_history FOR INSERT
WITH CHECK (true);

-- ============================================
-- FUNCTION: FINALIZE CONTEST & SELECT WINNERS
-- ============================================
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
  v_prize_pool INT;
  v_prize_1st INT;
  v_prize_2nd INT;
  v_prize_3rd INT;
  v_system_cut INT;
BEGIN
  -- Check if contest exists and has ended
  SELECT * INTO v_contest
  FROM contests
  WHERE id = p_contest_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Contest not found', NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  IF v_contest.status != 'ended' THEN
    RETURN QUERY SELECT false, 'Contest has not ended yet', NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  IF v_contest.prize_pool_distributed THEN
    RETURN QUERY SELECT false, 'Prizes already distributed', NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Get prize pool
  v_prize_pool := v_contest.prize_pool;
  
  IF v_prize_pool <= 0 THEN
    RETURN QUERY SELECT false, 'No prize pool to distribute', NULL::UUID, NULL::UUID, NULL::UUID, 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Calculate prize distribution
  v_prize_1st := FLOOR(v_prize_pool * 0.5); -- 50%
  v_prize_2nd := FLOOR(v_prize_pool * 0.2); -- 20%
  v_prize_3rd := FLOOR(v_prize_pool * 0.1); -- 10%
  v_system_cut := v_prize_pool - v_prize_1st - v_prize_2nd - v_prize_3rd; -- Remaining 20%
  
  -- Get top 3 entries by vote count
  SELECT e.id, e.user_id, e.phase_4_url, COUNT(r.id) as vote_count
  INTO v_winner_1st
  FROM entries e
  LEFT JOIN reactions r ON r.entry_id = e.id
  WHERE e.contest_id = p_contest_id AND e.status = 'approved'
  GROUP BY e.id, e.user_id, e.phase_4_url
  ORDER BY vote_count DESC
  LIMIT 1;
  
  -- Get 2nd place
  SELECT e.id, e.user_id, e.phase_4_url, COUNT(r.id) as vote_count
  INTO v_winner_2nd
  FROM entries e
  LEFT JOIN reactions r ON r.entry_id = e.id
  WHERE e.contest_id = p_contest_id 
    AND e.status = 'approved'
    AND e.id != COALESCE(v_winner_1st.id, '00000000-0000-0000-0000-000000000000'::UUID)
  GROUP BY e.id, e.user_id, e.phase_4_url
  ORDER BY vote_count DESC
  LIMIT 1;
  
  -- Get 3rd place
  SELECT e.id, e.user_id, e.phase_4_url, COUNT(r.id) as vote_count
  INTO v_winner_3rd
  FROM entries e
  LEFT JOIN reactions r ON r.entry_id = e.id
  WHERE e.contest_id = p_contest_id 
    AND e.status = 'approved'
    AND e.id != COALESCE(v_winner_1st.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND e.id != COALESCE(v_winner_2nd.id, '00000000-0000-0000-0000-000000000000'::UUID)
  GROUP BY e.id, e.user_id, e.phase_4_url
  ORDER BY vote_count DESC
  LIMIT 1;
  
  -- Award prizes to winners
  IF v_winner_1st.id IS NOT NULL THEN
    -- Update user points
    UPDATE users SET points_balance = points_balance + v_prize_1st WHERE id = v_winner_1st.user_id;
    
    -- Award XP
    PERFORM award_xp(v_winner_1st.user_id, 'win_first', p_contest_id, 'Won 1st place in contest');
    
    -- Record winner
    INSERT INTO contest_winners (contest_id, entry_id, user_id, placement, votes_received, prize_amount)
    VALUES (p_contest_id, v_winner_1st.id, v_winner_1st.user_id, 1, v_winner_1st.vote_count, v_prize_1st);
    
    -- Record prize history
    INSERT INTO prize_history (user_id, contest_id, entry_id, placement, prize_amount)
    VALUES (v_winner_1st.user_id, p_contest_id, v_winner_1st.id, 1, v_prize_1st);
  END IF;
  
  IF v_winner_2nd.id IS NOT NULL THEN
    UPDATE users SET points_balance = points_balance + v_prize_2nd WHERE id = v_winner_2nd.user_id;
    PERFORM award_xp(v_winner_2nd.user_id, 'win_second', p_contest_id, 'Won 2nd place in contest');
    
    INSERT INTO contest_winners (contest_id, entry_id, user_id, placement, votes_received, prize_amount)
    VALUES (p_contest_id, v_winner_2nd.id, v_winner_2nd.user_id, 2, v_winner_2nd.vote_count, v_prize_2nd);
    
    INSERT INTO prize_history (user_id, contest_id, entry_id, placement, prize_amount)
    VALUES (v_winner_2nd.user_id, p_contest_id, v_winner_2nd.id, 2, v_prize_2nd);
  END IF;
  
  IF v_winner_3rd.id IS NOT NULL THEN
    UPDATE users SET points_balance = points_balance + v_prize_3rd WHERE id = v_winner_3rd.user_id;
    PERFORM award_xp(v_winner_3rd.user_id, 'win_third', p_contest_id, 'Won 3rd place in contest');
    
    INSERT INTO contest_winners (contest_id, entry_id, user_id, placement, votes_received, prize_amount)
    VALUES (p_contest_id, v_winner_3rd.id, v_winner_3rd.user_id, 3, v_winner_3rd.vote_count, v_prize_3rd);
    
    INSERT INTO prize_history (user_id, contest_id, entry_id, placement, prize_amount)
    VALUES (v_winner_3rd.user_id, p_contest_id, v_winner_3rd.id, 3, v_prize_3rd);
  END IF;
  
  -- Update contest with winners
  UPDATE contests
  SET winner_1st_id = v_winner_1st.id,
      winner_2nd_id = v_winner_2nd.id,
      winner_3rd_id = v_winner_3rd.id,
      prize_pool_distributed = true,
      finalized_at = NOW()
  WHERE id = p_contest_id;
  
  -- Return results
  RETURN QUERY SELECT 
    true,
    'Winners selected and prizes distributed successfully',
    v_winner_1st.user_id,
    v_winner_2nd.user_id,
    v_winner_3rd.user_id,
    v_prize_1st,
    v_prize_2nd,
    v_prize_3rd,
    v_prize_pool;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: ADD VOTE AND UPDATE PRIZE POOL
-- ============================================
CREATE OR REPLACE FUNCTION add_vote_to_prize_pool()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment contest prize pool by 1 point per vote
  UPDATE contests
  SET prize_pool = prize_pool + 1
  WHERE id = (SELECT contest_id FROM entries WHERE id = NEW.entry_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reactions (votes)
DROP TRIGGER IF EXISTS trigger_add_vote_to_prize_pool ON reactions;
CREATE TRIGGER trigger_add_vote_to_prize_pool
AFTER INSERT ON reactions
FOR EACH ROW
EXECUTE FUNCTION add_vote_to_prize_pool();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE contest_winners IS 'Stores the top 3 winners for each contest';
COMMENT ON TABLE prize_history IS 'Historical record of all prizes awarded to users';
COMMENT ON FUNCTION finalize_contest_and_select_winners IS 'Automatically selects top 3 winners and distributes prize pool';
COMMENT ON FUNCTION add_vote_to_prize_pool IS 'Adds 1 point to contest prize pool for each vote';
