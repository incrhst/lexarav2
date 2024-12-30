-- Improve demo mode check
CREATE OR REPLACE FUNCTION public.is_demo_mode()
RETURNS boolean AS $$
BEGIN
  -- First check environment variable
  IF current_setting('app.settings.demo_mode', TRUE) = 'true' THEN
    RETURN TRUE;
  END IF;

  -- Then check database setting
  RETURN EXISTS (
    SELECT 1 
    FROM system_settings 
    WHERE key = 'demo_mode' 
    AND (value->>'enabled')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_demo_mode TO anon, authenticated;

-- Improve demo user authentication
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
  demo_user record;
BEGIN
  -- Check if this is a demo login
  IF email LIKE 'demo.%@example.com' THEN
    -- Verify demo mode is enabled
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Demo mode is not enabled';
    END IF;

    -- Get demo user with role
    SELECT 
      d.*,
      p.role::text as user_role,
      p.full_name
    INTO demo_user
    FROM demo.users d
    JOIN demo.profiles p ON p.id = d.id
    WHERE 
      d.email = authenticate.email
      AND d.encrypted_password = crypt(password, d.encrypted_password);

    IF demo_user IS NULL THEN
      RAISE EXCEPTION 'Invalid demo credentials';
    END IF;

    -- Convert demo user to auth user format with proper metadata
    RETURN ROW(
      demo_user.id,
      demo_user.instance_id,
      demo_user.email,
      demo_user.encrypted_password,
      demo_user.email_confirmed_at,
      NULL::timestamptz,
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text,
      NULL::timestamptz,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', demo_user.full_name,
        'role', demo_user.user_role
      ),
      false,
      demo_user.created_at,
      demo_user.updated_at,
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      0,
      NULL::timestamptz,
      NULL::text,
      NULL::timestamptz,
      false,
      NULL::timestamptz,
      'authenticated'
    )::auth.users;
  END IF;

  -- Regular authentication
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

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure demo mode is enabled
INSERT INTO system_settings (key, value)
VALUES ('demo_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = '{"enabled": true}'::jsonb;

-- Recreate demo data
SELECT demo.create_demo_data();