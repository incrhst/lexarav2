-- Drop existing type if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- Create role type
CREATE TYPE user_role AS ENUM ('admin', 'processor', 'user', 'agent', 'public', 'applicant');

-- Add role column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'applicant' NOT NULL;

-- Update existing profiles to have a default role
UPDATE public.profiles 
SET role = 'applicant'::user_role 
WHERE role IS NULL; 