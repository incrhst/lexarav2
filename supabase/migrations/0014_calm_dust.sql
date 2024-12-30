/*
  # Fix Profile Creation and Error Handling

  1. Changes
    - Add unique constraint on profiles.email
    - Improve profile creation trigger
    - Add better error handling
    - Fix demo mode functions

  2. Security
    - Maintain existing RLS policies
    - Ensure secure profile creation
*/

-- Add unique constraint to profiles.email
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_email_key,
ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Improve profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email LIKE 'demo.%@example.com' THEN 
        CASE 
          WHEN NEW.email = 'demo.admin@example.com' THEN 'admin'::user_role
          WHEN NEW.email = 'demo.processor@example.com' THEN 'processor'::user_role
          ELSE 'user'::user_role
        END
      ELSE 'user'::user_role
    END,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (email) DO UPDATE
  SET
    id = EXCLUDED.id,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update demo mode functions
CREATE OR REPLACE FUNCTION cleanup_demo_data() 
RETURNS void AS $$
BEGIN
  -- Delete demo users and profiles in a transaction
  BEGIN
    -- First remove profiles
    DELETE FROM profiles 
    WHERE email LIKE 'demo.%@example.com';
    
    -- Then remove auth users
    DELETE FROM auth.users 
    WHERE email LIKE 'demo.%@example.com';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error cleaning up demo data: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve create_demo_data function
CREATE OR REPLACE FUNCTION create_demo_data() 
RETURNS void AS $$
DECLARE
  demo_password text;
BEGIN
  -- Clean up any existing demo data first
  PERFORM cleanup_demo_data();

  -- Get demo password
  SELECT value->>'password' INTO demo_password
  FROM system_settings
  WHERE key = 'demo_password';

  IF demo_password IS NULL THEN
    demo_password := 'Demo123!@#';
  END IF;

  -- Create demo data in a transaction
  BEGIN
    -- Create demo users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    SELECT
      '00000000-0000-0000-0000-000000000000'::uuid,
      gen_random_uuid(),
      'authenticated',
      'authenticated',
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
      ('demo.processor@example.com', 'Demo Processor')
    ) AS t(email, full_name)
    ON CONFLICT (email) DO NOTHING;

  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating demo data: %', SQLERRM;
    -- Cleanup on error
    PERFORM cleanup_demo_data();
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;