/**
 * 数据库表类型定义
 * 与 supabase/schema.sql 对齐
 */

export type VisibilityFlag = boolean;
export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';
export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TopicStatus = 'draft' | 'approved' | 'rejected';
export type ScriptStatus = 'draft' | 'reviewed' | 'approved' | 'published';
export type PromptTemplateAgentType =
  | 'supervisor'
  | 'data'
  | 'profile'
  | 'topic'
  | 'script'
  | 'readability_review'
  | 'risk_review'
  | 'rewrite';

export interface Profile {
  id: string;
  user_id: string | null;
  email: string | null;
  role: 'admin' | 'client';
  created_at: string;
  updated_at: string;
}

export interface Industry {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  industry_id: string | null;
  package_name: string | null;
  status: string;
  content_progress: number;
  latest_copy: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  client_id: string;
  industry_id: string | null;
  client_name: string;
  industry_name: string | null;
  niche_direction: string | null;
  target_customer: string | null;
  advantages: string | null;
  customer_pain_points: string | null;
  tone_style: string | null;
  taboo_expressions: string | null;
  conversion_goal: string | null;
  internal_notes: string | null;
  visible_to_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndustryTemplate {
  id: string;
  industry_id: string;
  template_code: string;
  template_name: string;
  default_content_columns: unknown[];
  review_rules: unknown[];
  default_prompt_types: unknown[];
  topic_structure: unknown[];
  risk_rules: unknown[];
  active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPosition {
  id: string;
  client_id: string;
  account_position: string;
  target_audience: string;
  content_columns: Record<string, unknown>;
  differentiation: string;
  visible_to_client: boolean;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  id: string;
  client_id: string | null;
  industry_id: string | null;
  task_type: string;
  status: AgentRunStatus;
  input_summary: string | null;
  output_summary: string | null;
  error_message: string | null;
  internal_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentRunStep {
  id: string;
  agent_run_id: string;
  agent_name: string;
  role: string;
  input_payload: Record<string, unknown> | null;
  output_payload: Record<string, unknown> | null;
  status: AgentRunStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  client_id: string;
  industry_id: string | null;
  title: string;
  direction: string | null;
  status: TopicStatus;
  visible_to_client: boolean;
  internal_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  client_id: string;
  topic_id: string | null;
  title: string;
  body: string;
  usage_advice: string | null;
  status: ScriptStatus;
  visible_to_client: boolean;
  internal_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplate {
  id: string;
  industry_id: string | null;
  agent_type: PromptTemplateAgentType;
  template_name: string;
  template_body: string;
  system_prompt: string | null;
  user_prompt_template: string | null;
  description: string | null;
  version: string;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  status: WorkflowStatus;
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface AgentExecution {
  id: string;
  workflow_id: string;
  agent_type: 'positioning' | 'topic' | 'content' | 'review' | 'rewrite';
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

export interface Database {
  users: User;
  profiles: Profile;
  industries: Industry;
  clients: Client;
  client_profiles: ClientProfile;
  industry_templates: IndustryTemplate;
  agent_runs: AgentRun;
  agent_run_steps: AgentRunStep;
  topics: Topic;
  scripts: Script;
  prompt_templates: PromptTemplate;
  workflows: Workflow;
  agent_executions: AgentExecution;
}

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type IndustryInsert = Omit<Industry, 'id' | 'created_at' | 'updated_at'>;
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type ClientProfileInsert = Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'>;
export type IndustryTemplateInsert = Omit<IndustryTemplate, 'id' | 'created_at' | 'updated_at'>;
export type AgentRunInsert = Omit<AgentRun, 'id' | 'created_at' | 'updated_at'>;
export type AgentRunStepInsert = Omit<AgentRunStep, 'id' | 'created_at' | 'updated_at'>;
export type TopicInsert = Omit<Topic, 'id' | 'created_at' | 'updated_at'>;
export type ScriptInsert = Omit<Script, 'id' | 'created_at' | 'updated_at'>;
export type PromptTemplateInsert = Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>;
export type WorkflowInsert = Omit<Workflow, 'id' | 'created_at' | 'updated_at'>;
export type AgentExecutionInsert = Omit<AgentExecution, 'id'>;

export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;
export type IndustryUpdate = Partial<Omit<Industry, 'id' | 'created_at'>>;
export type ClientUpdate = Partial<Omit<Client, 'id' | 'created_at'>>;
export type ClientProfileUpdate = Partial<Omit<ClientProfile, 'id' | 'created_at'>>;
export type IndustryTemplateUpdate = Partial<Omit<IndustryTemplate, 'id' | 'created_at'>>;
export type AgentRunUpdate = Partial<Omit<AgentRun, 'id' | 'created_at'>>;
export type AgentRunStepUpdate = Partial<Omit<AgentRunStep, 'id' | 'created_at'>>;
export type TopicUpdate = Partial<Omit<Topic, 'id' | 'created_at'>>;
export type ScriptUpdate = Partial<Omit<Script, 'id' | 'created_at'>>;
export type PromptTemplateUpdate = Partial<Omit<PromptTemplate, 'id' | 'created_at'>>;
export type WorkflowUpdate = Partial<Omit<Workflow, 'id' | 'created_at'>>;
export type AgentExecutionUpdate = Partial<Omit<AgentExecution, 'id'>>;
