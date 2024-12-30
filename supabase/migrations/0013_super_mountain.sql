/*
  # Fix Profile Creation and Demo Mode

  1. Changes
    - Improve profile creation trigger
    - Add missing indexes
    - Update demo mode functions
    - Add error handling

  2. Security
    - Maintain existing RLS policies
    - Ensure secure profile creation
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
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
    ),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update demo mode functions
CREATE OR REPLACE FUNCTION cleanup_demo_data() 
RETURNS void AS $$
BEGIN
  -- Delete demo users first (cascades to profiles)
  DELETE FROM auth.users 
  WHERE email LIKE 'demo.%@example.com';
  
  -- Cleanup any orphaned profiles
  DELETE FROM profiles 
  WHERE email LIKE 'demo.%@example.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_demo_data to be more resilient
CREATE OR REPLACE FUNCTION create_demo_data() 
RETURNS void AS $$
DECLARE
  demo_password text;
BEGIN
  -- Cleanup existing demo data first
  PERFORM cleanup_demo_data();

  -- Get or set demo password
  SELECT value->>'password' INTO demo_password
  FROM system_settings
  WHERE key = 'demo_password';

  IF demo_password IS NULL THEN
    demo_password := 'Demo123!@#';
  END IF;

  -- Create users in a transaction
  BEGIN
    -- Insert demo users
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
    ) AS t(email, full_name);

  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating demo data: %', SQLERRM;
    -- Cleanup on error
    PERFORM cleanup_demo_data();
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;