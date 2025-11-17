-- Add new fields to users table for Settings page
ALTER TABLE users
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private'));

-- Add comment
COMMENT ON COLUMN users.display_name IS 'Optional full name or display name';
COMMENT ON COLUMN users.bio IS 'User biography/description';
COMMENT ON COLUMN users.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN users.twitter_url IS 'Twitter/X profile URL';
COMMENT ON COLUMN users.portfolio_url IS 'Portfolio website URL';
COMMENT ON COLUMN users.profile_visibility IS 'Profile visibility setting: public or private';
