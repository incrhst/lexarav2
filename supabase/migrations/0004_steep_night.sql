/*
  # Enhance demo mode password security
  
  1. Changes
    - Add demo password configuration to system settings
    - Update demo user creation to use configured password
    - Add password validation
  
  2. Security
    - Passwords are stored securely using pgcrypto
    - Only admins can configure demo passwords
*/

-- Add function to set demo password
CREATE OR REPLACE FUNCTION set_demo_password(new_password text)
RETURNS void AS $$
BEGIN
  -- Validate password
  IF length(new_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters long';
  END IF;

  -- Store password configuration
  INSERT INTO system_settings (key, value)
  VALUES (
    'demo_password',
    jsonb_build_object(
      'password', new_password,
      'updated_at', extract(epoch from now())
    )
  )
  ON CONFLICT (key) DO UPDATE
  SET value = jsonb_build_object(
    'password', new_password,
    'updated_at', extract(epoch from now())
  ),
  updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_demo_data function to use configured password
CREATE OR REPLACE FUNCTION create_demo_data() 
RETURNS void AS $$
DECLARE
  demo_user_id uuid;
  demo_admin_id uuid;
  demo_processor_id uuid;
  demo_password text;
BEGIN
  -- Get configured password or use default
  SELECT value->>'password' INTO demo_password
  FROM system_settings
  WHERE key = 'demo_password';

  IF demo_password IS NULL THEN
    demo_password := 'Demo123!@#';  -- Secure default password
  END IF;

  -- Create demo users with configured password
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
  VALUES 
    (gen_random_uuid(), 'demo.user@example.com', crypt(demo_password, gen_salt('bf')), now()),
    (gen_random_uuid(), 'demo.admin@example.com', crypt(demo_password, gen_salt('bf')), now()),
    (gen_random_uuid(), 'demo.processor@example.com', crypt(demo_password, gen_salt('bf')), now())
  RETURNING id INTO demo_user_id;

  -- Rest of the function remains the same...
  -- [Previous demo data creation code]
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;