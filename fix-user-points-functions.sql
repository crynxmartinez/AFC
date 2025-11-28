-- =====================================================
-- FIX USER POINTS FUNCTIONS
-- Run this to ensure all point-related functions exist
-- =====================================================

-- =====================================================
-- CREATE USER PROFILE FUNCTION
-- Used during signup to create user with starting points
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_username TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    username,
    role,
    points_balance,
    total_spent,
    xp,
    level,
    total_xp,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_username,
    'user',
    100,  -- Starting points for new users (100 free votes)
    0,
    0,
    1,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate errors
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- =====================================================
-- DEDUCT POINTS FUNCTION
-- Used for voting/reactions (costs 1 point per vote)
-- =====================================================

CREATE OR REPLACE FUNCTION public.deduct_points(
  user_id_param UUID,
  amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT points_balance INTO current_balance
  FROM users
  WHERE id = user_id_param;
  
  -- Check if user has enough points
  IF current_balance IS NULL OR current_balance < amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct points
  UPDATE users
  SET points_balance = points_balance - amount
  WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_points TO authenticated;

-- =====================================================
-- ADD POINTS FUNCTION
-- Used for refunds, rewards, prize distribution
-- =====================================================

CREATE OR REPLACE FUNCTION public.add_points(
  user_id_param UUID,
  amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET points_balance = points_balance + amount
  WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_points TO authenticated;

-- =====================================================
-- VERIFY FUNCTIONS EXIST
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'All point functions created/updated successfully!';
  RAISE NOTICE 'New users will receive 100 starting points.';
  RAISE NOTICE 'Voting costs 1 point per reaction.';
END $$;
