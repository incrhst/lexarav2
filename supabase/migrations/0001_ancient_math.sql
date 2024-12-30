/*
  # Initial Schema for IP Management System

  1. New Tables
    - `profiles`
      - User profiles with role information
    - `applications`
      - IP applications (trademarks, copyrights, patents)
    - `oppositions`
      - Opposition records against applications
    - `application_status_history`
      - Track status changes of applications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin access
*/

-- Create custom types
CREATE TYPE application_type AS ENUM ('trademark', 'copyright', 'patent');
CREATE TYPE application_status AS ENUM ('submitted', 'underReview', 'published', 'opposed', 'allowed', 'registered', 'rejected');
CREATE TYPE opposition_status AS ENUM ('submitted', 'pending', 'approved', 'rejected');
CREATE TYPE use_status AS ENUM ('inUse', 'intentToUse');
CREATE TYPE user_role AS ENUM ('admin', 'applicant', 'public');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'public',
  full_name text,
  company_name text,
  address text,
  country text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  application_type application_type NOT NULL,
  status application_status NOT NULL DEFAULT 'submitted',
  filing_number text UNIQUE,
  filing_date timestamptz DEFAULT now(),
  applicant_name text NOT NULL,
  applicant_address text NOT NULL,
  applicant_country text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  -- Trademark specific fields
  trademark_name text,
  trademark_description text,
  goods_services_class text[],
  logo_url text,
  use_status use_status,
  territory text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Application Status History table
CREATE TABLE IF NOT EXISTS application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  status application_status NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Oppositions table
CREATE TABLE IF NOT EXISTS oppositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  opponent_id uuid REFERENCES profiles(id),
  opponent_name text NOT NULL,
  reason text NOT NULL,
  status opposition_status NOT NULL DEFAULT 'submitted',
  evidence_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE oppositions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Applications policies
CREATE POLICY "Public can read published applications"
  ON applications FOR SELECT
  TO authenticated
  USING (status = 'published' OR auth.uid() = applicant_id);

CREATE POLICY "Applicants can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = applicant_id AND status = 'submitted');

-- Opposition policies
CREATE POLICY "Public can read oppositions"
  ON oppositions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can submit oppositions"
  ON oppositions FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Status history policies
CREATE POLICY "Users can read status history"
  ON application_status_history FOR SELECT
  TO authenticated
  USING (TRUE);

-- Create admin policies
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

-- Functions
CREATE OR REPLACE FUNCTION update_application_status(
  application_id uuid,
  new_status application_status,
  notes text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Update the application status
  UPDATE applications
  SET 
    status = new_status,
    updated_at = now()
  WHERE id = application_id;

  -- Insert status history record
  INSERT INTO application_status_history
    (application_id, status, changed_by, notes)
  VALUES
    (application_id, new_status, auth.uid(), notes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;