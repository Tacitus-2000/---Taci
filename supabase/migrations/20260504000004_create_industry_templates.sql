-- Create industry_templates table
-- This table stores industry-specific templates and configurations

CREATE TABLE IF NOT EXISTS industry_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  template_code TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  default_content_columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_prompt_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  topic_structure JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_industry_templates_industry_id ON industry_templates(industry_id);
CREATE INDEX IF NOT EXISTS idx_industry_templates_template_code ON industry_templates(template_code);
CREATE INDEX IF NOT EXISTS idx_industry_templates_active ON industry_templates(active);

-- Create trigger for industry_templates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_industry_templates_updated_at') THEN
    CREATE TRIGGER update_industry_templates_updated_at
    BEFORE UPDATE ON industry_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE industry_templates IS 'Industry-specific templates and configurations';
COMMENT ON COLUMN industry_templates.template_code IS 'Unique template code identifier';
COMMENT ON COLUMN industry_templates.default_content_columns IS 'Default content column configuration (JSON array)';
COMMENT ON COLUMN industry_templates.review_rules IS 'Content review rules (JSON array)';
COMMENT ON COLUMN industry_templates.default_prompt_types IS 'Default prompt types for this template (JSON array)';
COMMENT ON COLUMN industry_templates.topic_structure IS 'Topic structure configuration (JSON)';
COMMENT ON COLUMN industry_templates.risk_rules IS 'Risk assessment rules (JSON array)';
