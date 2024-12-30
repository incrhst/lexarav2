-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure auth schema exists and has proper search path
CREATE SCHEMA IF NOT EXISTS auth;
ALTER DATABASE postgres SET search_path TO public, auth, extensions;

-- Add JWT verification function
CREATE OR REPLACE FUNCTION auth.verify_token()
RETURNS void AS $$
BEGIN
  IF NOT auth.is_authenticated() THEN
    RAISE EXCEPTION 'Invalid authentication token';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to hash passwords consistently
CREATE OR REPLACE FUNCTION auth.hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.verify_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.hash_password TO postgres;

-- Ensure schema usage
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, anon;
GRANT USAGE ON SCHEMA extensions TO postgres, authenticated, anon;

-- Allow auth functions to access required schemas
ALTER FUNCTION auth.authenticate SECURITY DEFINER SET search_path = auth, public, extensions;