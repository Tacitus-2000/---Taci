/**
 * 客户相关类型定义
 */

import { Client, ClientProfile } from './database';

/**
 * 客户状态枚举
 */
export type ClientStatus = 'active' | 'inactive' | 'trial';

/**
 * 客户创建输入
 */
export interface CreateClientInput {
  name: string;
  industry_id?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: ClientStatus;
}

/**
 * 客户更新输入
 */
export interface UpdateClientInput {
  name?: string;
  industry_id?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: ClientStatus;
  onboarding_completed?: boolean;
}

/**
 * 客户档案创建输入
 */
export interface CreateClientProfileInput {
  client_id: string;
  industry_id: string;
  professional_name: string;
  city?: string;
  years_of_practice?: number;
  practice_areas?: string[];
  specialties?: string[];
  target_clients?: string;
  style_preference?: string;
  forbidden_expressions?: string[];
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 客户档案更新输入
 */
export interface UpdateClientProfileInput {
  professional_name?: string;
  city?: string;
  years_of_practice?: number;
  practice_areas?: string[];
  specialties?: string[];
  target_clients?: string;
  style_preference?: string;
  forbidden_expressions?: string[];
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 客户完整信息（包含档案）
 */
export interface ClientWithProfile extends Client {
  profile?: ClientProfile;
}

/**
 * 客户列表查询参数
 */
export interface ClientListQuery {
  industry_id?: string;
  status?: ClientStatus;
  onboarding_completed?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 客户档案列表查询参数
 */
export interface ClientProfileListQuery {
  client_id?: string;
  industry_id?: string;
  visible_to_client?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * ========================================
 * Client API 类型定义（客户端访问）
 * ========================================
 */

/**
 * 客户档案响应（排除 internal_notes）
 */
export type ClientProfilePublic = Omit<ClientProfile, 'internal_notes'>;

/**
 * 选题响应（只包含客户可见字段）
 */
export interface TopicPublic {
  id: string;
  client_id: string;
  industry_id: string | null;
  title: string;
  direction: string | null;
  status: 'draft' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * 文案响应（只包含客户可见字段）
 */
export interface ScriptPublic {
  id: string;
  client_id: string;
  topic_id: string | null;
  title: string;
  body: string;
  usage_advice: string | null;
  status: 'draft' | 'reviewed' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
}

/**
 * 内容日历项
 */
export interface CalendarItem {
  id: string;
  type: 'topic' | 'script';
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * 内容日历响应
 */
export interface CalendarResponse {
  items: CalendarItem[];
  summary: {
    total_topics: number;
    total_scripts: number;
    approved_topics: number;
    published_scripts: number;
  };
}

/**
 * 风格参考项
 */
export interface StyleReferenceItem {
  id: string;
  title: string;
  body: string;
  usage_advice: string | null;
  created_at: string;
}

/**
 * 风格参考响应
 */
export interface StyleReferenceResponse {
  references: StyleReferenceItem[];
  profile: {
    tone_style: string | null;
    taboo_expressions: string | null;
  };
}

/**
 * 客户反馈请求
 */
export interface ClientFeedbackRequest {
  client_id: string;
  content_type: 'profile' | 'topic' | 'script' | 'general';
  content_id?: string | null;
  feedback_text: string;
  rating?: number | null;
}

/**
 * 客户反馈响应
 */
export interface ClientFeedbackResponse {
  id: string;
  client_id: string;
  content_type: string;
  content_id: string | null;
  feedback_text: string;
  rating: number | null;
  status: string;
  created_at: string;
}

/**
 * 生成文案请求
 */
export interface GenerateScriptRequest {
  client_id: string;
  topic_id?: string | null;
  custom_direction?: string | null;
}

/**
 * 生成文案响应
 */
export interface GenerateScriptResponse {
  script_id: string;
  agent_run_id: string;
  title: string;
  body: string;
  usage_advice: string | null;
  status: string;
  created_at: string;
}
