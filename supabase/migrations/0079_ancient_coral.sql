-- Create function to check if this is the first user
CREATE OR REPLACE FUNCTION auth.is_first_user() 
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to handle new user registration
CREATE OR REPLACE FUNCTION auth.handle_new_user_role()
RETURNS trigger AS $$
BEGIN
  -- Set user metadata with role
  NEW.raw_user_meta_data := jsonb_build_object(
    'role',
    CASE 
      WHEN auth.is_first_user() THEN 'admin'
      ELSE 'user'
    END
  );

  -- Create corresponding profile
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name
  ) VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN auth.is_first_user() THEN 'admin'::user_role
      ELSE 'user'::user_role
    END,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.handle_new_user_role();