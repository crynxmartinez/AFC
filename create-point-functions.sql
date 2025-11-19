-- Create functions to manage user points safely
-- These functions handle incrementing/decrementing points with proper checks

-- Function to deduct points (for voting, reactions, etc.)
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
  IF current_balance < amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct points
  UPDATE users
  SET points_balance = points_balance - amount
  WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$$;

-- Function to add points (for refunds, rewards, etc.)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.deduct_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_points TO authenticated;
