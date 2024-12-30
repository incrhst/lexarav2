/*
  # Fix Demo Mode and Profile Creation

  1. Changes
    - Add cleanup before creating demo data
    - Add error handling for duplicate users
    - Add cascade delete for demo data cleanup
    - Add missing email field to profiles table

  2. Security
    - Maintain existing RLS policies
    - Ensure secure cleanup of demo data
*/

-- Add email field to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Update create_demo_data to handle duplicates
CREATE OR REPLACE FUNCTION create_demo_data() 
RETURNS void AS $$
BEGIN
  -- First cleanup any existing demo data
  PERFORM cleanup_demo_data();

  -- Get configured password or use default
  DECLARE
    demo_password text;
  BEGIN
    SELECT value->>'password' INTO demo_password
    FROM system_settings
    WHERE key = 'demo_password';

    IF demo_password IS NULL THEN
      demo_password := 'Demo123!@#';
    END IF;

    -- Create demo users within a subtransaction
    BEGIN
      -- Create demo users with configured password
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
        '{}'::jsonb,
        now(),
        now()
      FROM (VALUES 
        ('demo.user@example.com'),
        ('demo.admin@example.com'),
        ('demo.processor@example.com')
      ) AS t(email)
      ON CONFLICT (email) DO NOTHING;

      -- Create corresponding profiles
      INSERT INTO profiles (id, role, full_name, email, company_name)
      SELECT 
        u.id,
        CASE 
          WHEN u.email = 'demo.admin@example.com' THEN 'admin'
          WHEN u.email = 'demo.processor@example.com' THEN 'processor'
          ELSE 'user'
        END::user_role,
        CASE 
          WHEN u.email = 'demo.admin@example.com' THEN 'Demo Admin'
          WHEN u.email = 'demo.processor@example.com' THEN 'Demo Processor'
          ELSE 'Demo User'
        END,
        u.email,
        CASE 
          WHEN u.email LIKE 'demo.%@example.com' AND u.email != 'demo.user@example.com' THEN 'IP Office'
          ELSE 'Demo Company'
        END
      FROM auth.users u
      WHERE u.email LIKE 'demo.%@example.com'
      ON CONFLICT (id) DO NOTHING;

    EXCEPTION 
      WHEN others THEN
        RAISE NOTICE 'Error creating demo users: %', SQLERRM;
        -- Cleanup on error
        PERFORM cleanup_demo_data();
        RAISE;
    END;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update cleanup_demo_data for better cascade handling
CREATE OR REPLACE FUNCTION cleanup_demo_data() 
RETURNS void AS $$
BEGIN
  -- Delete demo users (will cascade to profiles due to foreign key)
  DELETE FROM auth.users 
  WHERE email LIKE 'demo.%@example.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;