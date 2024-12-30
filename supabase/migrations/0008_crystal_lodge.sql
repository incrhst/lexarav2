/*
  # Add Agent Role Support

  1. Schema Updates
    - Add 'agent' to user_role enum
    - Create agent_clients table for managing agent-client relationships
    - Add agent_id column to applications table
  
  2. Security
    - Enable RLS on new table
    - Add policies for agent access
*/

-- First, drop dependent policies
DROP POLICY IF EXISTS "Processors can view all applications" ON applications;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage demo data" ON demo_data;

-- Drop the column default temporarily
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Update existing data to use temporary text type
ALTER TABLE profiles ALTER COLUMN role TYPE text;

-- Drop the enum type
DROP TYPE user_role;

-- Create new enum type with agent role
CREATE TYPE user_role AS ENUM ('admin', 'processor', 'user', 'agent', 'public');

-- Convert column back to enum and set default
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'public'::user_role;

-- Create agent_clients table
CREATE TABLE IF NOT EXISTS agent_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  company_name text NOT NULL,
  contact_email text,
  contact_phone text,
  address text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add agent_id to applications
ALTER TABLE applications
ADD COLUMN agent_id uuid REFERENCES profiles(id),
ADD COLUMN client_id uuid REFERENCES agent_clients(id);

-- Enable RLS
ALTER TABLE agent_clients ENABLE ROW LEVEL SECURITY;

-- Agent clients policies
CREATE POLICY "Agents can manage their own clients"
  ON agent_clients
  FOR ALL
  TO authenticated
  USING (
    agent_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Application policies for agents
CREATE POLICY "Agents can view their clients' applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid() OR
    applicant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Agents can create applications for their clients"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM agent_clients
      WHERE id = client_id AND agent_id = auth.uid()
    )
  );

-- Recreate dropped policies
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

-- Create indexes
CREATE INDEX idx_agent_clients_agent_id ON agent_clients(agent_id);
CREATE INDEX idx_applications_agent_id ON applications(agent_id);
CREATE INDEX idx_applications_client_id ON applications(client_id);