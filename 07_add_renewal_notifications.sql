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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_renewal_notifications_user_id 
    ON renewal_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_renewal_notifications_application_id 
    ON renewal_notifications(application_id);

CREATE INDEX IF NOT EXISTS idx_renewal_notifications_notification_type 
    ON renewal_notifications(notification_type);

CREATE INDEX IF NOT EXISTS idx_renewal_notifications_renewal_date 
    ON renewal_notifications(renewal_date);

-- Add RLS policies
ALTER TABLE renewal_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON renewal_notifications;
CREATE POLICY "Users can view their own notifications"
    ON renewal_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON renewal_notifications;
CREATE POLICY "Users can update their own notifications"
    ON renewal_notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_renewal_notifications_updated_at
    BEFORE UPDATE ON renewal_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 