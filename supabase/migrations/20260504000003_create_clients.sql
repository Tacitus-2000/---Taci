-- Create clients table
-- This table stores client information and their relationship to industries

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  package_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  content_progress INTEGER NOT NULL DEFAULT 0,
  latest_copy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_industry_id ON clients(industry_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Create trigger for clients
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
    CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE clients IS 'Client information and industry relationships';
COMMENT ON COLUMN clients.name IS 'Client name';
COMMENT ON COLUMN clients.industry_id IS 'Reference to industry category';
COMMENT ON COLUMN clients.package_name IS 'Service package name';
COMMENT ON COLUMN clients.status IS 'Client status (active, inactive, etc.)';
COMMENT ON COLUMN clients.content_progress IS 'Content generation progress percentage';
COMMENT ON COLUMN clients.latest_copy IS 'Latest generated copy text';
