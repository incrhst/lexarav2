/*
  # Create Demo Accounts

  1. Changes
    - Create demo users with proper auth.users structure
    - Create corresponding profiles with correct role types
    - Set up demo applications
  
  2. Security
    - Uses secure password hashing
    - Sets up proper role assignments
*/

DO $$ 
DECLARE
  demo_admin_id uuid;
  demo_user_id uuid;
  demo_processor_id uuid;
BEGIN
  -- Create demo admin user
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
    'demo.admin@example.com',
    crypt('Demo123!@#', gen_salt('bf')),
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
  ) RETURNING id INTO demo_admin_id;

  -- Create demo regular user
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
    crypt('Demo123!@#', gen_salt('bf')),
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

  -- Create demo processor user
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
    'demo.processor@example.com',
    crypt('Demo123!@#', gen_salt('bf')),
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
  ) RETURNING id INTO demo_processor_id;

  -- Create corresponding profiles with explicit type casting
  INSERT INTO profiles (id, role, full_name, company_name)
  VALUES
    (demo_admin_id, 'admin'::user_role, 'Demo Admin', 'IP Office'),
    (demo_user_id, 'applicant'::user_role, 'Demo User', 'Demo Company'),
    (demo_processor_id, 'processor'::user_role, 'Demo Processor', 'IP Office');

END $$;