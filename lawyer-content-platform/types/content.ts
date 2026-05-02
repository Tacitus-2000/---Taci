/**
 * 内容相关类型定义
 */

import { ContentPosition, Topic, Script } from './database';

/**
 * 内容类型枚举
 */
export type ContentType = '科普' | '案例' | '避坑' | '流程';

/**
 * 风险等级枚举
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * 选题状态枚举
 */
export type TopicStatus = 'draft' | 'approved' | 'rejected';

/**
 * 文案状态枚举
 */
export type ScriptStatus = 'draft' | 'reviewed' | 'approved' | 'published';

/**
 * 平台枚举
 */
export type Platform = 'douyin' | 'xiaohongshu' | 'shipin';

/**
 * 账号定位创建输入
 */
export interface CreateContentPositionInput {
  client_id: string;
  client_profile_id?: string;
  account_position: string;
  target_audience?: string;
  content_columns?: Record<string, unknown>;
  differentiation?: string;
  content_boundary?: Record<string, unknown>;
  conversion_strategy?: string;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 账号定位更新输入
 */
export interface UpdateContentPositionInput {
  account_position?: string;
  target_audience?: string;
  content_columns?: Record<string, unknown>;
  differentiation?: string;
  content_boundary?: Record<string, unknown>;
  conversion_strategy?: string;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 选题创建输入
 */
export interface CreateTopicInput {
  client_id: string;
  client_profile_id?: string;
  content_position_id?: string;
  title: string;
  client_pain_point?: string;
  content_type?: string;
  conversion_goal?: string;
  risk_level?: RiskLevel;
  priority?: number;
  industry_specific_data?: Record<string, unknown>;
  status?: TopicStatus;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 选题更新输入
 */
export interface UpdateTopicInput {
  title?: string;
  client_pain_point?: string;
  content_type?: string;
  conversion_goal?: string;
  risk_level?: RiskLevel;
  priority?: number;
  industry_specific_data?: Record<string, unknown>;
  status?: TopicStatus;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 文案创建输入
 */
export interface CreateScriptInput {
  client_id: string;
  topic_id?: string;
  client_profile_id?: string;
  content_position_id?: string;
  title: string;
  hook?: string;
  body?: string;
  cta?: string;
  platform?: Platform;
  structure_type?: string;
  style_note?: string;
  version?: number;
  status?: ScriptStatus;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 文案更新输入
 */
export interface UpdateScriptInput {
  title?: string;
  hook?: string;
  body?: string;
  cta?: string;
  platform?: Platform;
  structure_type?: string;
  style_note?: string;
  version?: number;
  status?: ScriptStatus;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 选题完整信息（包含关联数据）
 */
export interface TopicWithRelations extends Topic {
  content_position?: ContentPosition;
  scripts?: Script[];
}

/**
 * 文案完整信息（包含关联数据）
 */
export interface ScriptWithRelations extends Script {
  topic?: Topic;
  content_position?: ContentPosition;
}

/**
 * 账号定位列表查询参数
 */
export interface ContentPositionListQuery {
  client_id?: string;
  client_profile_id?: string;
  visible_to_client?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 选题列表查询参数
 */
export interface TopicListQuery {
  client_id?: string;
  client_profile_id?: string;
  content_position_id?: string;
  content_type?: string;
  risk_level?: RiskLevel;
  status?: TopicStatus;
  visible_to_client?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 文案列表查询参数
 */
export interface ScriptListQuery {
  client_id?: string;
  topic_id?: string;
  client_profile_id?: string;
  content_position_id?: string;
  platform?: Platform;
  status?: ScriptStatus;
  visible_to_client?: boolean;
  limit?: number;
  offset?: number;
}
