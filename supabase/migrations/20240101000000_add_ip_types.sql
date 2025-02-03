-- Add new columns for application type
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_type text CHECK (application_type IN ('trademark', 'copyright', 'patent'));

-- Add columns for copyright applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS work_title text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS work_type text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS creation_date date;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS publication_date date;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS publication_status text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS work_description text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS work_for_hire boolean;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS derivative_work boolean;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS original_work_details text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS author_names text[];
ALTER TABLE applications ADD COLUMN IF NOT EXISTS author_address text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS author_nationality text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS employer_name text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS employer_address text;

-- Add columns for patent applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS invention_title text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS technical_field text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS abstract text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS detailed_description text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS claims text[];
ALTER TABLE applications ADD COLUMN IF NOT EXISTS prior_art text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS related_patents text[];
ALTER TABLE applications ADD COLUMN IF NOT EXISTS related_applications text[];
ALTER TABLE applications ADD COLUMN IF NOT EXISTS patent_application_type text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS priority_claim text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS previous_registration text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS novelty_declaration boolean;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS industrial_declaration boolean;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS inventor_declaration boolean;

-- Create a new table for application files
CREATE TABLE IF NOT EXISTS application_files (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    file_type text NOT NULL,
    file_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_application_files_updated_at
    BEFORE UPDATE ON application_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(application_type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_application_files_app_id ON application_files(application_id);

-- Add RLS policies for application files
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
    ON application_files FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own application files."
    ON application_files FOR INSERT
    WITH CHECK ( auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ) );

CREATE POLICY "Users can update their own application files."
    ON application_files FOR UPDATE
    USING ( auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ) )
    WITH CHECK ( auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ) );

CREATE POLICY "Users can delete their own application files."
    ON application_files FOR DELETE
    USING ( auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ) ); 