-- Add goods_services_class column to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS goods_services_class text[] DEFAULT '{}';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_goods_services_class 
ON applications USING gin(goods_services_class);

-- Update existing trademark applications to have empty array if null
UPDATE applications 
SET goods_services_class = '{}'
WHERE application_type = 'trademark' 
AND goods_services_class IS NULL;

-- Add trigger to ensure goods_services_class is an array for trademarks
CREATE OR REPLACE FUNCTION validate_trademark_goods_services()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_type = 'trademark' AND NEW.goods_services_class IS NULL THEN
        NEW.goods_services_class := '{}';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_trademark_goods_services
    BEFORE INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION validate_trademark_goods_services(); 