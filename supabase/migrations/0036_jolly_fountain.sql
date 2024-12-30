-- Add authentication functions if they don't exist
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
BEGIN
  SELECT * INTO user_data
  FROM auth.users
  WHERE 
    users.email = authenticate.email
    AND users.encrypted_password = crypt(password, users.encrypted_password);

  IF user_data.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add user creation function
CREATE OR REPLACE FUNCTION auth.create_user(
  email text,
  password text,
  meta_data jsonb DEFAULT '{}'::jsonb
)
RETURNS auth.users AS $$
DECLARE
  new_user auth.users;
BEGIN
  INSERT INTO auth.users (
    email,
    encrypted_password,
    raw_user_meta_data
  )
  VALUES (
    email,
    crypt(password, gen_salt('bf')),
    meta_data
  )
  RETURNING * INTO new_user;

  -- Create corresponding profile
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new_user.id,
    new_user.email,
    'user',
    COALESCE(
      meta_data->>'full_name',
      split_part(new_user.email, '@', 1)
    )
  );

  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add email validation constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'proper_email' AND conrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE auth.users
    ADD CONSTRAINT proper_email 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;
GRANT EXECUTE ON FUNCTION auth.authenticate TO anon;
GRANT EXECUTE ON FUNCTION auth.create_user TO anon;