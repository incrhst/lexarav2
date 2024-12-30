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
  WHILE retry_count < max_retries LOOP
    BEGIN
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

      -- If we get here, the operation succeeded
      RETURN NEW;
      
    EXCEPTION WHEN others THEN
      -- Calculate exponential backoff time
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log the error
      RAISE WARNING 'Profile sync attempt % failed: %. Retrying in % seconds...', 
        retry_count + 1, SQLERRM, backoff_time;
      
      -- Increment retry counter
      retry_count := retry_count + 1;
      
      -- If we haven't exceeded max retries, wait and try again
      IF retry_count < max_retries THEN
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      -- If we've exhausted retries, log final error but don't block auth
      RAISE WARNING 'Profile sync failed after % attempts: %', max_retries, SQLERRM;
      RETURN NEW;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger with immediate sync
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Function to recover profile
CREATE OR REPLACE FUNCTION recover_profile()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
  retry_count int := 0;
  max_retries int := 3;
  backoff_time float;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Verify authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Attempt recovery with retries
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Get user details and sync profile
      WITH user_data AS (
        SELECT 
          id,
          email,
          raw_user_meta_data,
          CASE 
            WHEN email LIKE 'demo.%@example.com' THEN 
              CASE 
                WHEN email = 'demo.admin@example.com' THEN 'admin'::user_role
                WHEN email = 'demo.processor@example.com' THEN 'processor'::user_role
                ELSE 'user'::user_role
              END
            ELSE 'user'::user_role
          END as determined_role
        FROM auth.users
        WHERE id = current_user_id
      )
      INSERT INTO profiles (
        id,
        email,
        role,
        full_name,
        updated_at
      )
      SELECT
        id,
        email,
        determined_role,
        COALESCE(
          raw_user_meta_data->>'full_name',
          split_part(email, '@', 1)
        ),
        now()
      FROM user_data
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

      -- If we get here, recovery succeeded
      RETURN;
      
    EXCEPTION WHEN others THEN
      -- Calculate exponential backoff time
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log the error
      RAISE WARNING 'Profile recovery attempt % failed: %. Retrying in % seconds...', 
        retry_count + 1, SQLERRM, backoff_time;
      
      -- Increment retry counter
      retry_count := retry_count + 1;
      
      -- If we haven't exceeded max retries, wait and try again
      IF retry_count < max_retries THEN
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      -- If we've exhausted retries, raise final error
      RAISE EXCEPTION 'Profile recovery failed after % attempts: %', max_retries, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;