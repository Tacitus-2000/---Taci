-- Create agent_run_steps table
-- This table tracks individual steps within agent runs

CREATE TABLE IF NOT EXISTS agent_run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  role TEXT NOT NULL,
  input_payload JSONB,
  output_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_agent_run_id ON agent_run_steps(agent_run_id);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_agent_name ON agent_run_steps(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_status ON agent_run_steps(status);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_created_at ON agent_run_steps(created_at DESC);

-- Create trigger for agent_run_steps
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_agent_run_steps_updated_at') THEN
    CREATE TRIGGER update_agent_run_steps_updated_at
    BEFORE UPDATE ON agent_run_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE agent_run_steps IS 'Individual steps within agent execution runs';
COMMENT ON COLUMN agent_run_steps.agent_run_id IS 'Parent agent run';
COMMENT ON COLUMN agent_run_steps.agent_name IS 'Name of the agent executing this step';
COMMENT ON COLUMN agent_run_steps.role IS 'Role of the agent in this step';
COMMENT ON COLUMN agent_run_steps.input_payload IS 'Input data for this step (JSON)';
COMMENT ON COLUMN agent_run_steps.output_payload IS 'Output data from this step (JSON)';
COMMENT ON COLUMN agent_run_steps.status IS 'Step status (pending, running, completed, failed)';
COMMENT ON COLUMN agent_run_steps.error_message IS 'Error message if step failed';
