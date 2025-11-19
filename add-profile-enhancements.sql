-- Add profile enhancement columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[], -- Array of skill tags
ADD COLUMN IF NOT EXISTS specialties TEXT[], -- Array of art specialties
ADD COLUMN IF NOT EXISTS years_experience INT,
ADD COLUMN IF NOT EXISTS available_for_work BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_views INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_votes_received INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_rank INT; -- Best leaderboard rank achieved

-- Create user_achievements table for badges/achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'first_win', 'streak_7', 'top_10', etc.
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Create user_portfolio_items table for featured works
CREATE TABLE IF NOT EXISTS user_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user 
  ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_user 
  ON user_portfolio_items(user_id, display_order);

CREATE INDEX IF NOT EXISTS idx_users_skills 
  ON users USING GIN(skills);

CREATE INDEX IF NOT EXISTS idx_users_specialties 
  ON users USING GIN(specialties);

-- Function to update total votes received
CREATE OR REPLACE FUNCTION update_user_total_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET total_votes_received = total_votes_received + 1 
    WHERE id = (SELECT user_id FROM entries WHERE id = NEW.entry_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users 
    SET total_votes_received = GREATEST(0, total_votes_received - 1) 
    WHERE id = (SELECT user_id FROM entries WHERE id = OLD.entry_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update total votes
DROP TRIGGER IF EXISTS on_reaction_change ON reactions;
CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_votes();

-- RLS Policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own achievements"
  ON user_achievements FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view portfolio items"
  ON user_portfolio_items FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own portfolio"
  ON user_portfolio_items FOR ALL
  USING (auth.uid() = user_id);

-- Add some default achievements data
INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description)
SELECT DISTINCT user_id, 'first_entry', 'First Entry', 'Submitted your first contest entry'
FROM entries
WHERE NOT EXISTS (
  SELECT 1 FROM user_achievements 
  WHERE user_achievements.user_id = entries.user_id 
  AND achievement_type = 'first_entry'
)
ON CONFLICT (user_id, achievement_type) DO NOTHING;
