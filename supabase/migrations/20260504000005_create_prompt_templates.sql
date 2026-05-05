-- Create prompt_templates table
-- This table stores AI prompt templates for different agent types

CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_body TEXT NOT NULL,
  version TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompt_templates_industry_id ON prompt_templates(industry_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_agent_type ON prompt_templates(agent_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(active);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_version ON prompt_templates(version);

-- Create trigger for prompt_templates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompt_templates_updated_at') THEN
    CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE prompt_templates IS 'AI prompt templates for different agent types';
COMMENT ON COLUMN prompt_templates.industry_id IS 'Optional industry-specific template';
COMMENT ON COLUMN prompt_templates.agent_type IS 'Type of AI agent (e.g., content_generator, reviewer)';
COMMENT ON COLUMN prompt_templates.template_name IS 'Human-readable template name';
COMMENT ON COLUMN prompt_templates.template_body IS 'The actual prompt template text';
COMMENT ON COLUMN prompt_templates.version IS 'Template version identifier';
COMMENT ON COLUMN prompt_templates.active IS 'Whether this template is currently active';
