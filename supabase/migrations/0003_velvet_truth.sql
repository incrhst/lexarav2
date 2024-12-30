/*
  # Add demo mode functionality
  
  1. New Tables
    - `system_settings`: Stores global system settings like demo mode status
    - `demo_data`: Stores sample data templates for demo mode
  
  2. Functions
    - `toggle_demo_mode`: Enables/disables demo mode and manages sample data
    - `create_demo_data`: Creates sample users and applications
    - `cleanup_demo_data`: Removes demo data when demo mode is disabled
  
  3. Security
    - Only admins can toggle demo mode
    - Demo data is clearly marked
*/

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create demo data templates table
CREATE TABLE IF NOT EXISTS demo_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  template jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_data ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for system settings
CREATE POLICY "Admins can manage system settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin-only policies for demo data
CREATE POLICY "Admins can manage demo data"
  ON demo_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create demo data
CREATE OR REPLACE FUNCTION create_demo_data() 
RETURNS void AS $$
DECLARE
  demo_user_id uuid;
  demo_admin_id uuid;
  demo_processor_id uuid;
BEGIN
  -- Create demo users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
  VALUES 
    (gen_random_uuid(), 'demo.user@example.com', crypt('demo123', gen_salt('bf')), now()),
    (gen_random_uuid(), 'demo.admin@example.com', crypt('demo123', gen_salt('bf')), now()),
    (gen_random_uuid(), 'demo.processor@example.com', crypt('demo123', gen_salt('bf')), now())
  RETURNING id INTO demo_user_id;

  -- Create demo profiles
  INSERT INTO profiles (id, role, full_name, company_name)
  VALUES
    (demo_user_id, 'applicant', 'Demo User', 'Demo Company'),
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
  VALUES
    (
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
    ),
    (
      demo_user_id,
      'trademark',
      'published',
      'TM2024002',
      now() - interval '30 days',
      'Demo User',
      '123 Demo St, Demo City',
      'US',
      '+1234567890',
      'demo.user@example.com',
      'TestBrand',
      'Another demonstration trademark',
      ARRAY['35', '41'],
      'inUse',
      ARRAY['US']
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup demo data
CREATE OR REPLACE FUNCTION cleanup_demo_data() 
RETURNS void AS $$
BEGIN
  -- Delete demo applications
  DELETE FROM applications 
  WHERE applicant_id IN (
    SELECT id FROM profiles 
    WHERE email LIKE 'demo.%@example.com'
  );
  
  -- Delete demo profiles
  DELETE FROM profiles 
  WHERE email LIKE 'demo.%@example.com';
  
  -- Delete demo users
  DELETE FROM auth.users 
  WHERE email LIKE 'demo.%@example.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle demo mode
CREATE OR REPLACE FUNCTION toggle_demo_mode(enable boolean)
RETURNS void AS $$
BEGIN
  IF enable THEN
    -- Enable demo mode
    INSERT INTO system_settings (key, value)
    VALUES ('demo_mode', '{"enabled": true}'::jsonb)
    ON CONFLICT (key) DO UPDATE
    SET value = '{"enabled": true}'::jsonb,
        updated_at = now();
    
    -- Create demo data
    PERFORM create_demo_data();
  ELSE
    -- Disable demo mode
    INSERT INTO system_settings (key, value)
    VALUES ('demo_mode', '{"enabled": false}'::jsonb)
    ON CONFLICT (key) DO UPDATE
    SET value = '{"enabled": false}'::jsonb,
        updated_at = now();
    
    -- Cleanup demo data
    PERFORM cleanup_demo_data();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;