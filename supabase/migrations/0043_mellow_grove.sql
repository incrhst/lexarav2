-- Improve demo user authentication
CREATE OR REPLACE FUNCTION auth.authenticate(
  email text,
  password text
)
RETURNS auth.users AS $$
DECLARE
  user_data auth.users;
  demo_role text;
  is_demo boolean;
BEGIN
  -- Check if this is a demo login
  is_demo := email LIKE 'demo.%@example.com';
  
  IF is_demo THEN
    -- Only allow demo logins if demo mode is enabled
    IF NOT public.is_demo_mode() THEN
      RAISE EXCEPTION 'Demo mode is not enabled';
    END IF;

    -- Get demo user with role
    WITH demo_user AS (
      SELECT 
        d.*,
        p.role::text as user_role
      FROM demo.users d
      JOIN demo.profiles p ON p.id = d.id
      WHERE 
        d.email = authenticate.email
        AND d.encrypted_password = crypt(password, d.encrypted_password)
    )
    SELECT 
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      jsonb_build_object(
        'full_name', raw_user_meta_data->>'full_name',
        'role', user_role
      ),
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at,
      user_role
    INTO user_data
    FROM demo_user;

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

-- Ensure demo schema is properly set up
DO $$ 
BEGIN
  -- Create demo schema if it doesn't exist
  CREATE SCHEMA IF NOT EXISTS demo;

  -- Create demo tables if they don't exist
  CREATE TABLE IF NOT EXISTS demo.users (
    LIKE auth.users INCLUDING ALL
  );

  CREATE TABLE IF NOT EXISTS demo.profiles (
    LIKE public.profiles INCLUDING ALL
  );

  -- Grant necessary permissions
  GRANT USAGE ON SCHEMA demo TO authenticated;
  GRANT USAGE ON SCHEMA demo TO anon;
  GRANT SELECT ON ALL TABLES IN SCHEMA demo TO authenticated;
  GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;
END $$;

-- Recreate demo data
SELECT demo.create_demo_data();