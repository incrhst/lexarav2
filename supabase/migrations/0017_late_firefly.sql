/*
  # Improve Profile Recovery System

  1. Changes
    - Add better error handling for profile recovery
    - Add transaction management
    - Add logging for debugging
    - Add retry mechanism
    - Add validation checks

  2. Security
    - Maintain RLS policies
    - Secure function execution
*/

-- Improve profile recovery function with better error handling
CREATE OR REPLACE FUNCTION recover_user_profile(user_id uuid)
RETURNS void AS $$
DECLARE
  user_email text;
  user_meta jsonb;
  retry_count int := 0;
  max_retries int := 3;
BEGIN
  -- Get user details from auth.users with retry logic
  WHILE retry_count < max_retries LOOP
    BEGIN
      SELECT email, raw_user_meta_data INTO STRICT user_email, user_meta
      FROM auth.users
      WHERE id = user_id;
      
      EXIT; -- Success, exit loop
    EXCEPTION 
      WHEN NO_DATA_FOUND THEN
        -- Log attempt
        RAISE WARNING 'Attempt % of % to find user %', retry_count + 1, max_retries, user_id;
        
        IF retry_count + 1 = max_retries THEN
          RAISE EXCEPTION 'User not found after % attempts', max_retries;
        END IF;
        
        -- Wait briefly before retry (exponential backoff)
        PERFORM pg_sleep(power(2, retry_count)::int * 0.1);
        retry_count := retry_count + 1;
        CONTINUE;
      WHEN others THEN
        RAISE EXCEPTION 'Unexpected error finding user: %', SQLERRM;
    END;
  END LOOP;

  -- Validate email
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'Invalid email for user %', user_id;
  END IF;

  -- Insert or update profile within a transaction
  BEGIN
    INSERT INTO profiles (
      id,
      email,
      role,
      full_name,
      created_at,
      updated_at
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
      ),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      role = CASE 
        WHEN profiles.role = 'admin' THEN 'admin'::user_role
        ELSE EXCLUDED.role
      END,
      full_name = EXCLUDED.full_name,
      updated_at = now();

  EXCEPTION 
    WHEN others THEN
      RAISE EXCEPTION 'Error creating/updating profile: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve public recovery function
CREATE OR REPLACE FUNCTION public.recover_profile()
RETURNS void AS $$
BEGIN
  -- Validate authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Attempt recovery with error handling
  BEGIN
    PERFORM recover_user_profile(auth.uid());
  EXCEPTION 
    WHEN others THEN
      RAISE EXCEPTION 'Profile recovery failed: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to validate profile
CREATE OR REPLACE FUNCTION validate_profile(profile_id uuid)
RETURNS boolean AS $$
DECLARE
  is_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.id = profile_id
    AND p.email = u.email
  ) INTO is_valid;
  
  RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;