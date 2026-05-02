/**
 * Agent 相关类型定义
 */

import type { AgentRun, AgentRunStep } from './database';

export type AgentType =
  | 'supervisor'
  | 'data'
  | 'profile'
  | 'topic'
  | 'script'
  | 'readability_review'
  | 'risk_review'
  | 'rewrite';

export type AgentTaskType =
  | 'generate_profile'
  | 'generate_topics'
  | 'generate_script';

export type AgentStatus = 'running' | 'completed' | 'failed';

export interface CreateAgentRunInput {
  client_id?: string;
  task_type: AgentTaskType;
  status: AgentStatus;
  input_payload?: Record<string, unknown>;
  output_payload?: Record<string, unknown>;
  error_message?: string;
  visible_to_client?: boolean;
}

export interface UpdateAgentRunInput {
  status?: AgentStatus;
  output_payload?: Record<string, unknown>;
  error_message?: string;
  completed_at?: string;
}

export interface CreateAgentRunStepInput {
  agent_run_id: string;
  agent_name: AgentType;
  step_order: number;
  status: AgentStatus;
  input_payload?: Record<string, unknown>;
  output_payload?: Record<string, unknown>;
  error_message?: string;
  visible_to_client?: boolean;
}

export interface UpdateAgentRunStepInput {
  status?: AgentStatus;
  output_payload?: Record<string, unknown>;
  error_message?: string;
  completed_at?: string;
}

export interface CreatePromptTemplateInput {
  industry_id?: string;
  name: string;
  agent_type: AgentType;
  version: string;
  content: string;
  is_active?: boolean;
  description?: string;
}

export interface UpdatePromptTemplateInput {
  name?: string;
  content?: string;
  is_active?: boolean;
  description?: string;
}

export interface AgentRunWithSteps extends AgentRun {
  steps?: AgentRunStep[];
}

export interface AgentRunListQuery {
  client_id?: string;
  task_type?: AgentTaskType;
  status?: AgentStatus;
  visible_to_client?: boolean;
  limit?: number;
  offset?: number;
}

export interface AgentRunStepListQuery {
  agent_run_id?: string;
  agent_name?: AgentType;
  status?: AgentStatus;
  visible_to_client?: boolean;
  limit?: number;
  offset?: number;
}

export interface PromptTemplateListQuery {
  industry_id?: string;
  agent_type?: AgentType;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface AgentContext {
  client_id?: string;
  industry_id?: string;
  client_profile?: Record<string, unknown>;
  industry_template?: Record<string, unknown>;
  content_position?: Record<string, unknown>;
}

export interface AgentInput<T = Record<string, unknown>> {
  context: AgentContext;
  data: T;
}

export interface AgentOutput<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

export type { AgentState, AgentStateUpdate, AgentStateInit } from '../lib/schemas/agentStateSchema';

export interface PositioningInput {
  client_name: string;
  industry_name: string;
  niche_direction?: string;
  target_customer?: string;
  advantages?: string;
  customer_pain_points?: string;
  tone_style?: string;
  conversion_goal?: string;
}

export interface PositioningOutput {
  professionalFields: string[];
  targetAudience: string[];
  contentDirection: string[];
  uniqueAdvantages: string[];
  recommendedTopics: string[];
}

export interface TopicInput {
  positioning: PositioningOutput;
  count?: number;
}

export interface TopicOutput {
  topics: Array<{
    title: string;
    description: string;
    targetAudience: string;
    keywords: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedLength: number;
  }>;
}

export interface ContentInput {
  topic: TopicOutput['topics'][0];
  positioning: PositioningOutput;
  style?: 'professional' | 'casual' | 'educational';
  length?: 'short' | 'medium' | 'long';
}

export interface ContentOutput {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  sections: Array<{
    heading: string;
    content: string;
  }>;
}

export interface ReviewInput {
  content: ContentOutput;
  positioning: PositioningOutput;
}

export interface ReviewOutput {
  approved: boolean;
  score: number;
  issues: Array<{
    type: 'compliance' | 'risk' | 'quality' | 'accuracy';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }>;
  suggestions: string[];
  needsRewrite: boolean;
}

export interface RewriteInput {
  content: ContentOutput;
  reviewFeedback: ReviewOutput;
  positioning: PositioningOutput;
}

export interface RewriteOutput {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  sections: Array<{
    heading: string;
    content: string;
  }>;
  changes: Array<{
    type: string;
    description: string;
  }>;
}

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}
