-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies with anonymous access for registration
CREATE POLICY "Enable insert access for authenticated and anonymous users"
  ON public.profiles FOR INSERT
  WITH CHECK (true);  -- Allow any insert, as the profile ID is linked to auth.users

CREATE POLICY "Enable read access for users"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'anon');

-- Create a policy to enable reading public profiles
CREATE POLICY "Enable read access to public profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Update the applications policies to allow anonymous users to view public data
CREATE POLICY "Enable public read access to applications"
  ON public.applications FOR SELECT
  USING (true);

-- Grant necessary permissions to the anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT INSERT ON public.profiles TO anon;
GRANT SELECT ON public.applications TO anon; 