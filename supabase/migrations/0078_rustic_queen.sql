-- Drop demo schema and all its objects
DROP SCHEMA IF EXISTS demo CASCADE;

-- Drop demo-related functions
DROP FUNCTION IF EXISTS auth.get_demo_user_metadata(text);
DROP FUNCTION IF EXISTS auth.get_demo_user(uuid, text, bigint);
DROP FUNCTION IF EXISTS public.is_demo_mode();

-- Drop existing auth function
DROP FUNCTION IF EXISTS auth.sign_in_with_password(text, text);

-- Create simplified auth function without demo mode
CREATE OR REPLACE FUNCTION auth.sign_in_with_password(
  email text,
  password text
)
RETURNS json AS $$
DECLARE
  result json;
  user_data auth.users;
  now_epoch bigint;
  access_token text;
  refresh_token text;
BEGIN
  -- Get current timestamp
  SELECT EXTRACT(EPOCH FROM NOW())::bigint INTO now_epoch;

  -- Generate tokens
  access_token := encode(gen_random_bytes(32), 'base64');
  refresh_token := encode(gen_random_bytes(32), 'base64');

  -- Regular auth
  SELECT * INTO user_data
  FROM auth.users
  WHERE 
    users.email = sign_in_with_password.email
    AND users.encrypted_password = crypt(password, users.encrypted_password)
    AND users.deleted_at IS NULL
    AND (users.banned_until IS NULL OR users.banned_until < now());

  IF user_data.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  -- Return auth response
  RETURN json_build_object(
    'session', json_build_object(
      'access_token', access_token,
      'token_type', 'bearer',
      'expires_in', 3600,
      'expires_at', now_epoch + 3600,
      'refresh_token', refresh_token,
      'user', row_to_json(user_data)
    ),
    'user', row_to_json(user_data)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove demo mode setting
DELETE FROM system_settings WHERE key = 'demo_mode';