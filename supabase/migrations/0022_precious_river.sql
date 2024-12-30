-- Improve profile sync with better validation and error handling
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS trigger AS $$
DECLARE
  retry_count int := 0;
  max_retries int := 3;
  backoff_time float;
  profile_exists boolean;
BEGIN
  -- Input validation
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE WARNING 'Invalid email for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = NEW.id
  ) INTO profile_exists;

  -- If profile exists and is valid, skip recreation
  IF profile_exists AND (
    SELECT email = NEW.email 
    FROM profiles 
    WHERE id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

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

      -- Verify profile was created/updated correctly
      IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.id 
        AND email = NEW.email
        AND updated_at > now() - interval '5 seconds'
      ) THEN
        RETURN NEW;
      END IF;

      RAISE EXCEPTION 'Profile verification failed';
      
    EXCEPTION WHEN others THEN
      -- Calculate backoff time
      backoff_time := power(2, retry_count) * 0.1;
      
      -- Log attempt
      RAISE WARNING 'Profile sync attempt % for user % failed: %. Retrying in % seconds...', 
        retry_count + 1, NEW.id, SQLERRM, backoff_time;
      
      -- Increment counter
      retry_count := retry_count + 1;
      
      IF retry_count < max_retries THEN
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
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

  -- Get user details with retry
  FOR i IN 1..max_retries LOOP
    BEGIN
      SELECT * INTO STRICT user_record 
      FROM auth.users 
      WHERE id = current_user_id;
      
      EXIT;
    EXCEPTION 
      WHEN NO_DATA_FOUND THEN
        IF i = max_retries THEN
          RAISE EXCEPTION 'User not found after % attempts', max_retries;
        END IF;
        PERFORM pg_sleep(power(2, i-1) * 0.1);
    END;
  END LOOP;

  -- Validate user data
  IF user_record.email IS NULL OR user_record.email = '' THEN
    RAISE EXCEPTION 'Invalid user email';
  END IF;

  -- Attempt profile recovery
  WHILE retry_count < max_retries LOOP
    BEGIN
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
        AND updated_at > now() - interval '5 seconds'
      ) THEN
        RETURN;
      END IF;

      RAISE EXCEPTION 'Profile verification failed';
      
    EXCEPTION WHEN others THEN
      backoff_time := power(2, retry_count) * 0.1;
      
      RAISE WARNING 'Profile recovery attempt % for user % failed: %. Retrying in % seconds...', 
        retry_count + 1, current_user_id, SQLERRM, backoff_time;
      
      retry_count := retry_count + 1;
      
      IF retry_count < max_retries THEN
        PERFORM pg_sleep(backoff_time);
        CONTINUE;
      END IF;
      
      RAISE EXCEPTION 'Profile recovery failed for user % after % attempts: %', 
        current_user_id, max_retries, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;