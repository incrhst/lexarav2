-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    application_number text UNIQUE,
    status text NOT NULL CHECK (status IN ('draft', 'pending', 'active', 'completed', 'rejected')),
    type text NOT NULL CHECK (type IN ('trademark', 'patent', 'design', 'copyright')),
    filing_date timestamptz,
    applicant_name text NOT NULL,
    description text,
    documents jsonb DEFAULT '[]',
    agent_id uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
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

-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    entity_type TEXT CHECK (entity_type IN ('application', 'opposition')),
    entity_id UUID NOT NULL,
    reminder_days INTEGER[] DEFAULT ARRAY[30, 14, 7, 1],
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints for deadlines
ALTER TABLE deadlines
ADD CONSTRAINT fk_application_deadline
FOREIGN KEY (entity_id)
REFERENCES applications(id)
ON DELETE CASCADE
WHEN (entity_type = 'application');

ALTER TABLE deadlines
ADD CONSTRAINT fk_opposition_deadline
FOREIGN KEY (entity_id)
REFERENCES oppositions(id)
ON DELETE CASCADE
WHEN (entity_type = 'opposition');

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

-- Add RLS policies for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
    ON applications FOR SELECT
    USING (agent_id = auth.uid());

CREATE POLICY "Agents can create applications"
    ON applications FOR INSERT
    WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their own applications"
    ON applications FOR UPDATE
    USING (agent_id = auth.uid())
    WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can delete their own applications"
    ON applications FOR DELETE
    USING (agent_id = auth.uid());

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
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deadlines"
    ON deadlines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines"
    ON deadlines FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines"
    ON deadlines FOR DELETE
    USING (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oppositions_updated_at
    BEFORE UPDATE ON oppositions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at
    BEFORE UPDATE ON deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 