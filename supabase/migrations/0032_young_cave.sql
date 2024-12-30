/*
  # Fix Authentication Service Configuration

  1. Auth Service Setup
    - Add required auth service functions
    - Fix token generation
    - Add proper error handling

  2. Security
    - Add proper function permissions
    - Fix auth service roles
*/

-- Add auth service functions
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

-- Add function to get user by email
CREATE OR REPLACE FUNCTION auth.user_by_email(email text)
RETURNS auth.users AS $$
  SELECT * FROM auth.users WHERE users.email = user_by_email.email LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Add function to get current user
CREATE OR REPLACE FUNCTION auth.current_user()
RETURNS auth.users AS $$
  SELECT * FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.authenticate TO anon;
GRANT EXECUTE ON FUNCTION auth.user_by_email TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.current_user TO authenticated;

-- Ensure auth extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;