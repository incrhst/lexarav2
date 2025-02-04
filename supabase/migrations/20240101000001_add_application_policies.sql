-- Enable RLS for applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to create applications
CREATE POLICY "Allow users to create applications" ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

-- Create policy to allow users to view their own applications
CREATE POLICY "Allow users to view own applications" ON applications
  FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

-- Create policy to allow users to update their own applications
CREATE POLICY "Allow users to update own applications" ON applications
  FOR UPDATE
  TO authenticated
  USING (applicant_id = auth.uid())
  WITH CHECK (applicant_id = auth.uid());

-- Create policy to allow users to delete their own applications
CREATE POLICY "Allow users to delete own applications" ON applications
  FOR DELETE
  TO authenticated
  USING (applicant_id = auth.uid()); 