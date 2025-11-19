-- TEMPORARY FIX: Disable RLS on users table
-- This will allow signups to work while we debug the policy issue
-- WARNING: This removes security restrictions, use only for testing!

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- To re-enable later, run:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
