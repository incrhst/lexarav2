-- Ensure proper schema permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT USAGE ON SCHEMA extensions TO postgres, authenticated, anon;

-- Ensure proper function security
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
BEGIN
  -- Find user and verify password
  SELECT * INTO user_data
  FROM auth.users
  WHERE 
    users.email = authenticate.email
    AND users.encrypted_password = crypt(password, users.encrypted_password)
    AND users.deleted_at IS NULL
    AND (users.banned_until IS NULL OR users.banned_until < now());

  IF user_data.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    user_data.id,
    user_data.email,
    CASE 
      WHEN user_data.email LIKE 'demo.%@example.com' THEN 
        CASE 
          WHEN user_data.email = 'demo.admin@example.com' THEN 'admin'::user_role
          WHEN user_data.email = 'demo.processor@example.com' THEN 'processor'::user_role
          ELSE 'user'::user_role
        END
      ELSE 'user'::user_role
    END,
    COALESCE(
      user_data.raw_user_meta_data->>'full_name',
      split_part(user_data.email, '@', 1)
    ),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public, extensions;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auth.authenticate TO anon;
GRANT EXECUTE ON FUNCTION auth.create_user TO anon;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- Ensure RLS is enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own data" ON auth.users;
CREATE POLICY "Users can view own data"
  ON auth.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );