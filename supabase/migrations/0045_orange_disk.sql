-- Drop and recreate demo schema to ensure clean state
DROP SCHEMA IF EXISTS demo CASCADE;
CREATE SCHEMA demo;

-- Create demo tables
CREATE TABLE demo.users (
  LIKE auth.users INCLUDING ALL
);

CREATE TABLE demo.profiles (
  LIKE public.profiles INCLUDING ALL
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA demo TO authenticated;
GRANT USAGE ON SCHEMA demo TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;

-- Improve demo user authentication
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
  is_demo boolean;
BEGIN
  -- Check if this is a demo login
  is_demo := email LIKE 'demo.%@example.com';
  
  IF is_demo THEN
    -- Only allow demo logins if demo mode is enabled
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Demo mode is not enabled';
    END IF;

    -- Get demo user
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
        'full_name', p.full_name,
        'role', p.role::text
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

  -- Clean up existing demo data
  DELETE FROM demo.profiles;
  DELETE FROM demo.users;

  -- Create demo users and profiles in a single transaction
  WITH inserted_users AS (
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
  FROM inserted_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create demo data
SELECT demo.create_demo_data();