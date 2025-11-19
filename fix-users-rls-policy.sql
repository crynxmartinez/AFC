-- Fix RLS policy to allow user signup
-- This allows users to insert their own profile during registration

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON users;

-- Allow users to insert their own profile during signup
-- This policy allows INSERT when the user_id matches the authenticated user's ID
CREATE POLICY "Enable insert for authenticated users during signup"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also ensure users can read their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow public to view user profiles (for artist pages, leaderboard, etc.)
DROP POLICY IF EXISTS "Public can view user profiles" ON users;
CREATE POLICY "Public can view user profiles"
ON users
FOR SELECT
TO public
USING (true);
