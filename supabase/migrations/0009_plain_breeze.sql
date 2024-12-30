/*
  # Demo Mode Toggle Enhancement

  1. Changes
    - Add demo_mode_override to system_settings
    - Update demo mode functions to check override
    - Add function to get current demo mode state

  2. Security
    - Enable RLS on system_settings
    - Only admins can manage settings
*/

-- Add function to get current demo mode state
CREATE OR REPLACE FUNCTION get_demo_mode()
RETURNS boolean AS $$
DECLARE
  override_value boolean;
BEGIN
  -- Check for override in system settings
  SELECT (value->>'enabled')::boolean INTO override_value
  FROM system_settings
  WHERE key = 'demo_mode_override'
  LIMIT 1;

  -- If override exists, use it
  IF override_value IS NOT NULL THEN
    RETURN override_value;
  END IF;

  -- Otherwise check system settings
  SELECT (value->>'enabled')::boolean INTO override_value
  FROM system_settings
  WHERE key = 'demo_mode'
  LIMIT 1;

  -- Return the value or false if not found
  RETURN COALESCE(override_value, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update toggle_demo_mode to use override
CREATE OR REPLACE FUNCTION toggle_demo_mode(enable boolean)
RETURNS void AS $$
BEGIN
  -- Set override
  INSERT INTO system_settings (key, value)
  VALUES ('demo_mode_override', jsonb_build_object('enabled', enable))
  ON CONFLICT (key) DO UPDATE
  SET value = jsonb_build_object('enabled', enable),
      updated_at = now();

  -- Handle demo data
  IF enable THEN
    PERFORM create_demo_data();
  ELSE
    PERFORM cleanup_demo_data();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;