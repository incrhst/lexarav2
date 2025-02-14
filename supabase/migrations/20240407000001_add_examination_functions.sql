-- Create examination records table
CREATE TABLE IF NOT EXISTS examination_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    examiner_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL CHECK (status IN ('pending_review', 'under_examination', 'office_action', 'response_required', 'approved', 'rejected', 'withdrawn')),
    checklist JSONB NOT NULL DEFAULT '{
        "formalRequirements": {
            "completed": false,
            "items": []
        },
        "substantiveExamination": {
            "completed": false,
            "items": []
        },
        "classification": {
            "completed": false,
            "items": []
        }
    }',
    decision JSONB DEFAULT '{}',
    notes JSONB DEFAULT '[]',
    timeline JSONB DEFAULT '[]',
    office_actions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_examination_records_application_id ON examination_records(application_id);
CREATE INDEX IF NOT EXISTS idx_examination_records_examiner_id ON examination_records(examiner_id);
CREATE INDEX IF NOT EXISTS idx_examination_records_status ON examination_records(status);

-- Function to create examination record
CREATE OR REPLACE FUNCTION create_examination_record(
    p_application_id UUID,
    p_examiner_id UUID
) RETURNS examination_records AS $$
DECLARE
    v_record examination_records;
BEGIN
    INSERT INTO examination_records (
        application_id,
        examiner_id,
        status,
        checklist,
        timeline
    ) VALUES (
        p_application_id,
        p_examiner_id,
        'pending_review',
        '{
            "formalRequirements": {
                "completed": false,
                "items": [
                    {"id": "form_1", "description": "Application form completeness", "status": "pending"},
                    {"id": "form_2", "description": "Required documents submitted", "status": "pending"},
                    {"id": "form_3", "description": "Fees paid", "status": "pending"},
                    {"id": "form_4", "description": "Power of attorney", "status": "pending"}
                ]
            },
            "substantiveExamination": {
                "completed": false,
                "items": [
                    {"id": "subst_1", "description": "Distinctiveness check", "status": "pending"},
                    {"id": "subst_2", "description": "Similarity search", "status": "pending"},
                    {"id": "subst_3", "description": "Absolute grounds", "status": "pending"},
                    {"id": "subst_4", "description": "Relative grounds", "status": "pending"}
                ]
            },
            "classification": {
                "completed": false,
                "items": [
                    {"id": "class_1", "description": "Nice Classification accuracy", "status": "pending"},
                    {"id": "class_2", "description": "Specification clarity", "status": "pending"},
                    {"id": "class_3", "description": "Class scope appropriateness", "status": "pending"}
                ]
            }
        }',
        jsonb_build_array(
            jsonb_build_object(
                'id', uuid_generate_v4(),
                'action', 'Examination started',
                'timestamp', NOW(),
                'actor', p_examiner_id
            )
        )
    ) RETURNING * INTO v_record;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update examination record
CREATE OR REPLACE FUNCTION update_examination_record(
    p_record_id UUID,
    p_updates JSONB
) RETURNS examination_records AS $$
DECLARE
    v_record examination_records;
BEGIN
    UPDATE examination_records
    SET
        checklist = COALESCE(p_updates->>'checklist', checklist),
        status = COALESCE(p_updates->>'status', status),
        decision = COALESCE(p_updates->>'decision', decision),
        notes = COALESCE(p_updates->>'notes', notes),
        timeline = COALESCE(p_updates->>'timeline', timeline),
        office_actions = COALESCE(p_updates->>'office_actions', office_actions),
        updated_at = NOW()
    WHERE id = p_record_id
    RETURNING * INTO v_record;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add examination note
CREATE OR REPLACE FUNCTION add_examination_note(
    p_record_id UUID,
    p_examiner_id UUID,
    p_content TEXT,
    p_type TEXT DEFAULT 'internal'
) RETURNS examination_records AS $$
DECLARE
    v_record examination_records;
    v_note JSONB;
BEGIN
    v_note = jsonb_build_object(
        'id', uuid_generate_v4(),
        'examinerId', p_examiner_id,
        'content', p_content,
        'timestamp', NOW(),
        'type', p_type
    );
    
    UPDATE examination_records
    SET notes = notes || v_note
    WHERE id = p_record_id
    RETURNING * INTO v_record;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add office action
CREATE OR REPLACE FUNCTION add_office_action(
    p_record_id UUID,
    p_type TEXT,
    p_content TEXT,
    p_due_date TIMESTAMPTZ
) RETURNS examination_records AS $$
DECLARE
    v_record examination_records;
    v_action JSONB;
BEGIN
    v_action = jsonb_build_object(
        'id', uuid_generate_v4(),
        'type', p_type,
        'content', p_content,
        'issuedDate', NOW(),
        'dueDate', p_due_date,
        'status', 'pending'
    );
    
    UPDATE examination_records
    SET 
        office_actions = office_actions || v_action,
        status = 'office_action'
    WHERE id = p_record_id
    RETURNING * INTO v_record;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update application status when examination status changes
CREATE OR REPLACE FUNCTION update_application_status() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        UPDATE applications
        SET status = CASE
            WHEN NEW.status = 'approved' THEN 'approved'
            WHEN NEW.status = 'rejected' THEN 'rejected'
            WHEN NEW.status = 'office_action' THEN 'office_action'
            WHEN NEW.status = 'withdrawn' THEN 'withdrawn'
            ELSE 'under_review'
        END
        WHERE id = NEW.application_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER examination_status_change
    AFTER UPDATE OF status ON examination_records
    FOR EACH ROW
    EXECUTE FUNCTION update_application_status();

-- RLS Policies
ALTER TABLE examination_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiners can view all records"
    ON examination_records FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Examiners can insert records"
    ON examination_records FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Examiners can update their own records"
    ON examination_records FOR UPDATE
    USING (auth.uid() = examiner_id)
    WITH CHECK (auth.uid() = examiner_id);

-- Create views for easier querying
CREATE OR REPLACE VIEW pending_applications AS
SELECT 
    a.id,
    a.title,
    a.reference,
    a.status,
    a.created_at,
    e.id as examination_id,
    e.examiner_id,
    e.status as examination_status
FROM applications a
LEFT JOIN examination_records e ON a.id = e.application_id
WHERE a.status = 'submitted'
OR (a.status = 'under_review' AND e.status IN ('pending_review', 'under_examination'));

GRANT SELECT ON pending_applications TO authenticated; 