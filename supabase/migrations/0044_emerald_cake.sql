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

    -- Get demo user with role in a single query
    WITH demo_user AS (
      SELECT 
        d.*,
        p.role::text as user_role,
        p.full_name
      FROM demo.users d
      JOIN demo.profiles p ON p.id = d.id
      WHERE 
        d.email = authenticate.email
        AND d.encrypted_password = crypt(password, d.encrypted_password)
    )
    SELECT 
      du.id,
      du.instance_id,
      du.email,
      du.encrypted_password,
      du.email_confirmed_at,
      du.invited_at,
      du.confirmation_token,
      du.confirmation_sent_at,
      du.recovery_token,
      du.recovery_sent_at,
      du.email_change_token_new,
      du.email_change,
      du.email_change_sent_at,
      du.last_sign_in_at,
      du.raw_app_meta_data,
      jsonb_build_object(
        'full_name', du.full_name,
        'role', du.user_role
      ),
      du.is_super_admin,
      du.created_at,
      du.updated_at,
      du.phone,
      du.phone_confirmed_at,
      du.phone_change,
      du.phone_change_token,
      du.phone_change_sent_at,
      du.email_change_token_current,
      du.email_change_confirm_status,
      du.banned_until,
      du.reauthentication_token,
      du.reauthentication_sent_at,
      du.is_sso_user,
      du.deleted_at,
      du.user_role
    INTO user_data
    FROM demo_user du;

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

-- Ensure demo schema is properly set up
DO $$ 
BEGIN
  -- Create demo schema if it doesn't exist
  CREATE SCHEMA IF NOT EXISTS demo;

  -- Create demo tables if they don't exist
  CREATE TABLE IF NOT EXISTS demo.users (
    LIKE auth.users INCLUDING ALL
  );

  CREATE TABLE IF NOT EXISTS demo.profiles (
    LIKE public.profiles INCLUDING ALL
  );

  -- Grant necessary permissions
  GRANT USAGE ON SCHEMA demo TO authenticated;
  GRANT USAGE ON SCHEMA demo TO anon;
  GRANT SELECT ON ALL TABLES IN SCHEMA demo TO authenticated;
  GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;
END $$;

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
  DELETE FROM demo.profiles;
  DELETE FROM demo.users;

  -- Create demo users
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

-- Recreate demo data
SELECT demo.create_demo_data();