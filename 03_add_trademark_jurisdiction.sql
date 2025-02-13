-- Create trademark jurisdiction type
CREATE TYPE trademark_jurisdiction AS ENUM ('local', 'uk', 'wipo');

-- Add jurisdiction column to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS trademark_jurisdiction trademark_jurisdiction;

-- Update existing applications to 'local' jurisdiction
UPDATE applications 
SET trademark_jurisdiction = 'local'
WHERE application_type = 'trademark' AND trademark_jurisdiction IS NULL;

-- Create index for jurisdiction queries
CREATE INDEX IF NOT EXISTS idx_applications_trademark_jurisdiction 
ON applications(trademark_jurisdiction) 
WHERE application_type = 'trademark';

-- Add check constraint to ensure jurisdiction is set for trademarks
ALTER TABLE applications
ADD CONSTRAINT chk_trademark_jurisdiction
CHECK (
    (application_type = 'trademark' AND trademark_jurisdiction IS NOT NULL) OR
    (application_type != 'trademark' AND trademark_jurisdiction IS NULL)
); 