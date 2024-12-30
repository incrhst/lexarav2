-- Create helper function for demo user metadata
CREATE OR REPLACE FUNCTION auth.get_demo_user_metadata(email text)
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
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
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create helper function for demo user object
CREATE OR REPLACE FUNCTION auth.get_demo_user(
  user_id uuid,
  email text,
  now_timestamp timestamptz
)
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'id', user_id,
    'aud', 'authenticated',
    'role', 'authenticated',
    'email', email,
    'email_confirmed_at', now_timestamp,
    'phone', null,
    'confirmation_sent_at', null,
    'confirmed_at', now_timestamp,
    'last_sign_in_at', now_timestamp,
    'app_metadata', jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    'user_metadata', auth.get_demo_user_metadata(email),
    'identities', '[]'::jsonb,
    'created_at', now_timestamp,
    'updated_at', now_timestamp
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Drop existing sign in function
DROP FUNCTION IF EXISTS auth.sign_in_with_password(text, text);

-- Create auth function with exact Supabase token endpoint format
CREATE OR REPLACE FUNCTION auth.sign_in_with_password(
  email text,
  password text
)
RETURNS json AS $$
DECLARE
  result json;
  user_data auth.users;
  user_id uuid;
  now_timestamp timestamptz;
  access_token text;
  refresh_token text;
BEGIN
  -- Get current timestamp
  now_timestamp := now();

  -- Generate tokens
  access_token := encode(gen_random_bytes(32), 'base64');
  refresh_token := encode(gen_random_bytes(32), 'base64');

  -- Handle demo auth
  IF email LIKE 'demo.%@example.com' AND password = 'Demo123!@#' THEN
    -- Verify demo mode
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Invalid email or password';
    END IF;

    -- Generate stable UUID
    user_id := md5(email)::uuid;

    -- Get demo user object
    DECLARE
      demo_user jsonb := auth.get_demo_user(user_id, email, now_timestamp);
    BEGIN
      -- Return exact token endpoint format
      RETURN json_build_object(
        'access_token', access_token,
        'token_type', 'bearer',
        'expires_in', 3600,
        'refresh_token', refresh_token,
        'user', demo_user
      );
    END;
  END IF;

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

  -- Return regular auth response
  RETURN json_build_object(
    'access_token', access_token,
    'token_type', 'bearer',
    'expires_in', 3600,
    'refresh_token', refresh_token,
    'user', row_to_json(user_data)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;