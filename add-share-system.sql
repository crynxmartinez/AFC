-- ============================================
-- SHARE SYSTEM MIGRATION
-- Adds social sharing functionality and tracking
-- ============================================

-- Step 1: Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES contests(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN (
    'facebook', 'twitter', 'instagram', 'tiktok', 
    'linkedin', 'pinterest', 'whatsapp', 'telegram', 
    'copy_link', 'download'
  )),
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create daily XP claims table
CREATE TABLE IF NOT EXISTS daily_xp_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL CHECK (claim_type IN (
    'login', 'comment', 'vote', 'share'
  )),
  claim_date DATE NOT NULL,
  xp_amount INTEGER NOT NULL DEFAULT 0,
  platform TEXT, -- For share claims, which platform was used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one claim per type per day
  UNIQUE(user_id, claim_type, claim_date)
);

-- Step 3: Add share_count to entries table
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Step 4: Add share tracking columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_share_date DATE;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shares_entry_id ON shares(entry_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON shares(platform);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(shared_at);
CREATE INDEX IF NOT EXISTS idx_shares_contest_id ON shares(contest_id);

CREATE INDEX IF NOT EXISTS idx_daily_xp_claims_user_id ON daily_xp_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_xp_claims_date ON daily_xp_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_daily_xp_claims_type ON daily_xp_claims(claim_type);

CREATE INDEX IF NOT EXISTS idx_entries_share_count ON entries(share_count) WHERE share_count > 0;

-- Step 6: Create function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(entry_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE entries
  SET share_count = share_count + 1
  WHERE id = entry_uuid;
END;
$$;

-- Step 7: Create function to update user share stats
CREATE OR REPLACE FUNCTION update_user_share_stats(user_uuid UUID, share_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_date DATE;
  current_streak INTEGER;
BEGIN
  -- Get user's last share date and current streak
  SELECT last_share_date, share_streak
  INTO last_date, current_streak
  FROM users
  WHERE id = user_uuid;
  
  -- Update total shares
  UPDATE users
  SET total_shares = total_shares + 1
  WHERE id = user_uuid;
  
  -- Update streak
  IF last_date IS NULL THEN
    -- First share ever
    UPDATE users
    SET share_streak = 1,
        last_share_date = share_date
    WHERE id = user_uuid;
  ELSIF last_date = share_date THEN
    -- Same day, no streak change
    UPDATE users
    SET last_share_date = share_date
    WHERE id = user_uuid;
  ELSIF last_date = share_date - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE users
    SET share_streak = share_streak + 1,
        last_share_date = share_date
    WHERE id = user_uuid;
  ELSE
    -- Streak broken, reset to 1
    UPDATE users
    SET share_streak = 1,
        last_share_date = share_date
    WHERE id = user_uuid;
  END IF;
END;
$$;

-- Step 8: Create function to check daily XP claim
CREATE OR REPLACE FUNCTION check_daily_xp_claim(
  user_uuid UUID,
  claim_type_param TEXT,
  claim_date_param DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claim_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM daily_xp_claims
    WHERE user_id = user_uuid
      AND claim_type = claim_type_param
      AND claim_date = claim_date_param
  ) INTO claim_exists;
  
  RETURN claim_exists;
END;
$$;

-- Step 9: Create function to record daily XP claim
CREATE OR REPLACE FUNCTION record_daily_xp_claim(
  user_uuid UUID,
  claim_type_param TEXT,
  claim_date_param DATE,
  xp_amount_param INTEGER,
  platform_param TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO daily_xp_claims (
    user_id,
    claim_type,
    claim_date,
    xp_amount,
    platform
  ) VALUES (
    user_uuid,
    claim_type_param,
    claim_date_param,
    xp_amount_param,
    platform_param
  )
  ON CONFLICT (user_id, claim_type, claim_date) DO NOTHING;
END;
$$;

-- Step 10: Create view for share analytics (admin use)
CREATE OR REPLACE VIEW share_analytics AS
SELECT 
  DATE(shared_at) as share_date,
  platform,
  COUNT(*) as share_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT entry_id) as unique_entries
FROM shares
GROUP BY DATE(shared_at), platform
ORDER BY share_date DESC, share_count DESC;

-- Step 11: Create view for top shared entries
CREATE OR REPLACE VIEW top_shared_entries AS
SELECT 
  e.id,
  e.title,
  e.phase_4_url,
  e.share_count,
  e.vote_count,
  u.username,
  u.display_name,
  c.title as contest_title
FROM entries e
JOIN users u ON e.user_id = u.id
JOIN contests c ON e.contest_id = c.id
WHERE e.share_count > 0
ORDER BY e.share_count DESC
LIMIT 100;

-- Step 12: Create view for user share stats
CREATE OR REPLACE VIEW user_share_stats AS
SELECT 
  u.id,
  u.username,
  u.total_shares,
  u.share_streak,
  u.last_share_date,
  COUNT(DISTINCT s.platform) as platforms_used,
  COUNT(DISTINCT DATE(s.shared_at)) as days_shared
FROM users u
LEFT JOIN shares s ON u.id = s.user_id
WHERE u.total_shares > 0
GROUP BY u.id, u.username, u.total_shares, u.share_streak, u.last_share_date
ORDER BY u.total_shares DESC;

-- Step 13: Enable Row Level Security (RLS)
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_xp_claims ENABLE ROW LEVEL SECURITY;

-- Step 14: Create RLS policies for shares
DROP POLICY IF EXISTS "Users can view all shares" ON shares;
CREATE POLICY "Users can view all shares"
  ON shares FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create their own shares" ON shares;
CREATE POLICY "Users can create their own shares"
  ON shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own shares" ON shares;
CREATE POLICY "Users can view their own shares"
  ON shares FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 15: Create RLS policies for daily_xp_claims
DROP POLICY IF EXISTS "Users can view their own claims" ON daily_xp_claims;
CREATE POLICY "Users can view their own claims"
  ON daily_xp_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own claims" ON daily_xp_claims;
CREATE POLICY "Users can create their own claims"
  ON daily_xp_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Step 16: Grant permissions
GRANT SELECT ON share_analytics TO authenticated;
GRANT SELECT ON top_shared_entries TO authenticated;
GRANT SELECT ON user_share_stats TO authenticated;

-- Step 17: Create trigger to update share count cache
CREATE OR REPLACE FUNCTION update_entry_share_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE entries
    SET share_count = share_count + 1
    WHERE id = NEW.entry_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE entries
    SET share_count = GREATEST(0, share_count - 1)
    WHERE id = OLD.entry_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_entry_share_count ON shares;
CREATE TRIGGER trigger_update_entry_share_count
  AFTER INSERT OR DELETE ON shares
  FOR EACH ROW
  EXECUTE FUNCTION update_entry_share_count();

-- Step 18: Backfill existing entries with share_count = 0
UPDATE entries
SET share_count = 0
WHERE share_count IS NULL;

-- Step 19: Backfill existing users with share stats
UPDATE users
SET total_shares = 0,
    share_streak = 0
WHERE total_shares IS NULL;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify the migration worked
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('shares', 'daily_xp_claims');

-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entries' 
  AND column_name = 'share_count';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('total_shares', 'share_streak', 'last_share_date');

-- Check if indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('shares', 'daily_xp_claims', 'entries')
  AND indexname LIKE 'idx_%';

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'increment_share_count',
    'update_user_share_stats',
    'check_daily_xp_claim',
    'record_daily_xp_claim'
  );

-- Check if views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN (
    'share_analytics',
    'top_shared_entries',
    'user_share_stats'
  );

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
