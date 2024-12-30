-- Improve demo mode check function
CREATE OR REPLACE FUNCTION public.is_demo_mode()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM system_settings 
    WHERE key = 'demo_mode' 
    AND (value->>'enabled')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_demo_mode TO anon, authenticated;

-- Enable demo mode by default
INSERT INTO system_settings (key, value)
VALUES ('demo_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = '{"enabled": true}'::jsonb;

-- Ensure demo data exists
SELECT demo.create_demo_data();