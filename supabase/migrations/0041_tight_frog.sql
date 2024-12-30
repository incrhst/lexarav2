-- Improve demo user authentication
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
  demo_role text;
  is_demo boolean;
BEGIN
  -- Check if this is a demo login
  is_demo := email LIKE 'demo.%@example.com';
  
  IF is_demo THEN
    -- Only allow demo logins if demo mode is enabled
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Demo mode is not enabled';
    END IF;
    
    -- Get demo user and role in one query
    SELECT 
      d.id,
      d.instance_id,
      d.email,
      d.encrypted_password,
      d.email_confirmed_at,
      d.invited_at,
      d.confirmation_token,
      d.confirmation_sent_at,
      d.recovery_token,
      d.recovery_sent_at,
      d.email_change_token_new,
      d.email_change,
      d.email_change_sent_at,
      d.last_sign_in_at,
      d.raw_app_meta_data,
      jsonb_build_object(
        'full_name', d.raw_user_meta_data->>'full_name',
        'role', p.role
      ),
      d.is_super_admin,
      d.created_at,
      d.updated_at,
      d.phone,
      d.phone_confirmed_at,
      d.phone_change,
      d.phone_change_token,
      d.phone_change_sent_at,
      d.email_change_token_current,
      d.email_change_confirm_status,
      d.banned_until,
      d.reauthentication_token,
      d.reauthentication_sent_at,
      d.is_sso_user,
      d.deleted_at,
      p.role::text
    INTO user_data
    FROM demo.users d
    JOIN demo.profiles p ON p.id = d.id
    WHERE 
      d.email = authenticate.email
      AND d.encrypted_password = crypt(password, d.encrypted_password);

  ELSE
    -- Regular authentication
    SELECT * INTO user_data
    FROM auth.users
    WHERE 
      users.email = authenticate.email
      AND users.encrypted_password = crypt(password, users.encrypted_password)
      AND users.deleted_at IS NULL
      AND (users.banned_until IS NULL OR users.banned_until < now());
  END IF;

  IF user_data.id IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve demo data creation
CREATE OR REPLACE FUNCTION demo.create_demo_data()
RETURNS void AS $$
DECLARE
  demo_password text;
BEGIN
  -- Get demo password
  SELECT value->>'password' INTO demo_password
  FROM system_settings
  WHERE key = 'demo_password';

  IF demo_password IS NULL THEN
    demo_password := 'Demo123!@#';
  END IF;

  -- First clean up any existing demo data
  PERFORM demo.cleanup_demo_data();

  -- Create demo users
  WITH demo_users AS (
    INSERT INTO demo.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES 
      (
        gen_random_uuid(),
        'demo.user@example.com',
        crypt(demo_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Demo User"}'::jsonb,
        now(),
        now()
      ),
      (
        gen_random_uuid(),
        'demo.admin@example.com',
        crypt(demo_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Demo Admin"}'::jsonb,
        now(),
        now()
      ),
      (
        gen_random_uuid(),
        'demo.processor@example.com',
        crypt(demo_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Demo Processor"}'::jsonb,
        now(),
        now()
      ),
      (
        gen_random_uuid(),
        'demo.agent@example.com',
        crypt(demo_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Demo Agent"}'::jsonb,
        now(),
        now()
      )
    RETURNING *
  )
  -- Create corresponding profiles
  INSERT INTO demo.profiles (
    id,
    email,
    role,
    full_name,
    created_at,
    updated_at
  )
  SELECT 
    id,
    email,
    CASE 
      WHEN email = 'demo.admin@example.com' THEN 'admin'::user_role
      WHEN email = 'demo.processor@example.com' THEN 'processor'::user_role
      WHEN email = 'demo.agent@example.com' THEN 'agent'::user_role
      ELSE 'user'::user_role
    END,
    raw_user_meta_data->>'full_name',
    now(),
    now()
  FROM demo_users;

  -- Verify demo data was created
  IF NOT EXISTS (
    SELECT 1 FROM demo.users 
    WHERE email IN (
      'demo.user@example.com',
      'demo.admin@example.com',
      'demo.processor@example.com',
      'demo.agent@example.com'
    )
  ) THEN
    RAISE EXCEPTION 'Failed to create demo users';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;