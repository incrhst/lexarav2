-- Update user_roles table with more granular permissions
ALTER TABLE user_roles
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}';

-- Create role_permissions table for defining available permissions per role
CREATE TABLE IF NOT EXISTS role_permissions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    role text NOT NULL,
    permission_key text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(role, permission_key)
);

-- Create audit_logs table for tracking important actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Insert default role permissions
INSERT INTO role_permissions (role, permission_key, description) VALUES
    -- Admin permissions
    ('admin', 'manage_users', 'Can manage user accounts and roles'),
    ('admin', 'manage_applications', 'Can manage all applications'),
    ('admin', 'manage_system', 'Can manage system settings'),
    ('admin', 'view_audit_logs', 'Can view audit logs'),
    
    -- Agent permissions
    ('agent', 'create_applications', 'Can create new applications'),
    ('agent', 'view_own_applications', 'Can view own applications'),
    ('agent', 'file_oppositions', 'Can file oppositions'),
    ('agent', 'browse_gazette', 'Can browse and search gazette')
ON CONFLICT (role, permission_key) DO NOTHING;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
    user_id uuid,
    required_permission text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role = ur.role
        WHERE ur.user_id = check_user_permission.user_id
        AND rp.permission_key = check_user_permission.required_permission
    );
END;
$$;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    user_id uuid,
    action text,
    entity_type text,
    entity_id uuid,
    details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (user_id, action, entity_type, entity_id, details);
END;
$$;

-- Update RLS policies to use permission checks
ALTER TABLE applications DROP POLICY IF EXISTS "Users can view their own applications";
CREATE POLICY "Users can view their own applications"
    ON applications FOR SELECT
    USING (
        auth.uid() = applicant_id
        OR
        check_user_permission(auth.uid(), 'manage_applications')
    );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Add trigger for audit logging on important tables
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_event(
            auth.uid(),
            'CREATE',
            TG_TABLE_NAME::text,
            NEW.id,
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_event(
            auth.uid(),
            'UPDATE',
            TG_TABLE_NAME::text,
            NEW.id,
            jsonb_build_object(
                'old', to_jsonb(OLD),
                'new', to_jsonb(NEW)
            )
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_event(
            auth.uid(),
            'DELETE',
            TG_TABLE_NAME::text,
            OLD.id,
            to_jsonb(OLD)
        );
    END IF;
    RETURN NULL;
END;
$$;

-- Add audit triggers to important tables
CREATE TRIGGER audit_applications_changes
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_user_roles_changes
    AFTER INSERT OR UPDATE OR DELETE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes(); 