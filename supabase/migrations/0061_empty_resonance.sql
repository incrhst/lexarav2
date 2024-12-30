-- Drop existing auth function first
DROP FUNCTION IF EXISTS auth.sign_in_with_password(text, text);

-- Create function to check if email is a demo account
CREATE OR REPLACE FUNCTION auth.is_demo_account(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email LIKE 'demo.%@example.com';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to handle demo authentication
CREATE OR REPLACE FUNCTION auth.sign_in_with_password(
  email text,
  password text
)
RETURNS jsonb AS $$
DECLARE
  user_data auth.users;
  demo_user record;
  result jsonb;
BEGIN
  -- Check if this is a demo login
  IF auth.is_demo_account(email) THEN
    -- Verify demo mode is enabled
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Demo mode is not enabled';
    END IF;

    -- Get demo user with role
    SELECT 
      d.id,
      d.email,
      p.role::text as user_role,
      p.full_name
    INTO demo_user
    FROM demo.users d
    JOIN demo.profiles p ON p.id = d.id
    WHERE 
      d.email = sign_in_with_password.email
      AND d.encrypted_password = crypt(password, d.encrypted_password);

    IF demo_user IS NULL THEN
      RAISE EXCEPTION 'Invalid demo credentials';
    END IF;

    -- Return auth response format
    result := jsonb_build_object(
      'access_token', encode(gen_random_bytes(32), 'base64'),
      'token_type', 'bearer',
      'expires_in', 3600,
      'refresh_token', encode(gen_random_bytes(32), 'base64'),
      'user', jsonb_build_object(
        'id', demo_user.id,
        'aud', 'authenticated',
        'role', 'authenticated',
        'email', demo_user.email,
        'email_confirmed_at', now(),
        'app_metadata', jsonb_build_object(
          'provider', 'email',
          'providers', array['email']
        ),
        'user_metadata', jsonb_build_object(
          'full_name', demo_user.full_name,
          'role', demo_user.user_role
        ),
        'created_at', now()
      )
    );

    RETURN result;
  END IF;

  -- Regular authentication
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

  -- Return regular auth response
  result := jsonb_build_object(
    'access_token', encode(gen_random_bytes(32), 'base64'),
    'token_type', 'bearer',
    'expires_in', 3600,
    'refresh_token', encode(gen_random_bytes(32), 'base64'),
    'user', row_to_json(user_data)::jsonb
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure demo mode is enabled
INSERT INTO system_settings (key, value)
VALUES ('demo_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = '{"enabled": true}'::jsonb;