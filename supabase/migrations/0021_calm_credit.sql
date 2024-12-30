/*
  # Fix Profile System

  1. Changes
    - Add transaction management for profile operations
    - Add better error handling and retries
    - Add profile sync improvements
    - Fix race conditions
    - Add better validation

  2. Security
    - Maintain RLS policies
    - Secure function execution
*/

-- Function to sync auth user with profile
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS trigger AS $$
DECLARE
  retry_count int := 0;
  max_retries int := 3;
  backoff_time float;
BEGIN
  -- Validate input
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Attempt profile creation/update within a transaction
      INSERT INTO public.profiles (
        id,
        email,
        role,
        full_name,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        CASE 
          WHEN NEW.email LIKE 'demo.%@example.com' THEN 
            CASE 
              WHEN NEW.email = 'demo.admin@example.com' THEN 'admin'::user_role
              WHEN NEW.email = 'demo.processor@example.com' THEN 'processor'::user_role
              ELSE 'user'::user_role
            END
          ELSE 'user'::user_role
        END,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          split_part(NEW.email, '@', 1)
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
        updated_at = now()
      WHERE 
        profiles.id = EXCLUDED.id;

      -- Verify profile was created
      IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.id AND email = NEW.email
      ) THEN
        RETURN NEW;
      END IF;

      -- If verification fails, throw error to trigger retry
      RAISE EXCEPTION 'Profile verification failed';
      
    EXCEPTION WHEN others THEN
      -- Calculate exponential backoff
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log error
      RAISE WARNING 'Profile sync attempt % failed: %. Retrying in % seconds...', 
        retry_count + 1, SQLERRM, backoff_time;
      
      -- Increment counter
      retry_count := retry_count + 1;
      
      -- If retries remain, wait and continue
      IF retry_count < max_retries THEN
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      -- Log final error but don't block auth
      RAISE WARNING 'Profile sync failed after % attempts: %', max_retries, SQLERRM;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger for immediate profile sync
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Function to recover profile with improved error handling
CREATE OR REPLACE FUNCTION recover_profile()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
  retry_count int := 0;
  max_retries int := 3;
  backoff_time float;
  user_record record;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Verify authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user details first
  SELECT * INTO user_record 
  FROM auth.users 
  WHERE id = current_user_id;

  IF user_record IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Attempt recovery with retries
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Create/update profile within transaction
      INSERT INTO profiles (
        id,
        email,
        role,
        full_name,
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
        updated_at = now()
      WHERE 
        profiles.id = EXCLUDED.id;

      -- Verify profile was created/updated
      IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = current_user_id 
        AND email = user_record.email
      ) THEN
        RETURN;
      END IF;

      RAISE EXCEPTION 'Profile verification failed';
      
    EXCEPTION WHEN others THEN
      -- Calculate exponential backoff
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log error
      RAISE WARNING 'Profile recovery attempt % failed: %. Retrying in % seconds...', 
        retry_count + 1, SQLERRM, backoff_time;
      
      -- Increment counter
      retry_count := retry_count + 1;
      
      -- If retries remain, wait and continue
      IF retry_count < max_retries THEN
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      -- If all retries exhausted, raise final error
      RAISE EXCEPTION 'Profile recovery failed after % attempts: %', max_retries, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;