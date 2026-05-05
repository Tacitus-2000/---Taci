-- Create client_feedback_v2 table
-- This migration creates the client_feedback_v2 table for storing client feedback

-- Create new client_feedback_v2 table
CREATE TABLE IF NOT EXISTS client_feedback_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content_id UUID,
  content_type TEXT NOT NULL,
  feedback_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_feedback_v2_client_id ON client_feedback_v2(client_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_v2_content_id ON client_feedback_v2(content_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_v2_content_type ON client_feedback_v2(content_type);
CREATE INDEX IF NOT EXISTS idx_client_feedback_v2_status ON client_feedback_v2(status);
CREATE INDEX IF NOT EXISTS idx_client_feedback_v2_created_at ON client_feedback_v2(created_at DESC);

-- Create trigger for client_feedback_v2
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_feedback_v2_updated_at') THEN
    CREATE TRIGGER update_client_feedback_v2_updated_at
    BEFORE UPDATE ON client_feedback_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE client_feedback_v2 IS 'Client feedback on generated content (v2)';
COMMENT ON COLUMN client_feedback_v2.client_id IS 'Client who provided the feedback';
COMMENT ON COLUMN client_feedback_v2.content_id IS 'ID of the content being reviewed (topic, script, etc.)';
COMMENT ON COLUMN client_feedback_v2.content_type IS 'Type of content (topic, script, etc.)';
COMMENT ON COLUMN client_feedback_v2.feedback_text IS 'Feedback text from client';
COMMENT ON COLUMN client_feedback_v2.rating IS 'Rating from 1 to 5';
COMMENT ON COLUMN client_feedback_v2.status IS 'Feedback status (pending, reviewed, resolved)';
COMMENT ON COLUMN client_feedback_v2.admin_response IS 'Admin response to feedback';
COMMENT ON COLUMN client_feedback_v2.responded_at IS 'Timestamp when admin responded';
