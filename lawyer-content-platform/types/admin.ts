/**
 * Admin API 类型定义
 * 用于 Admin API 的请求和响应类型
 */

import {
  Client,
  ClientProfile,
  Topic,
  Script,
  AgentRun,
  AgentRunStep,
  PromptTemplate,
} from './database';

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 分页响应元数据
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Clients API
 */
export interface ClientCreateRequest {
  name: string;
  industry_id?: string | null;
  package_name?: string | null;
  status?: string;
}

export interface ClientUpdateRequest {
  name?: string;
  industry_id?: string | null;
  package_name?: string | null;
  status?: string;
  content_progress?: number;
  latest_copy?: string | null;
}

export type ClientResponse = Client;
export type ClientListResponse = PaginatedResponse<Client>;

/**
 * Client Profiles API
 */
export interface ClientProfileCreateRequest {
  client_id: string;
  industry_id?: string | null;
  client_name: string;
  industry_name?: string | null;
  niche_direction?: string | null;
  target_customer?: string | null;
  advantages?: string | null;
  customer_pain_points?: string | null;
  tone_style?: string | null;
  taboo_expressions?: string | null;
  conversion_goal?: string | null;
  internal_notes?: string | null;
  visible_to_client?: boolean;
}

export interface ClientProfileUpdateRequest {
  client_id?: string;
  industry_id?: string | null;
  client_name?: string;
  industry_name?: string | null;
  niche_direction?: string | null;
  target_customer?: string | null;
  advantages?: string | null;
  customer_pain_points?: string | null;
  tone_style?: string | null;
  taboo_expressions?: string | null;
  conversion_goal?: string | null;
  internal_notes?: string | null;
  visible_to_client?: boolean;
}

export type ClientProfileResponse = ClientProfile;
export type ClientProfileListResponse = PaginatedResponse<ClientProfile>;

/**
 * Topics API
 */
export interface TopicCreateRequest {
  client_id: string;
  industry_id?: string | null;
  title: string;
  direction?: string | null;
  status?: 'draft' | 'approved' | 'rejected';
  visible_to_client?: boolean;
  internal_only?: boolean;
}

export interface TopicUpdateRequest {
  client_id?: string;
  industry_id?: string | null;
  title?: string;
  direction?: string | null;
  status?: 'draft' | 'approved' | 'rejected';
  visible_to_client?: boolean;
  internal_only?: boolean;
}

export type TopicResponse = Topic;
export type TopicListResponse = PaginatedResponse<Topic>;

/**
 * Scripts API
 */
export interface ScriptCreateRequest {
  client_id: string;
  topic_id?: string | null;
  title: string;
  body: string;
  usage_advice?: string | null;
  status?: 'draft' | 'reviewed' | 'approved' | 'published';
  visible_to_client?: boolean;
  internal_only?: boolean;
}

export interface ScriptUpdateRequest {
  client_id?: string;
  topic_id?: string | null;
  title?: string;
  body?: string;
  usage_advice?: string | null;
  status?: 'draft' | 'reviewed' | 'approved' | 'published';
  visible_to_client?: boolean;
  internal_only?: boolean;
}

export type ScriptResponse = Script;
export type ScriptListResponse = PaginatedResponse<Script>;

/**
 * Agent Runs API（只读）
 */
export interface AgentRunQueryParams extends PaginationParams {
  client_id?: string;
  industry_id?: string;
  task_type?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AgentRunWithSteps extends AgentRun {
  steps?: AgentRunStep[];
}

export type AgentRunResponse = AgentRunWithSteps;
export type AgentRunListResponse = PaginatedResponse<AgentRun>;

/**
 * Reviews API（只读）
 * 注意：reviews 数据来自 agent_run_steps 表，筛选 agent_name 包含 'review' 的记录
 */
export interface ReviewQueryParams extends PaginationParams {
  client_id?: string;
  agent_name?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export type ReviewResponse = AgentRunStep;
export type ReviewListResponse = PaginatedResponse<AgentRunStep>;

/**
 * Prompts API
 */
export interface PromptCreateRequest {
  industry_id?: string | null;
  agent_type:
    | 'supervisor'
    | 'data'
    | 'profile'
    | 'topic'
    | 'script'
    | 'readability_review'
    | 'risk_review'
    | 'rewrite';
  template_name: string;
  template_body?: string;
  system_prompt?: string | null;
  user_prompt_template?: string | null;
  description?: string | null;
  version?: string;
  active?: boolean;
  created_by?: string;
}

export interface PromptUpdateRequest {
  industry_id?: string | null;
  agent_type?:
    | 'supervisor'
    | 'data'
    | 'profile'
    | 'topic'
    | 'script'
    | 'readability_review'
    | 'risk_review'
    | 'rewrite';
  template_name?: string;
  template_body?: string;
  system_prompt?: string | null;
  user_prompt_template?: string | null;
  description?: string | null;
  version?: string;
  active?: boolean;
}

export type PromptResponse = PromptTemplate;
export type PromptListResponse = PaginatedResponse<PromptTemplate>;
