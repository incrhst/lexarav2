-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS auth.handle_new_user_registration();

-- Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION auth.handle_new_user_registration()
RETURNS trigger AS $$
DECLARE
  retries int := 0;
  max_retries int := 3;
  profile_role user_role;
BEGIN
  -- Set default role
  NEW.role := 'authenticated';

  -- Set user metadata if not provided
  IF NEW.raw_user_meta_data IS NULL THEN
    NEW.raw_user_meta_data := '{}'::jsonb;
  END IF;

  -- Determine profile role
  SELECT 
    CASE 
      WHEN NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE deleted_at IS NULL
      ) THEN 'admin'::user_role
      ELSE 'user'::user_role
    END INTO profile_role;

  -- Create profile with retries
  WHILE retries < max_retries LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        role,
        full_name
      ) VALUES (
        NEW.id,
        NEW.email,
        profile_role,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          split_part(NEW.email, '@', 1)
        )
      );

      -- If we get here, profile was created successfully
      RETURN NEW;
    EXCEPTION WHEN others THEN
      -- Increment retry counter
      retries := retries + 1;
      
      IF retries = max_retries THEN
        RAISE WARNING 'Failed to create profile for user % after % attempts: %', 
          NEW.id, max_retries, SQLERRM;
      ELSE
        -- Wait briefly before retrying (exponential backoff)
        PERFORM pg_sleep(power(2, retries - 1) * 0.1);
        CONTINUE;
      END IF;
    END;
  END LOOP;

  -- Even if profile creation failed, return NEW to allow user creation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.handle_new_user_registration();

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);