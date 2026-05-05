-- Enable Row Level Security (RLS) on all business tables
-- This migration enables RLS but does not create policies yet
-- Policies should be created in subsequent migrations based on business requirements

-- Enable RLS on all tables
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback_v2 ENABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE industries IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE clients IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE client_profiles IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE industry_templates IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE agent_runs IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE agent_run_steps IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE topics IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE scripts IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE prompt_templates IS 'RLS enabled - policies to be defined';
COMMENT ON TABLE client_feedback_v2 IS 'RLS enabled - policies to be defined';
