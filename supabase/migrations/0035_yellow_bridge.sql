-- Add missing auth schema functions that don't require schema ownership
CREATE OR REPLACE FUNCTION public.email_matches(email text, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = user_id 
    AND users.email = email_matches.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check user role in public schema
CREATE OR REPLACE FUNCTION public.user_has_role(user_id uuid, required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id 
    AND role::text = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.email_matches TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role TO authenticated;

-- Ensure proper schema permissions for auth schema access
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon;