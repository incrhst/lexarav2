/*
  # Add processor role and update access policies
  
  1. Changes
    - Add 'processor' to user_role enum
    - Add processor-specific policies for application management
    - Update public access policies for gazette viewing
    
  2. Security
    - Drop and recreate policies to handle role changes
    - Add new processor policies with proper access controls
    - Enable public viewing of published applications
*/

BEGIN;

-- First, drop policies that depend on the role column
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to applications" ON applications;
DROP POLICY IF EXISTS "Admins have full access to oppositions" ON oppositions;
DROP POLICY IF EXISTS "Admins have full access to status history" ON application_status_history;

-- Update the default value to null temporarily
ALTER TABLE profiles 
  ALTER COLUMN role DROP DEFAULT;

-- Create a new enum type with the additional value
CREATE TYPE user_role_new AS ENUM ('admin', 'applicant', 'public', 'processor');

-- Update existing data and type
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role_new 
  USING (
    CASE role::text
      WHEN 'admin' THEN 'admin'::user_role_new
      WHEN 'applicant' THEN 'applicant'::user_role_new
      WHEN 'public' THEN 'public'::user_role_new
      ELSE 'public'::user_role_new
    END
  );

-- Drop old type if it exists
DROP TYPE IF EXISTS user_role;

-- Rename new type to original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Restore the default value
ALTER TABLE profiles
  ALTER COLUMN role SET DEFAULT 'public'::user_role;

-- Recreate admin policies
CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to applications"
  ON applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to oppositions"
  ON oppositions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to status history"
  ON application_status_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add processor-specific policies
CREATE POLICY "Processors can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'processor'
    )
  );

-- Create function to check processor role
CREATE OR REPLACE FUNCTION is_processor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'processor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify status-only updates
CREATE OR REPLACE FUNCTION verify_processor_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow status changes, all other fields must remain unchanged
  IF NEW.status IS DISTINCT FROM OLD.status AND
     NEW.applicant_id = OLD.applicant_id AND
     NEW.application_type = OLD.application_type AND
     NEW.filing_number IS NOT DISTINCT FROM OLD.filing_number AND
     NEW.filing_date = OLD.filing_date AND
     NEW.applicant_name = OLD.applicant_name AND
     NEW.applicant_address = OLD.applicant_address AND
     NEW.applicant_country = OLD.applicant_country AND
     NEW.contact_phone = OLD.contact_phone AND
     NEW.contact_email = OLD.contact_email AND
     NEW.trademark_name IS NOT DISTINCT FROM OLD.trademark_name AND
     NEW.trademark_description IS NOT DISTINCT FROM OLD.trademark_description AND
     NEW.goods_services_class IS NOT DISTINCT FROM OLD.goods_services_class AND
     NEW.logo_url IS NOT DISTINCT FROM OLD.logo_url AND
     NEW.use_status IS NOT DISTINCT FROM OLD.use_status AND
     NEW.territory IS NOT DISTINCT FROM OLD.territory AND
     is_processor() THEN
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for processor updates
CREATE TRIGGER enforce_processor_status_update
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION verify_processor_status_update();

-- Add processor update policy
CREATE POLICY "Processors can update application status"
  ON applications FOR UPDATE
  TO authenticated
  USING (is_processor());

-- Update opposition policies for public access
CREATE POLICY "Public can view published applications"
  ON applications FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Public can view oppositions for published applications"
  ON oppositions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = oppositions.application_id
      AND applications.status = 'published'
    )
  );

COMMIT;