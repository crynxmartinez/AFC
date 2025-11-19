-- Create a function to insert user profile that bypasses RLS
-- This runs with SECURITY DEFINER which uses the function owner's permissions

CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_username TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This is the key - runs as the function owner, not the caller
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
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_username,
    'user',
    0,
    0,
    0,
    1,
    NOW(),
    NOW()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;
