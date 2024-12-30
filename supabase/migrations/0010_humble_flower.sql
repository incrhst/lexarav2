/*
  # Fix Demo Mode Toggle

  1. Changes
    - Update create_demo_data to handle existing users
    - Add cleanup before creating new demo data
    - Add better error handling

  2. Security
    - Maintain existing security policies
*/

-- Update create_demo_data function to handle existing users
CREATE OR REPLACE FUNCTION create_demo_data() 
RETURNS void AS $$
DECLARE
  demo_user_id uuid;
  demo_admin_id uuid;
  demo_processor_id uuid;
  demo_password text;
BEGIN
  -- First cleanup any existing demo data
  PERFORM cleanup_demo_data();

  -- Get configured password or use default
  SELECT value->>'password' INTO demo_password
  FROM system_settings
  WHERE key = 'demo_password';

  IF demo_password IS NULL THEN
    demo_password := 'Demo123!@#';
  END IF;

  -- Create demo users with configured password
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo.user@example.com',
    crypt(demo_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO demo_user_id;

  -- Create demo admin
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo.admin@example.com',
    crypt(demo_password, gen_salt('bf')),
    now()
  ) RETURNING id INTO demo_admin_id;

  -- Create demo processor
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'demo.processor@example.com',
    crypt(demo_password, gen_salt('bf')),
    now()
  ) RETURNING id INTO demo_processor_id;

  -- Create profiles
  INSERT INTO profiles (id, role, full_name, company_name)
  VALUES
    (demo_user_id, 'user', 'Demo User', 'Demo Company'),
    (demo_admin_id, 'admin', 'Demo Admin', 'IP Office'),
    (demo_processor_id, 'processor', 'Demo Processor', 'IP Office');

  -- Create demo applications
  INSERT INTO applications (
    applicant_id,
    application_type,
    status,
    filing_number,
    filing_date,
    applicant_name,
    applicant_address,
    applicant_country,
    contact_phone,
    contact_email,
    trademark_name,
    trademark_description,
    goods_services_class,
    use_status,
    territory
  )
  VALUES (
    demo_user_id,
    'trademark',
    'submitted',
    'TM2024001',
    now(),
    'Demo User',
    '123 Demo St, Demo City',
    'US',
    '+1234567890',
    'demo.user@example.com',
    'DemoMark',
    'A demonstration trademark for testing purposes',
    ARRAY['9', '42'],
    'intentToUse',
    ARRAY['US', 'EU']
  );

EXCEPTION
  WHEN others THEN
    -- Log error details
    RAISE NOTICE 'Error creating demo data: %', SQLERRM;
    -- Cleanup any partial data
    PERFORM cleanup_demo_data();
    -- Re-raise the error
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update cleanup_demo_data to be more thorough
CREATE OR REPLACE FUNCTION cleanup_demo_data() 
RETURNS void AS $$
BEGIN
  -- Delete demo applications first (due to foreign key constraints)
  DELETE FROM applications 
  WHERE applicant_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE 'demo.%@example.com'
  );
  
  -- Delete demo profiles
  DELETE FROM profiles 
  WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE 'demo.%@example.com'
  );
  
  -- Delete demo users
  DELETE FROM auth.users 
  WHERE email LIKE 'demo.%@example.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;