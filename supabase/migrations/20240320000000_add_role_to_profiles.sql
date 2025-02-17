-- Create role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'processor', 'user', 'agent', 'public', 'applicant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'applicant' NOT NULL;

-- Update existing profiles to have a default role
UPDATE public.profiles 
SET role = 'applicant' 
WHERE role IS NULL; 