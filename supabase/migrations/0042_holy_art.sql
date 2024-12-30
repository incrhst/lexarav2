-- Improve demo schema setup
CREATE OR REPLACE FUNCTION demo.setup_demo_schema()
RETURNS void AS $$
BEGIN
  -- Ensure demo schema exists
  CREATE SCHEMA IF NOT EXISTS demo;
  
  -- Create demo tables if they don't exist
  CREATE TABLE IF NOT EXISTS demo.users (
    LIKE auth.users INCLUDING ALL
  );

  CREATE TABLE IF NOT EXISTS demo.profiles (
    LIKE public.profiles INCLUDING ALL
  );

  -- Grant permissions
  GRANT USAGE ON SCHEMA demo TO authenticated;
  GRANT USAGE ON SCHEMA demo TO anon;
  GRANT SELECT ON ALL TABLES IN SCHEMA demo TO authenticated;
  GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

    -- Get demo role
    SELECT role::text INTO demo_role
    FROM demo.profiles
    WHERE email = authenticate.email;

    -- Get demo user
    SELECT 
      d.*,
      demo_role
    INTO user_data
    FROM demo.users d
    WHERE 
      d.email = authenticate.email
      AND d.encrypted_password = crypt(password, d.encrypted_password);

    -- Update user metadata with role
    IF user_data.id IS NOT NULL THEN
      user_data.raw_user_meta_data = jsonb_set(
        user_data.raw_user_meta_data,
        '{role}',
        to_jsonb(demo_role)
      );
    END IF;
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
  -- First ensure demo schema is set up
  PERFORM demo.setup_demo_schema();

  -- Get demo password
  SELECT value->>'password' INTO demo_password
  FROM system_settings
  WHERE key = 'demo_password';

  IF demo_password IS NULL THEN
    demo_password := 'Demo123!@#';
  END IF;

  -- Clean up existing demo data
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
    SELECT
      gen_random_uuid(),
      email,
      crypt(demo_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', full_name),
      now(),
      now()
    FROM (VALUES 
      ('demo.user@example.com', 'Demo User'),
      ('demo.admin@example.com', 'Demo Admin'),
      ('demo.processor@example.com', 'Demo Processor'),
      ('demo.agent@example.com', 'Demo Agent')
    ) AS t(email, full_name)
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

-- Run initial setup
SELECT demo.setup_demo_schema();