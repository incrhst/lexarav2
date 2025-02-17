-- Verify existing tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- 1. Create Enums for Statuses

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ip_status') THEN
    CREATE TYPE ip_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'filing_status') THEN
    CREATE TYPE filing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certificate_status') THEN
    CREATE TYPE certificate_status AS ENUM ('active', 'expired', 'revoked');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opposition_status') THEN
    CREATE TYPE opposition_status AS ENUM ('draft', 'filed', 'active', 'resolved', 'withdrawn');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'disputed');
  END IF;
END$$;

-- 2. Create Missing Tables

-- (a) IP Management Table
CREATE TABLE IF NOT EXISTS ip_assets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status ip_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- (b) Filing System Table
CREATE TABLE IF NOT EXISTS filing_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  filing_date timestamptz NOT NULL DEFAULT now(),
  document_url text,
  status filing_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- (c) Certificate Management Table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  certificate_number text UNIQUE,
  issued_date date NOT NULL DEFAULT current_date,
  expiry_date date,
  status certificate_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- (d) Opposition System Table
CREATE TABLE IF NOT EXISTS opposition_cases (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  description text,
  filing_date timestamptz NOT NULL DEFAULT now(),
  status opposition_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- (e) Payment Processing Table
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_method text CHECK (payment_method IN ('card', 'bank_transfer', 'check')),
  payment_date timestamptz NOT NULL DEFAULT now(),
  status payment_status NOT NULL DEFAULT 'pending',
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable Row-Level Security (RLS)

ALTER TABLE ip_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE opposition_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Add Basic RLS Policies

-- For ip_assets: Allow users to view or modify an asset if they are the applicant (using the related application's applicant_id)
CREATE POLICY "Users can view their own IP assets"
  ON ip_assets
  FOR SELECT
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = ip_assets.application_id));

CREATE POLICY "Users can update their own IP assets"
  ON ip_assets
  FOR UPDATE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = ip_assets.application_id));

CREATE POLICY "Users can delete their own IP assets"
  ON ip_assets
  FOR DELETE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = ip_assets.application_id));

-- For filing_records
CREATE POLICY "Users can view their own filing records"
  ON filing_records
  FOR SELECT
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = filing_records.application_id));

CREATE POLICY "Users can update their own filing records"
  ON filing_records
  FOR UPDATE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = filing_records.application_id));

CREATE POLICY "Users can delete their own filing records"
  ON filing_records
  FOR DELETE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = filing_records.application_id));

-- For certificates
CREATE POLICY "Users can view their own certificates"
  ON certificates
  FOR SELECT
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = certificates.application_id));

CREATE POLICY "Users can update their own certificates"
  ON certificates
  FOR UPDATE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = certificates.application_id));

CREATE POLICY "Users can delete their own certificates"
  ON certificates
  FOR DELETE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = certificates.application_id));

-- For opposition_cases
CREATE POLICY "Users can view their own opposition cases"
  ON opposition_cases
  FOR SELECT
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = opposition_cases.application_id));

CREATE POLICY "Users can update their own opposition cases"
  ON opposition_cases
  FOR UPDATE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = opposition_cases.application_id));

CREATE POLICY "Users can delete their own opposition cases"
  ON opposition_cases
  FOR DELETE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = opposition_cases.application_id));

-- For payments
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = payments.application_id));

CREATE POLICY "Users can update their own payments"
  ON payments
  FOR UPDATE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = payments.application_id));

CREATE POLICY "Users can delete their own payments"
  ON payments
  FOR DELETE
  USING (auth.uid() = (SELECT applicant_id FROM applications WHERE id = payments.application_id));

-- 5. Create Necessary Indexes

CREATE INDEX IF NOT EXISTS idx_ip_assets_status ON ip_assets(status);
CREATE INDEX IF NOT EXISTS idx_ip_assets_application_id ON ip_assets(application_id);

CREATE INDEX IF NOT EXISTS idx_filing_records_status ON filing_records(status);
CREATE INDEX IF NOT EXISTS idx_filing_records_application_id ON filing_records(application_id);

CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_application_id ON certificates(application_id);

CREATE INDEX IF NOT EXISTS idx_opposition_cases_status ON opposition_cases(status);
CREATE INDEX IF NOT EXISTS idx_opposition_cases_application_id ON opposition_cases(application_id);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id); 