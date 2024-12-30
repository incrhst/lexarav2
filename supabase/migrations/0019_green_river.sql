/*
  # Improve Profile System

  1. Changes
    - Add transaction management for profile operations
    - Add better validation
    - Add profile sync mechanism
    - Add profile recovery improvements
    - Add better error messages

  2. Security
    - Maintain RLS policies
    - Secure function execution
*/

-- Function to sync auth user with profile
CREATE OR REPLACE FUNCTION sync_user_profile(user_id uuid)
RETURNS void AS $$
DECLARE
  user_record record;
BEGIN
  -- Get user details with retry logic
  FOR i IN 1..3 LOOP
    BEGIN
      SELECT id, email, raw_user_meta_data 
      INTO STRICT user_record
      FROM auth.users
      WHERE id = user_id;
      
      EXIT; -- Success, exit loop
    EXCEPTION 
      WHEN NO_DATA_FOUND THEN
        IF i = 3 THEN
          RAISE EXCEPTION 'User not found after 3 attempts';
        END IF;
        PERFORM pg_sleep(0.1 * i); -- Exponential backoff
        CONTINUE;
    END;
  END LOOP;

  -- Update or create profile within transaction
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
      user_record.id,
      user_record.email,
      CASE 
        WHEN user_record.email LIKE 'demo.%@example.com' THEN 
          CASE 
            WHEN user_record.email = 'demo.admin@example.com' THEN 'admin'::user_role
            WHEN user_record.email = 'demo.processor@example.com' THEN 'processor'::user_role
            ELSE 'user'::user_role
          END
        ELSE 'user'::user_role
      END,
      COALESCE(
        user_record.raw_user_meta_data->>'full_name',
        split_part(user_record.email, '@', 1)
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
      RAISE EXCEPTION 'Failed to sync profile: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate profile integrity
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
    AND p.email IS NOT NULL
    AND p.email != ''
  ) INTO is_valid;
  
  RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recover profile with validation
CREATE OR REPLACE FUNCTION recover_user_profile(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Attempt profile sync with transaction
  BEGIN
    PERFORM sync_user_profile(user_id);
    
    -- Validate result
    IF NOT validate_profile(user_id) THEN
      RAISE EXCEPTION 'Profile validation failed after recovery';
    END IF;
  EXCEPTION 
    WHEN others THEN
      RAISE EXCEPTION 'Profile recovery failed: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public recovery function with improved error handling
CREATE OR REPLACE FUNCTION public.recover_profile()
RETURNS void AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Attempt recovery with retries
  FOR i IN 1..3 LOOP
    BEGIN
      PERFORM recover_user_profile(auth.uid());
      RETURN;
    EXCEPTION 
      WHEN others THEN
        IF i = 3 THEN
          RAISE EXCEPTION 'Profile recovery failed after 3 attempts: %', SQLERRM;
        END IF;
        PERFORM pg_sleep(0.1 * i);
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improved trigger function for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Attempt profile sync with retries
  FOR i IN 1..3 LOOP
    BEGIN
      PERFORM sync_user_profile(NEW.id);
      
      -- Validate profile was created correctly
      IF validate_profile(NEW.id) THEN
        EXIT; -- Success
      END IF;
      
      IF i = 3 THEN
        RAISE WARNING 'Profile validation failed after creation';
      END IF;
    EXCEPTION 
      WHEN others THEN
        IF i = 3 THEN
          RAISE WARNING 'Failed to create profile after 3 attempts: %', SQLERRM;
        END IF;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();