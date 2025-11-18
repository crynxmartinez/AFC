-- ============================================
-- MAKE USERNAME UNIQUE AND IMMUTABLE
-- Allow login with username or email
-- ============================================

-- Add unique constraint to username
ALTER TABLE users
ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Create index for faster username lookups (for login)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index for email lookups (for login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- FUNCTION TO PREVENT USERNAME CHANGES
-- ============================================
CREATE OR REPLACE FUNCTION prevent_username_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow username to be set on insert (first time)
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent username changes on update
  IF TG_OP = 'UPDATE' AND OLD.username IS DISTINCT FROM NEW.username THEN
    RAISE EXCEPTION 'Username cannot be changed after registration';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent username changes
DROP TRIGGER IF EXISTS trigger_prevent_username_change ON users;
CREATE TRIGGER trigger_prevent_username_change
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_username_change();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON CONSTRAINT users_username_unique ON users IS 'Ensures usernames are unique across the platform';
COMMENT ON FUNCTION prevent_username_change IS 'Prevents users from changing their username after registration';
