-- Create function to safely create the first admin user
CREATE OR REPLACE FUNCTION create_first_admin(admin_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Only proceed if there are no existing users in user_roles
    IF NOT EXISTS (SELECT 1 FROM user_roles) THEN
        INSERT INTO user_roles (user_id, role)
        VALUES (admin_user_id, 'admin');
    ELSE
        RAISE EXCEPTION 'Cannot create first admin: users already exist';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 