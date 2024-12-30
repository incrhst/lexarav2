/*
  # Fix Authentication Schema and Flow

  1. Changes
    - Add missing auth schema grants
    - Fix schema querying permissions
    - Add better error handling for auth
    - Add missing auth functions
    - Add proper role handling

  2. Security
    - Preserve existing permissions
    - Add proper authentication checks
    - Add better error logging
*/

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant necessary permissions to anon users
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select permissions on necessary auth tables
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- Create auth helper functions
CREATE OR REPLACE FUNCTION auth.email_signup(
  email text,
  password text,
  data jsonb DEFAULT '{}'::jsonb
)
RETURNS auth.users AS $$
DECLARE
  user_id uuid;
  user_data auth.users;
BEGIN
  -- Input validation
  IF email IS NULL OR email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF password IS NULL OR length(password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  -- Create user
  INSERT INTO auth.users (
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    email,
    crypt(password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    data,
    now(),
    now(),
    'authenticated'
  )
  RETURNING * INTO user_data;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle password sign in
CREATE OR REPLACE FUNCTION auth.signin(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
  profile_exists boolean;
BEGIN
  -- Input validation
  IF email IS NULL OR email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF password IS NULL OR password = '' THEN
    RAISE EXCEPTION 'Password is required';
  END IF;

  -- Find user and verify password
  SELECT users.* INTO user_data
  FROM auth.users as users
  WHERE 
    users.email = signin.email
    AND users.encrypted_password = crypt(password, users.encrypted_password)
    AND users.deleted_at IS NULL
    AND (users.banned_until IS NULL OR users.banned_until < now());

  IF user_data.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_data.id
  ) INTO profile_exists;

  -- If profile doesn't exist, try to recover it
  IF NOT profile_exists THEN
    BEGIN
      PERFORM recover_profile();
    EXCEPTION WHEN others THEN
      RAISE WARNING 'Failed to recover profile during signin: %', SQLERRM;
    END;
  END IF;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user
CREATE OR REPLACE FUNCTION auth.current_user()
RETURNS auth.users AS $$
  SELECT users.* FROM auth.users AS users WHERE users.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Add RLS policies for auth schema
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Can view own user data" ON auth.users;

-- Create new policies
CREATE POLICY "Users can view own data"
  ON auth.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add function to check if email exists
CREATE OR REPLACE FUNCTION auth.email_exists(email text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE users.email = email_exists.email
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Add better error handling for auth functions
CREATE OR REPLACE FUNCTION auth.handle_error(
  error_message text,
  error_code text DEFAULT 'UNKNOWN_ERROR'
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

-- Add missing indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (instance_id, email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION auth.email_signup TO anon;
GRANT EXECUTE ON FUNCTION auth.signin TO anon;
GRANT EXECUTE ON FUNCTION auth.current_user TO authenticated;
GRANT EXECUTE ON FUNCTION auth.email_exists TO anon;
GRANT EXECUTE ON FUNCTION auth.handle_error TO anon, authenticated;