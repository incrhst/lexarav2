/*
  # Update user roles

  This migration updates the user role enum to replace 'applicant' with 'user'
  to better reflect that users can both submit applications and file oppositions.

  1. Changes
    - Update user_role enum to replace 'applicant' with 'user'
    - Update existing profiles with the new role name
    - Update policies to use new role names
*/

-- First, drop dependent policies
DROP POLICY IF EXISTS "Processors can view all applications" ON applications;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage demo data" ON demo_data;

-- Drop the column default temporarily
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Update existing data to use temporary text type
ALTER TABLE profiles 
  ALTER COLUMN role TYPE text;

-- Update the values
UPDATE profiles 
SET role = 'user'
WHERE role = 'applicant';

-- Drop the enum type
DROP TYPE user_role;

-- Create new enum type
CREATE TYPE user_role AS ENUM ('admin', 'processor', 'user', 'public');

-- Convert column back to enum and set default
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'public'::user_role;

-- Recreate policies with new role values
CREATE POLICY "Processors can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'processor'
    )
  );

CREATE POLICY "Admins can manage system settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage demo data"
  ON demo_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );