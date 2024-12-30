-- Improve demo data creation with all roles
CREATE OR REPLACE FUNCTION demo.create_demo_data()
RETURNS void AS $$
DECLARE
  demo_password text;
  demo_user_id uuid;
  demo_admin_id uuid;
  demo_processor_id uuid;
  demo_agent_id uuid;
BEGIN
  -- Get demo password
  SELECT value->>'password' INTO demo_password
  FROM system_settings
  WHERE key = 'demo_password';

  IF demo_password IS NULL THEN
    demo_password := 'Demo123!@#';
  END IF;

  -- Create demo users in demo schema
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
  ON CONFLICT (email) DO UPDATE
  SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = now()
  RETURNING id, email INTO demo_user_id, demo_admin_id, demo_processor_id, demo_agent_id;

  -- Create corresponding demo profiles
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
  FROM demo.users
  WHERE email LIKE 'demo.%@example.com'
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify auth.authenticate to properly handle demo users
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
  demo_user demo.users;
  is_demo boolean;
BEGIN
  -- Check if this is a demo login
  is_demo := email LIKE 'demo.%@example.com';
  
  IF is_demo THEN
    -- Only allow demo logins if demo mode is enabled
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Demo mode is not enabled';
    END IF;
    
    -- Check demo credentials
    SELECT * INTO demo_user
    FROM demo.users
    WHERE 
      users.email = authenticate.email
      AND users.encrypted_password = crypt(password, users.encrypted_password);

    IF demo_user.id IS NULL THEN
      RAISE EXCEPTION 'Invalid demo credentials';
    END IF;

    -- Convert demo user to auth user format
    user_data := ROW(
      demo_user.id,
      demo_user.instance_id,
      demo_user.email,
      demo_user.encrypted_password,
      demo_user.email_confirmed_at,
      demo_user.invited_at,
      demo_user.confirmation_token,
      demo_user.confirmation_sent_at,
      demo_user.recovery_token,
      demo_user.recovery_sent_at,
      demo_user.email_change_token_new,
      demo_user.email_change,
      demo_user.email_change_sent_at,
      demo_user.last_sign_in_at,
      demo_user.raw_app_meta_data,
      demo_user.raw_user_meta_data,
      demo_user.is_super_admin,
      demo_user.created_at,
      demo_user.updated_at,
      demo_user.phone,
      demo_user.phone_confirmed_at,
      demo_user.phone_change,
      demo_user.phone_change_token,
      demo_user.phone_change_sent_at,
      demo_user.email_change_token_current,
      demo_user.email_change_confirm_status,
      demo_user.banned_until,
      demo_user.reauthentication_token,
      demo_user.reauthentication_sent_at,
      demo_user.is_sso_user,
      demo_user.deleted_at,
      demo_user.role
    )::auth.users;
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