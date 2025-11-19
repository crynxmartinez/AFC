-- Fix RLS policy to allow user signup
-- This allows users to insert their own profile during registration

-- First, check if RLS is enabled
-- If you want to temporarily disable RLS for testing, uncomment the next line:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;
END $$;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to insert their own profile during signup
-- IMPORTANT: This uses auth.uid() which is the authenticated user's ID
CREATE POLICY "users_insert_own_profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to view their own profile
CREATE POLICY "users_select_own_profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "users_update_own_profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow public to view all user profiles (for leaderboard, artist pages, etc.)
CREATE POLICY "users_select_public"
ON users
FOR SELECT
TO public
USING (true);

-- Policy 5: Allow service role to do anything (for admin operations)
CREATE POLICY "users_all_service_role"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
