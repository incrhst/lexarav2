-- Create examination records table if it doesn't exist
CREATE TABLE IF NOT EXISTS examination_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    examiner_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending_review',
    checklist JSONB DEFAULT '{
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
    }'::jsonb,
    decision JSONB DEFAULT NULL,
    notes JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    office_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_examination_records_application_id ON examination_records(application_id);
CREATE INDEX IF NOT EXISTS idx_examination_records_examiner_id ON examination_records(examiner_id);
CREATE INDEX IF NOT EXISTS idx_examination_records_status ON examination_records(status);

-- Create or replace functions (functions are always replaced)
CREATE OR REPLACE FUNCTION create_examination_record(
    p_application_id UUID,
    p_examiner_id UUID
) RETURNS examination_records AS $$
DECLARE
    v_record examination_records;
BEGIN
    -- Check if record already exists
    SELECT * INTO v_record
    FROM examination_records
    WHERE application_id = p_application_id;
    
    IF v_record.id IS NOT NULL THEN
        RETURN v_record;
    END IF;

    -- Insert new record
    INSERT INTO examination_records (
        application_id,
        examiner_id,
        checklist,
        timeline
    )
    VALUES (
        p_application_id,
        p_examiner_id,
        '{
            "formalRequirements": {
                "completed": false,
                "items": [
                    {"id": "1", "description": "Application form completeness", "status": "pending"},
                    {"id": "2", "description": "Required documents present", "status": "pending"},
                    {"id": "3", "description": "Fees paid", "status": "pending"}
                ]
            },
            "substantiveExamination": {
                "completed": false,
                "items": [
                    {"id": "1", "description": "Distinctiveness check", "status": "pending"},
                    {"id": "2", "description": "Similarity search", "status": "pending"},
                    {"id": "3", "description": "Absolute grounds", "status": "pending"}
                ]
            },
            "classification": {
                "completed": false,
                "items": [
                    {"id": "1", "description": "Nice classification check", "status": "pending"},
                    {"id": "2", "description": "Specification review", "status": "pending"}
                ]
            }
        }'::jsonb,
        jsonb_build_array(
            jsonb_build_object(
                'id', uuid_generate_v4(),
                'action', 'Examination started',
                'timestamp', NOW(),
                'actor', p_examiner_id
            )
        )
    )
    RETURNING * INTO v_record;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
        decision = COALESCE(p_updates->>'decision', decision),
        notes = COALESCE(p_updates->>'notes', notes),
        timeline = COALESCE(p_updates->>'timeline', timeline),
        office_actions = COALESCE(p_updates->>'office_actions', office_actions),
        status = COALESCE(p_updates->>'status', status),
        updated_at = NOW()
    WHERE id = p_record_id
    RETURNING * INTO v_record;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_examination_note(
    p_record_id UUID,
    p_examiner_id UUID,
    p_content TEXT,
    p_type TEXT DEFAULT 'internal'
) RETURNS examination_records AS $$
DECLARE
    v_record examination_records;
    v_note jsonb;
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

CREATE OR REPLACE FUNCTION add_office_action(
    p_record_id UUID,
    p_type TEXT,
    p_content TEXT,
    p_due_date TIMESTAMPTZ
) RETURNS examination_records AS $$
DECLARE
    v_record examination_records;
    v_action jsonb;
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
        status = 'office_action_issued'
    WHERE id = p_record_id
    RETURNING * INTO v_record;
    
    RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_application_status() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE applications
        SET status = 'approved'
        WHERE id = NEW.application_id;
    ELSIF NEW.status = 'rejected' THEN
        UPDATE applications
        SET status = 'rejected'
        WHERE id = NEW.application_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS examination_status_change ON examination_records;
CREATE TRIGGER examination_status_change
    AFTER UPDATE OF status ON examination_records
    FOR EACH ROW
    EXECUTE FUNCTION update_application_status();

-- Drop and recreate view with new column names
DROP VIEW IF EXISTS pending_applications;
CREATE VIEW pending_applications AS
SELECT 
    a.id as application_id,
    a.status as application_status,
    a.created_at as submission_date,
    a.applicant_name,
    a.contact_email,
    a.company_name,
    e.id as examination_id,
    e.examiner_id,
    e.status as examination_status
FROM applications a
LEFT JOIN examination_records e ON a.id = e.application_id
WHERE a.status = 'submitted'
OR (a.status = 'under_review' AND e.status IN ('pending_review', 'under_examination'));

-- Drop existing permissions if any and grant new ones
REVOKE ALL ON pending_applications FROM authenticated;
REVOKE ALL ON FUNCTION create_examination_record FROM authenticated;
REVOKE ALL ON FUNCTION update_examination_record FROM authenticated;
REVOKE ALL ON FUNCTION add_examination_note FROM authenticated;
REVOKE ALL ON FUNCTION add_office_action FROM authenticated;

GRANT SELECT ON pending_applications TO authenticated;
GRANT EXECUTE ON FUNCTION create_examination_record TO authenticated;
GRANT EXECUTE ON FUNCTION update_examination_record TO authenticated;
GRANT EXECUTE ON FUNCTION add_examination_note TO authenticated;
GRANT EXECUTE ON FUNCTION add_office_action TO authenticated;

-- RLS Policies
ALTER TABLE examination_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Examiners can view all records" ON examination_records;
DROP POLICY IF EXISTS "Examiners can insert records" ON examination_records;
DROP POLICY IF EXISTS "Examiners can update their own records" ON examination_records;

-- Create policies
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