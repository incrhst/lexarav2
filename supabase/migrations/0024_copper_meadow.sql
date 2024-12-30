-- Improve auth schema and profile handling
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS trigger AS $$
DECLARE
  retry_count int := 0;
  max_retries int := 3;
BEGIN
  -- Input validation
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE WARNING 'Invalid email for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Attempt profile creation with retries
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Create or update profile
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
        updated_at = now();

      -- Verify profile creation
      IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.id AND email = NEW.email
      ) THEN
        RETURN NEW;
      END IF;

      RAISE EXCEPTION 'Profile verification failed';

    EXCEPTION WHEN others THEN
      -- Increment retry counter
      retry_count := retry_count + 1;
      
      IF retry_count = max_retries THEN
        RAISE WARNING 'Failed to create profile for user % after % attempts: %', 
          NEW.id, max_retries, SQLERRM;
        RETURN NEW; -- Don't block auth
      END IF;

      -- Wait before retrying (exponential backoff)
      PERFORM pg_sleep(power(2, retry_count - 1) * 0.1);
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure auth schema exists and has required tables
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA IF NOT EXISTS auth;
  END IF;
END $$;

-- Ensure auth.users table exists with correct structure
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid,
  email text UNIQUE,
  encrypted_password text,
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token text,
  confirmation_sent_at timestamptz,
  recovery_token text,
  recovery_sent_at timestamptz,
  email_change_token_new text,
  email_change text,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz,
  updated_at timestamptz,
  phone text UNIQUE DEFAULT NULL,
  phone_confirmed_at timestamptz,
  phone_change text DEFAULT '',
  phone_change_token text DEFAULT '',
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz GENERATED ALWAYS AS (
    LEAST(email_confirmed_at, phone_confirmed_at)
  ) STORED,
  email_change_token_current text DEFAULT '',
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz,
  reauthentication_token text DEFAULT '',
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamptz,
  role text DEFAULT 'authenticated'
);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (instance_id, email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Add RLS policies for auth schema
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Can view own user data" ON auth.users
  FOR SELECT USING (auth.uid() = id);

-- Function to handle password authentication
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
) RETURNS auth.users AS $$
DECLARE
  user_record auth.users;
BEGIN
  SELECT * INTO user_record
  FROM auth.users
  WHERE 
    users.email = authenticate.email
    AND users.encrypted_password = crypt(password, users.encrypted_password)
    AND users.deleted_at IS NULL
    AND (users.banned_until IS NULL OR users.banned_until < now());

  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;