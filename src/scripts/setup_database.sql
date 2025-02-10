-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create base tables
CREATE TABLE IF NOT EXISTS applications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    applicant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text DEFAULT 'draft',
    applicant_name text,
    company_name text,
    contact_email text,
    contact_phone text,
    applicant_address text,
    applicant_country text,
    application_type text CHECK (application_type IN ('trademark', 'copyright', 'patent')),
    trademark_jurisdiction text,
    work_title text,
    work_type text,
    creation_date date,
    publication_date date,
    publication_status text,
    work_description text,
    work_for_hire boolean,
    derivative_work boolean,
    original_work_details text,
    author_names text[],
    author_address text,
    author_nationality text,
    employer_name text,
    employer_address text,
    invention_title text,
    technical_field text,
    abstract text,
    detailed_description text,
    claims text[],
    prior_art text,
    related_patents text[],
    related_applications text[],
    patent_application_type text,
    priority_claim text,
    previous_registration text,
    novelty_declaration boolean,
    industrial_declaration boolean,
    inventor_declaration boolean
);

-- Create application files table
CREATE TABLE IF NOT EXISTS application_files (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    file_type text NOT NULL,
    file_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'applicant')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
    'status_change',
    'payment_confirmation',
    'document_verification',
    'opposition_notice',
    'registration_complete',
    'renewal_reminder',
    'system_update'
);

-- Create notification priority enum
CREATE TYPE notification_priority AS ENUM (
    'urgent',
    'high',
    'medium',
    'low'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    priority notification_priority DEFAULT 'medium',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_text TEXT,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    metadata JSONB,
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, type)
);

-- Create renewal notifications table
CREATE TABLE IF NOT EXISTS renewal_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('upcoming', 'urgent', 'overdue')),
    days_until_renewal INTEGER NOT NULL,
    renewal_date DATE NOT NULL,
    renewal_fee DECIMAL(10, 2) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(application_type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_application_files_app_id ON application_files(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_user_id ON renewal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_application_id ON renewal_notifications(application_id);
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_notification_type ON renewal_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_renewal_date ON renewal_notifications(renewal_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_files_updated_at
    BEFORE UPDATE ON application_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_notifications_updated_at
    BEFORE UPDATE ON renewal_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for applications
CREATE POLICY "Users can view their own applications"
    ON applications FOR SELECT
    USING (auth.uid() = applicant_id);

CREATE POLICY "Users can create their own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = applicant_id);

CREATE POLICY "Users can delete their own applications"
    ON applications FOR DELETE
    USING (auth.uid() = applicant_id);

-- Create RLS policies for application files
CREATE POLICY "Users can view their own application files"
    ON application_files FOR SELECT
    USING (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ));

CREATE POLICY "Users can insert their own application files"
    ON application_files FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ));

CREATE POLICY "Users can update their own application files"
    ON application_files FOR UPDATE
    USING (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ));

CREATE POLICY "Users can delete their own application files"
    ON application_files FOR DELETE
    USING (auth.uid() IN (
        SELECT applicant_id FROM applications WHERE id = application_id
    ));

-- Create RLS policies for user roles
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

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Create RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for renewal notifications
CREATE POLICY "Users can view their own renewal notifications"
    ON renewal_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own renewal notifications"
    ON renewal_notifications FOR UPDATE
    USING (auth.uid() = user_id);

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