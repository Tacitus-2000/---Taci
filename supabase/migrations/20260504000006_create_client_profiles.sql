-- Create client_profiles table
-- This table stores detailed client profiles and preferences

CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  industry_name TEXT,
  niche_direction TEXT,
  target_customer TEXT,
  advantages TEXT,
  customer_pain_points TEXT,
  tone_style TEXT,
  taboo_expressions TEXT,
  conversion_goal TEXT,
  internal_notes TEXT,
  visible_to_client BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_client_id ON client_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_industry_id ON client_profiles(industry_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_visible_to_client ON client_profiles(visible_to_client);

-- Create trigger for client_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_profiles_updated_at') THEN
    CREATE TRIGGER update_client_profiles_updated_at
    BEFORE UPDATE ON client_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE client_profiles IS 'Detailed client profiles and content preferences';
COMMENT ON COLUMN client_profiles.client_id IS 'Reference to client';
COMMENT ON COLUMN client_profiles.niche_direction IS 'Client niche or specialization';
COMMENT ON COLUMN client_profiles.target_customer IS 'Target customer description';
COMMENT ON COLUMN client_profiles.advantages IS 'Client competitive advantages';
COMMENT ON COLUMN client_profiles.customer_pain_points IS 'Customer pain points to address';
COMMENT ON COLUMN client_profiles.tone_style IS 'Preferred content tone and style';
COMMENT ON COLUMN client_profiles.taboo_expressions IS 'Words or phrases to avoid';
COMMENT ON COLUMN client_profiles.conversion_goal IS 'Content conversion goals';
COMMENT ON COLUMN client_profiles.internal_notes IS 'Internal notes (not visible to client)';
COMMENT ON COLUMN client_profiles.visible_to_client IS 'Whether this profile is visible to the client';
