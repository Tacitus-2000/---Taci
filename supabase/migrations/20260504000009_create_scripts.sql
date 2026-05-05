-- Create scripts table
-- This table stores generated content scripts

CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  usage_advice TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  visible_to_client BOOLEAN NOT NULL DEFAULT TRUE,
  internal_only BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scripts_client_id ON scripts(client_id);
CREATE INDEX IF NOT EXISTS idx_scripts_topic_id ON scripts(topic_id);
CREATE INDEX IF NOT EXISTS idx_scripts_status ON scripts(status);
CREATE INDEX IF NOT EXISTS idx_scripts_visible_to_client ON scripts(visible_to_client);
CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);

-- Create trigger for scripts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_scripts_updated_at') THEN
    CREATE TRIGGER update_scripts_updated_at
    BEFORE UPDATE ON scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE scripts IS 'Generated content scripts for clients';
COMMENT ON COLUMN scripts.client_id IS 'Associated client';
COMMENT ON COLUMN scripts.topic_id IS 'Associated topic (if applicable)';
COMMENT ON COLUMN scripts.title IS 'Script title';
COMMENT ON COLUMN scripts.body IS 'Script content body';
COMMENT ON COLUMN scripts.usage_advice IS 'Usage advice for the script';
COMMENT ON COLUMN scripts.status IS 'Script status (draft, approved, published)';
COMMENT ON COLUMN scripts.visible_to_client IS 'Whether this script is visible to the client';
COMMENT ON COLUMN scripts.internal_only IS 'Whether this is internal only';
