-- Improve profile sync with better error handling and validation
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

-- Improve profile recovery with better validation
CREATE OR REPLACE FUNCTION recover_profile()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
  user_record record;
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

  -- Get user details with retries
  WHILE retry_count < max_retries LOOP
    BEGIN
      SELECT * INTO STRICT user_record 
      FROM auth.users 
      WHERE id = current_user_id;

      -- If we got here, we found the user
      EXIT;

    EXCEPTION WHEN NO_DATA_FOUND THEN
      -- Calculate backoff time
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log attempt
      RAISE WARNING 'User lookup attempt % failed. Retrying in % seconds...', 
        retry_count + 1, backoff_time;
      
      -- Increment counter
      retry_count := retry_count + 1;
      
      IF retry_count < max_retries THEN
        -- Wait before retry
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      RAISE EXCEPTION 'User not found after % attempts', max_retries;
    END;
  END LOOP;

  -- Reset retry counter for profile operation
  retry_count := 0;

  -- Attempt profile creation/update
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Try to update existing profile first
      UPDATE profiles 
      SET
        email = user_record.email,
        role = CASE 
          WHEN profiles.role = 'admin' THEN 'admin'::user_role
          WHEN user_record.email LIKE 'demo.%@example.com' THEN 
            CASE 
              WHEN user_record.email = 'demo.admin@example.com' THEN 'admin'::user_role
              WHEN user_record.email = 'demo.processor@example.com' THEN 'processor'::user_role
              ELSE 'user'::user_role
            END
          ELSE 'user'::user_role
        END,
        full_name = COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          split_part(user_record.email, '@', 1)
        ),
        updated_at = now()
      WHERE id = user_record.id;

      -- If no rows were updated, insert new profile
      IF NOT FOUND THEN
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
        );
      END IF;

      -- Verify profile was created/updated
      IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_record.id 
        AND email = user_record.email
        AND updated_at > now() - interval '5 seconds'
      ) THEN
        RETURN;
      END IF;

      RAISE EXCEPTION 'Profile verification failed';

    EXCEPTION WHEN others THEN
      -- Calculate backoff time
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log attempt
      RAISE WARNING 'Profile recovery attempt % failed: %. Retrying in % seconds...', 
        retry_count + 1, SQLERRM, backoff_time;
      
      -- Increment counter
      retry_count := retry_count + 1;
      
      IF retry_count < max_retries THEN
        -- Wait before retry
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      RAISE EXCEPTION 'Profile recovery failed after % attempts: %', 
        max_retries, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email_role ON profiles(email, role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);