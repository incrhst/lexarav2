/*
  # Fix Profile Policies

  1. Changes
    - Remove recursive admin policies
    - Add proper role-based access control
    - Fix infinite recursion in profile policies
  
  2. Security
    - Maintains proper access control
    - Prevents policy recursion
    - Preserves data security
*/

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, non-recursive policies for profiles
CREATE POLICY "Anyone can read public profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "New users can insert profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id 
    AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies before recreating them
DROP POLICY IF EXISTS "Admins have full access to applications" ON applications;
DROP POLICY IF EXISTS "Admins have full access to oppositions" ON oppositions;
DROP POLICY IF EXISTS "Admins have full access to status history" ON application_status_history;

-- Create new admin policies using the is_admin function
CREATE POLICY "Admins have full access to applications"
  ON applications FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins have full access to oppositions"
  ON oppositions FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins have full access to status history"
  ON application_status_history FOR ALL
  USING (is_admin(auth.uid()));