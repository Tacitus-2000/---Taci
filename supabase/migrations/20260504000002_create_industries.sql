-- Create industries table
-- This table stores industry categories for client classification

CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for active industries lookup
CREATE INDEX IF NOT EXISTS idx_industries_is_active ON industries(is_active);
CREATE INDEX IF NOT EXISTS idx_industries_code ON industries(code);

-- Create trigger for industries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_industries_updated_at') THEN
    CREATE TRIGGER update_industries_updated_at
    BEFORE UPDATE ON industries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE industries IS 'Industry categories for client classification';
COMMENT ON COLUMN industries.code IS 'Unique industry code identifier';
COMMENT ON COLUMN industries.name IS 'Display name of the industry';
COMMENT ON COLUMN industries.is_active IS 'Whether this industry is currently active';
