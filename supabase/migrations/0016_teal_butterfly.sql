/*
  # Profile Creation Recovery

  1. Changes
    - Add function to recover missing profiles
    - Improve profile creation trigger
    - Add better error handling
    - Add profile recovery RPC function

  2. Security
    - Maintain RLS policies
    - Secure function execution
*/

-- Function to recover or create missing profile
CREATE OR REPLACE FUNCTION recover_user_profile(user_id uuid)
RETURNS void AS $$
DECLARE
  user_email text;
  user_meta jsonb;
BEGIN
  -- Get user details from auth.users
  SELECT email, raw_user_meta_data INTO user_email, user_meta
  FROM auth.users
  WHERE id = user_id;

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Insert or update profile
  INSERT INTO profiles (
    id,
    email,
    role,
    full_name
  )
  VALUES (
    user_id,
    user_email,
    CASE 
      WHEN user_email LIKE 'demo.%@example.com' THEN 
        CASE 
          WHEN user_email = 'demo.admin@example.com' THEN 'admin'::user_role
          WHEN user_email = 'demo.processor@example.com' THEN 'processor'::user_role
          ELSE 'user'::user_role
        END
      ELSE 'user'::user_role
    END,
    COALESCE(
      user_meta->>'full_name',
      split_part(user_email, '@', 1)
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role = CASE 
      WHEN profiles.role = 'admin' THEN 'admin'::user_role  -- Preserve admin role
      ELSE EXCLUDED.role
    END,
    full_name = EXCLUDED.full_name,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expose recovery function via RPC
CREATE OR REPLACE FUNCTION public.recover_profile()
RETURNS void AS $$
BEGIN
  -- Only allow authenticated users to recover their own profile
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  PERFORM recover_user_profile(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile with better error handling
  BEGIN
    PERFORM recover_user_profile(NEW.id);
  EXCEPTION WHEN others THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();