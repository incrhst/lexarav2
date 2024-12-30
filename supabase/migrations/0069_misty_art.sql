-- Drop existing function first
DROP FUNCTION IF EXISTS auth.sign_in_with_password(text, text);

-- Create auth function with correct response format
CREATE OR REPLACE FUNCTION auth.sign_in_with_password(
  email text,
  password text
)
RETURNS json AS $$
DECLARE
  result json;
  user_data auth.users;
  user_id uuid;
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

    -- Generate stable UUID based on email
    SELECT md5(email)::uuid INTO user_id;

    -- Create demo auth response with proper session format
    SELECT json_build_object(
      'session', json_build_object(
        'access_token', encode(gen_random_bytes(32), 'base64'),
        'token_type', 'bearer',
        'expires_in', 3600,
        'refresh_token', encode(gen_random_bytes(32), 'base64'),
        'user', json_build_object(
          'id', user_id,
          'aud', 'authenticated',
          'role', 'authenticated',
          'email', email,
          'email_confirmed_at', now(),
          'phone_confirmed_at', null,
          'last_sign_in_at', now(),
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
          'identities', '[]'::jsonb,
          'created_at', now(),
          'updated_at', now()
        )
      )
    ) INTO result;

    RETURN result;
  END IF;

  -- Return regular auth response with proper session format
  IF user_data.id IS NOT NULL THEN
    SELECT json_build_object(
      'session', json_build_object(
        'access_token', encode(gen_random_bytes(32), 'base64'),
        'token_type', 'bearer',
        'expires_in', 3600,
        'refresh_token', encode(gen_random_bytes(32), 'base64'),
        'user', row_to_json(user_data)
      )
    ) INTO result;
    
    RETURN result;
  END IF;

  RAISE EXCEPTION 'Invalid email or password';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;