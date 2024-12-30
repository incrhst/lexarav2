-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS auth.handle_new_user_registration();
DROP FUNCTION IF EXISTS auth.sign_in_with_password(text, text);

-- Create function to register new users
CREATE OR REPLACE FUNCTION register_user(
  p_email text,
  p_password text,
  p_full_name text
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_profile_role user_role;
BEGIN
  -- Input validation
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  -- Check if user exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'User already registered';
  END IF;

  -- Generate UUID for new user
  v_user_id := gen_random_uuid();

  -- Determine role (first user is admin)
  SELECT 
    CASE 
      WHEN NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE deleted_at IS NULL
      ) THEN 'admin'::user_role
      ELSE 'user'::user_role
    END INTO v_profile_role;

  -- Create user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    now(),
    now()
  );

  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name
  ) VALUES (
    v_user_id,
    p_email,
    v_profile_role,
    p_full_name
  );

EXCEPTION WHEN others THEN
  -- Clean up on error
  IF v_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION register_user TO anon;