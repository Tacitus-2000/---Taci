-- Create agent_runs table
-- This table tracks AI agent execution runs

CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_summary TEXT,
  output_summary TEXT,
  error_message TEXT,
  internal_only BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_runs_client_id ON agent_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_industry_id ON agent_runs(industry_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_task_type ON agent_runs(task_type);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at DESC);

-- Create trigger for agent_runs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_agent_runs_updated_at') THEN
    CREATE TRIGGER update_agent_runs_updated_at
    BEFORE UPDATE ON agent_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE agent_runs IS 'AI agent execution run tracking';
COMMENT ON COLUMN agent_runs.client_id IS 'Associated client (if applicable)';
COMMENT ON COLUMN agent_runs.industry_id IS 'Associated industry (if applicable)';
COMMENT ON COLUMN agent_runs.task_type IS 'Type of task being executed';
COMMENT ON COLUMN agent_runs.status IS 'Run status (pending, running, completed, failed)';
COMMENT ON COLUMN agent_runs.input_summary IS 'Summary of input parameters';
COMMENT ON COLUMN agent_runs.output_summary IS 'Summary of output results';
COMMENT ON COLUMN agent_runs.error_message IS 'Error message if run failed';
COMMENT ON COLUMN agent_runs.internal_only IS 'Whether this run is internal only';
