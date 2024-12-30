-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS auth.handle_new_user_role();

-- Create improved trigger function to handle new user registration
CREATE OR REPLACE FUNCTION auth.handle_new_user_registration()
RETURNS trigger AS $$
BEGIN
  -- Set default role
  NEW.role := 'authenticated';

  -- Set user metadata
  IF NEW.raw_user_meta_data IS NULL THEN
    NEW.raw_user_meta_data := '{}'::jsonb;
  END IF;

  -- Create profile in a separate transaction to ensure it completes
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      role,
      full_name
    ) VALUES (
      NEW.id,
      NEW.email,
      CASE 
        WHEN NOT EXISTS (
          SELECT 1 FROM auth.users 
          WHERE deleted_at IS NULL
        ) THEN 'admin'::user_role
        ELSE 'user'::user_role
      END,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
      )
    );
  EXCEPTION 
    WHEN others THEN
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
      RETURN NULL;
  END;

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
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);