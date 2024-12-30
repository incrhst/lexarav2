-- Drop and recreate demo schema for clean state
DROP SCHEMA IF EXISTS demo CASCADE;
CREATE SCHEMA demo;

-- Create demo tables with minimal required structure
CREATE TABLE demo.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  encrypted_password text,
  raw_user_meta_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE demo.profiles (
  id uuid PRIMARY KEY REFERENCES demo.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role user_role NOT NULL,
  full_name text
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA demo TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA demo TO postgres;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;

-- Create function to handle demo authentication
CREATE OR REPLACE FUNCTION auth.sign_in_demo(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  demo_user record;
BEGIN
  -- Get demo user with role
  SELECT 
    d.id,
    d.email,
    d.encrypted_password,
    p.role::text as user_role,
    p.full_name
  INTO demo_user
  FROM demo.users d
  JOIN demo.profiles p ON p.id = d.id
  WHERE 
    d.email = sign_in_demo.email
    AND d.encrypted_password = crypt(password, d.encrypted_password);

  IF demo_user IS NULL THEN
    RETURN NULL;
  END IF;

  -- Return auth user format
  RETURN ROW(
    demo_user.id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    demo_user.email,
    demo_user.encrypted_password,
    now(),
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
    now(),
    now(),
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create demo data
CREATE OR REPLACE FUNCTION demo.create_demo_data()
RETURNS void AS $$
BEGIN
  -- Clean up existing demo data
  DELETE FROM demo.profiles;
  DELETE FROM demo.users;

  -- Create demo users
  WITH inserted_users AS (
    INSERT INTO demo.users (
      email,
      encrypted_password,
      raw_user_meta_data
    )
    VALUES 
      ('demo.user@example.com', crypt('Demo123!@#', gen_salt('bf')), '{"full_name":"Demo User"}'::jsonb),
      ('demo.admin@example.com', crypt('Demo123!@#', gen_salt('bf')), '{"full_name":"Demo Admin"}'::jsonb),
      ('demo.processor@example.com', crypt('Demo123!@#', gen_salt('bf')), '{"full_name":"Demo Processor"}'::jsonb),
      ('demo.agent@example.com', crypt('Demo123!@#', gen_salt('bf')), '{"full_name":"Demo Agent"}'::jsonb)
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

-- Ensure demo mode is enabled and create demo data
INSERT INTO system_settings (key, value)
VALUES ('demo_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = '{"enabled": true}'::jsonb;

-- Recreate demo data
SELECT demo.create_demo_data();