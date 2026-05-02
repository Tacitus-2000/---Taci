-- 律师内容平台数据库 Schema
-- 当前仅同步项目规划中的数据库方向，保留后续多行业扩展空间。

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  package_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  content_progress INTEGER NOT NULL DEFAULT 0,
  latest_copy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_clients_industry_id ON clients(industry_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_client_id ON client_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_industry_templates_industry_id ON industry_templates(industry_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_client_id ON agent_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_agent_run_steps_agent_run_id ON agent_run_steps(agent_run_id);
CREATE INDEX IF NOT EXISTS idx_topics_client_id ON topics(client_id);
CREATE INDEX IF NOT EXISTS idx_scripts_client_id ON scripts(client_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_industry_id ON prompt_templates(industry_id);
