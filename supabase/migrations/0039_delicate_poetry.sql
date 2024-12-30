-- Create demo schema
CREATE SCHEMA IF NOT EXISTS demo;

-- Create demo tables that mirror production tables
CREATE TABLE IF NOT EXISTS demo.users (
  LIKE auth.users INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS demo.profiles (
  LIKE public.profiles INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS demo.applications (
  LIKE public.applications INCLUDING ALL
);

-- Enable RLS on demo tables
ALTER TABLE demo.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.applications ENABLE ROW LEVEL SECURITY;

-- Create function to check if demo mode is enabled
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

-- Modify demo mode functions to use separate schema
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

  -- Create demo users in demo schema
  INSERT INTO demo.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES 
    (
      'demo.user@example.com',
      crypt(demo_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo User"}'::jsonb
    ),
    (
      'demo.admin@example.com',
      crypt(demo_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Admin"}'::jsonb
    ),
    (
      'demo.processor@example.com',
      crypt(demo_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Processor"}'::jsonb
    )
  ON CONFLICT (email) DO NOTHING
  RETURNING id;

  -- Create corresponding demo profiles
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
      WHEN email = 'demo.admin@example.com' THEN 'admin'
      WHEN email = 'demo.processor@example.com' THEN 'processor'
      ELSE 'user'
    END,
    raw_user_meta_data->>'full_name'
  FROM demo.users
  WHERE email LIKE 'demo.%@example.com'
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup demo data
CREATE OR REPLACE FUNCTION demo.cleanup_demo_data()
RETURNS void AS $$
BEGIN
  -- Clean up demo data
  TRUNCATE TABLE demo.applications CASCADE;
  TRUNCATE TABLE demo.profiles CASCADE;
  TRUNCATE TABLE demo.users CASCADE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify auth functions to handle demo mode
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
    
    -- Check demo credentials
    SELECT * INTO user_data
    FROM demo.users
    WHERE 
      users.email = authenticate.email
      AND users.encrypted_password = crypt(password, users.encrypted_password);
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

-- Grant permissions
GRANT USAGE ON SCHEMA demo TO postgres, authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;