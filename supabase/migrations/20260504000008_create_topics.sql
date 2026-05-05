-- Create topics table
-- This table stores content topics for clients

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  direction TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  visible_to_client BOOLEAN NOT NULL DEFAULT TRUE,
  internal_only BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_topics_client_id ON topics(client_id);
CREATE INDEX IF NOT EXISTS idx_topics_industry_id ON topics(industry_id);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_visible_to_client ON topics(visible_to_client);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at DESC);

-- Create trigger for topics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_topics_updated_at') THEN
    CREATE TRIGGER update_topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE topics IS 'Content topics for client content generation';
COMMENT ON COLUMN topics.client_id IS 'Associated client';
COMMENT ON COLUMN topics.industry_id IS 'Associated industry';
COMMENT ON COLUMN topics.title IS 'Topic title';
COMMENT ON COLUMN topics.direction IS 'Content direction or angle';
COMMENT ON COLUMN topics.status IS 'Topic status (draft, approved, published)';
COMMENT ON COLUMN topics.visible_to_client IS 'Whether this topic is visible to the client';
COMMENT ON COLUMN topics.internal_only IS 'Whether this is internal only';
