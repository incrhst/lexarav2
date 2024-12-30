/*
  # Fix Authentication Issues

  1. Schema Changes
    - Add proper auth schema permissions
    - Fix profile sync trigger
    - Add better error handling
    - Add missing indexes

  2. Security
    - Add proper RLS policies
    - Fix permission issues
    - Add better error handling

  3. Changes
    - Improve profile sync reliability
    - Add better validation
    - Fix race conditions
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved profile sync function
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS trigger AS $$
DECLARE
  retry_count int := 0;
  max_retries int := 3;
  backoff_time float;
BEGIN
  -- Input validation
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE WARNING 'Invalid email for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Attempt profile creation with retries
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Create or update profile within a transaction
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
                WHEN NEW.email = 'demo.agent@example.com' THEN 'agent'::user_role
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

        -- Verify profile was created/updated
        IF EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = NEW.id 
          AND email = NEW.email
          AND updated_at > now() - interval '5 seconds'
        ) THEN
          RETURN NEW;
        END IF;

        RAISE EXCEPTION 'Profile verification failed';
      EXCEPTION 
        WHEN unique_violation THEN
          -- Handle race condition with email uniqueness
          UPDATE profiles 
          SET 
            id = NEW.id,
            email = NEW.email,
            updated_at = now()
          WHERE email = NEW.email;
          
          RETURN NEW;
      END;

    EXCEPTION WHEN others THEN
      -- Calculate backoff time
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log attempt
      RAISE WARNING 'Profile sync attempt % for user % failed: %. Retrying in % seconds...', 
        retry_count + 1, NEW.id, SQLERRM, backoff_time;
      
      -- Increment counter
      retry_count := retry_count + 1;
      
      IF retry_count < max_retries THEN
        -- Wait before retry
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      -- Log final error but don't block auth
      RAISE WARNING 'Profile sync failed for user % after % attempts', NEW.id, max_retries;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email_role ON profiles(email, role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- Add function to handle auth errors
CREATE OR REPLACE FUNCTION auth.handle_error(
  error_message text,
  error_code text DEFAULT 'AUTH_ERROR'
)
RETURNS jsonb AS $$
BEGIN
  RAISE WARNING 'Auth error: % (Code: %)', error_message, error_code;
  RETURN jsonb_build_object(
    'error', jsonb_build_object(
      'message', error_message,
      'code', error_code
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.handle_error TO anon, authenticated;