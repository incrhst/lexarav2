-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text,
    due_date timestamptz NOT NULL,
    completed boolean DEFAULT false,
    priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    entity_type text NOT NULL CHECK (entity_type IN ('application', 'opposition')),
    entity_id uuid NOT NULL,
    reminder_days integer[] DEFAULT '{7,3,1}',
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT entity_reference CHECK (
        (entity_type = 'application' AND entity_id IN (SELECT id FROM applications)) OR
        (entity_type = 'opposition' AND entity_id IN (SELECT id FROM oppositions))
    )
);

-- Create oppositions table
CREATE TABLE IF NOT EXISTS oppositions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id uuid REFERENCES applications(id) NOT NULL,
    opponent_id uuid REFERENCES auth.users(id) NOT NULL,
    status text NOT NULL CHECK (status IN ('draft', 'pending', 'active', 'resolved', 'withdrawn')),
    grounds text NOT NULL,
    filing_date timestamptz NOT NULL,
    resolution_date timestamptz,
    resolution_details text,
    documents jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_agent_id ON applications(agent_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_oppositions_application_id ON oppositions(application_id);
CREATE INDEX IF NOT EXISTS idx_oppositions_opponent_id ON oppositions(opponent_id);
CREATE INDEX IF NOT EXISTS idx_oppositions_status ON oppositions(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_entity ON deadlines(entity_type, entity_id);

-- Add RLS policies for oppositions
ALTER TABLE oppositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view oppositions they filed"
    ON oppositions FOR SELECT
    USING (opponent_id = auth.uid());

CREATE POLICY "Users can create oppositions"
    ON oppositions FOR INSERT
    WITH CHECK (opponent_id = auth.uid());

CREATE POLICY "Users can update their own oppositions"
    ON oppositions FOR UPDATE
    USING (opponent_id = auth.uid())
    WITH CHECK (opponent_id = auth.uid());

CREATE POLICY "Users can delete their own oppositions"
    ON oppositions FOR DELETE
    USING (opponent_id = auth.uid());

-- Add RLS policies for deadlines
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deadlines"
    ON deadlines FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create deadlines"
    ON deadlines FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own deadlines"
    ON deadlines FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own deadlines"
    ON deadlines FOR DELETE
    USING (user_id = auth.uid());

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_oppositions_updated_at
    BEFORE UPDATE ON oppositions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at
    BEFORE UPDATE ON deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 