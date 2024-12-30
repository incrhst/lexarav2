-- Drop and recreate demo schema for clean state
DROP SCHEMA IF EXISTS demo CASCADE;
CREATE SCHEMA demo;

-- Create demo tables with proper structure
CREATE TABLE demo.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  email text UNIQUE,
  encrypted_password text,
  email_confirmed_at timestamptz DEFAULT now(),
  raw_app_meta_data jsonb DEFAULT '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  role text DEFAULT 'authenticated'
);

CREATE TABLE demo.profiles (
  id uuid PRIMARY KEY REFERENCES demo.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role user_role NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA demo TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA demo TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;

-- Create demo data
CREATE OR REPLACE FUNCTION demo.create_demo_data()
RETURNS void AS $$
BEGIN
  -- Clean up existing demo data
  DELETE FROM demo.profiles;
  DELETE FROM demo.users;

  -- Create demo users and profiles in a single transaction
  WITH inserted_users AS (
    INSERT INTO demo.users (
      email,
      encrypted_password,
      raw_user_meta_data
    )
    VALUES 
      (
        'demo.user@example.com',
        crypt('Demo123!@#', gen_salt('bf')),
        '{"full_name": "Demo User"}'::jsonb
      ),
      (
        'demo.admin@example.com',
        crypt('Demo123!@#', gen_salt('bf')),
        '{"full_name": "Demo Admin"}'::jsonb
      ),
      (
        'demo.processor@example.com',
        crypt('Demo123!@#', gen_salt('bf')),
        '{"full_name": "Demo Processor"}'::jsonb
      ),
      (
        'demo.agent@example.com',
        crypt('Demo123!@#', gen_salt('bf')),
        '{"full_name": "Demo Agent"}'::jsonb
      )
    RETURNING *
  )
  INSERT INTO demo.profiles (
    id,
    email,
    role,
    full_name
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
    raw_user_meta_data->>'full_name'
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

    -- Convert demo user to auth user format
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
      demo_user.raw_app_meta_data,
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

-- Create initial demo data
SELECT demo.create_demo_data();