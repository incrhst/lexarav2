-- Drop existing function first
DROP FUNCTION IF EXISTS auth.sign_in_with_password(text, text);

-- Create simplified demo auth function
CREATE OR REPLACE FUNCTION auth.sign_in_with_password(
  email text,
  password text
)
RETURNS json AS $$
DECLARE
  result json;
  user_data auth.users;
BEGIN
  -- Regular authentication first
  SELECT * INTO user_data
  FROM auth.users
  WHERE 
    users.email = sign_in_with_password.email
    AND users.encrypted_password = crypt(password, users.encrypted_password)
    AND users.deleted_at IS NULL
    AND (users.banned_until IS NULL OR users.banned_until < now());

  -- If regular auth fails, try demo auth
  IF user_data.id IS NULL AND email LIKE 'demo.%@example.com' THEN
    -- Verify demo mode is enabled
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Invalid email or password';
    END IF;

    -- Verify demo password
    IF password != 'Demo123!@#' THEN
      RAISE EXCEPTION 'Invalid email or password';
    END IF;

    -- Create demo auth response
    SELECT json_build_object(
      'access_token', encode(gen_random_bytes(32), 'base64'),
      'token_type', 'bearer',
      'expires_in', 3600,
      'refresh_token', encode(gen_random_bytes(32), 'base64'),
      'user', json_build_object(
        'id', gen_random_uuid(),
        'aud', 'authenticated',
        'role', 'authenticated',
        'email', email,
        'email_confirmed_at', now(),
        'app_metadata', json_build_object(
          'provider', 'email',
          'providers', ARRAY['email']
        ),
        'user_metadata', json_build_object(
          'full_name', 
          CASE 
            WHEN email = 'demo.admin@example.com' THEN 'Demo Admin'
            WHEN email = 'demo.processor@example.com' THEN 'Demo Processor'
            WHEN email = 'demo.agent@example.com' THEN 'Demo Agent'
            ELSE 'Demo User'
          END,
          'role',
          CASE 
            WHEN email = 'demo.admin@example.com' THEN 'admin'
            WHEN email = 'demo.processor@example.com' THEN 'processor'
            WHEN email = 'demo.agent@example.com' THEN 'agent'
            ELSE 'user'
          END
        ),
        'created_at', now()
      )
    ) INTO result;

    RETURN result;
  END IF;

  -- Return regular auth response
  IF user_data.id IS NOT NULL THEN
    SELECT json_build_object(
      'access_token', encode(gen_random_bytes(32), 'base64'),
      'token_type', 'bearer',
      'expires_in', 3600,
      'refresh_token', encode(gen_random_bytes(32), 'base64'),
      'user', row_to_json(user_data)
    ) INTO result;
    
    RETURN result;
  END IF;

  RAISE EXCEPTION 'Invalid email or password';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure demo mode is enabled
INSERT INTO system_settings (key, value)
VALUES ('demo_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = '{"enabled": true}'::jsonb;