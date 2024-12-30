/*
  # Fix Profile Creation

  1. Changes
    - Add improved profile creation trigger
    - Add missing indexes
    - Add helper function for profile creation

  2. Security
    - Maintain RLS policies
    - Ensure secure profile creation
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile with retry logic
  FOR i IN 1..3 LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        role,
        full_name
      )
      VALUES (
        NEW.id,
        NEW.email,
        CASE 
          WHEN NEW.email LIKE 'demo.%@example.com' THEN 
            CASE 
              WHEN NEW.email = 'demo.admin@example.com' THEN 'admin'::user_role
              WHEN NEW.email = 'demo.processor@example.com' THEN 'processor'::user_role
              ELSE 'user'::user_role
            END
          ELSE 'user'::user_role
        END,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          split_part(NEW.email, '@', 1)
        )
      )
      ON CONFLICT (id) DO UPDATE
      SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        updated_at = now();
      
      EXIT; -- Success, exit loop
    EXCEPTION 
      WHEN unique_violation THEN
        -- Only retry on unique violation
        IF i < 3 THEN 
          CONTINUE;
        ELSE
          RAISE EXCEPTION 'Failed to create profile after % attempts', i;
        END IF;
      WHEN others THEN
        -- Log other errors and continue
        RAISE WARNING 'Error creating profile: %', SQLERRM;
        RETURN NEW;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Add function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO profiles (id, email, role, full_name)
  SELECT 
    id,
    email,
    'user'::user_role,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  FROM auth.users
  WHERE id = user_id
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;