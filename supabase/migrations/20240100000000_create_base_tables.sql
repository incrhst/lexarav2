-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the applications table
CREATE TABLE IF NOT EXISTS applications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    applicant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text DEFAULT 'draft',
    applicant_name text,
    company_name text,
    contact_email text,
    contact_phone text,
    applicant_address text,
    applicant_country text
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own applications."
    ON applications FOR SELECT
    USING (auth.uid() = applicant_id);

CREATE POLICY "Users can create their own applications."
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications."
    ON applications FOR UPDATE
    USING (auth.uid() = applicant_id);

CREATE POLICY "Users can delete their own applications."
    ON applications FOR DELETE
    USING (auth.uid() = applicant_id); 