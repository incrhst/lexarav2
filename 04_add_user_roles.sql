-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'applicant')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
    ON user_roles FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM user_roles WHERE role = 'admin'
        )
        OR
        (SELECT COUNT(*) FROM user_roles) = 0  -- Allow first user to be created
    );

CREATE POLICY "Only admins can update roles"
    ON user_roles FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles WHERE role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 