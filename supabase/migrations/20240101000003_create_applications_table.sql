-- Create sequence for filing number generation if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS id_sequence START 1;

-- Add new fields to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS filing_number TEXT UNIQUE;

-- Create function to generate filing number
CREATE OR REPLACE FUNCTION generate_filing_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.filing_number := CONCAT(
    CASE NEW.application_type
      WHEN 'trademark' THEN 'TM'
      WHEN 'copyright' THEN 'CR'
      WHEN 'patent' THEN 'PT'
    END,
    '-',
    TO_CHAR(NEW.filing_date, 'YYYYMMDD'),
    '-',
    LPAD(CAST(nextval('id_sequence') AS TEXT), 6, '0')
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to generate filing number
DROP TRIGGER IF EXISTS generate_filing_number_trigger ON applications;
CREATE TRIGGER generate_filing_number_trigger
  BEFORE INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_filing_number();

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at timestamp if it doesn't exist
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 