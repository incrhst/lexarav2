-- Create stored procedure for creating applications
CREATE OR REPLACE FUNCTION create_application(
  p_applicant_id UUID,
  p_application_type application_type,
  p_applicant_name TEXT,
  p_applicant_address TEXT,
  p_applicant_country TEXT,
  p_contact_phone TEXT,
  p_contact_email TEXT,
  p_representative TEXT,
  p_details JSONB,
  p_attachments JSONB,
  p_logo_url TEXT,
  p_trademark_name TEXT,
  p_trademark_description TEXT,
  p_goods_services_class TEXT[],
  p_use_status use_status,
  p_territory TEXT[]
) RETURNS applications AS $$
DECLARE
  v_application applications;
BEGIN
  INSERT INTO applications (
    applicant_id,
    application_type,
    applicant_name,
    applicant_address,
    applicant_country,
    contact_phone,
    contact_email,
    representative,
    details,
    attachments,
    status,
    logo_url,
    trademark_name,
    trademark_description,
    goods_services_class,
    use_status,
    territory
  ) VALUES (
    p_applicant_id,
    p_application_type,
    p_applicant_name,
    p_applicant_address,
    p_applicant_country,
    p_contact_phone,
    p_contact_email,
    p_representative,
    p_details,
    p_attachments,
    'submitted',
    p_logo_url,
    p_trademark_name,
    p_trademark_description,
    p_goods_services_class,
    p_use_status,
    p_territory
  )
  RETURNING * INTO v_application;

  RETURN v_application;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 