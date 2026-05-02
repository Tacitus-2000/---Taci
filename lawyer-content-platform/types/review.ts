/**
 * 审查相关类型定义
 */

/**
 * 审查类型枚举
 */
export type ReviewType = 'readability' | 'risk';

/**
 * 审查结果
 */
export interface ReviewResult {
  passed: boolean;
  score?: number;
  issues?: ReviewIssue[];
  suggestions?: ReviewSuggestion[];
}

/**
 * 审查问题
 */
export interface ReviewIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  location?: {
    start: number;
    end: number;
  };
  context?: string;
}

/**
 * 审查建议
 */
export interface ReviewSuggestion {
  type: string;
  message: string;
  original?: string;
  suggested?: string;
  reason?: string;
}

/**
 * 可读性审查结果
 */
export interface ReadabilityReviewResult extends ReviewResult {
  metrics?: {
    sentence_length_avg?: number;
    jargon_count?: number;
    example_count?: number;
  };
}

/**
 * 风险审查结果
 */
export interface RiskReviewResult extends ReviewResult {
  risk_level?: 'low' | 'medium' | 'high';
  forbidden_keywords_found?: string[];
  sensitive_topics_found?: string[];
  compliance_issues?: string[];
}

/**
 * 文案审查创建输入
 */
export interface CreateScriptReviewInput {
  script_id: string;
  review_type: ReviewType;
  passed: boolean;
  score?: number;
  issues?: Record<string, unknown>;
  suggestions?: Record<string, unknown>;
  reviewer?: string;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 文案审查更新输入
 */
export interface UpdateScriptReviewInput {
  passed?: boolean;
  score?: number;
  issues?: Record<string, unknown>;
  suggestions?: Record<string, unknown>;
  reviewer?: string;
  visible_to_client?: boolean;
  internal_notes?: string;
}

/**
 * 文案审查列表查询参数
 */
export interface ScriptReviewListQuery {
  script_id?: string;
  review_type?: ReviewType;
  passed?: boolean;
  visible_to_client?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 审查配置
 */
export interface ReviewConfig {
  readability?: {
    max_sentence_length?: number;
    avoid_jargon?: boolean;
    require_examples?: boolean;
  };
  risk?: {
    forbidden_keywords?: string[];
    sensitive_topics?: string[];
    compliance_rules?: string[];
  };
}

/**
 * 审查请求
 */
export interface ReviewRequest {
  script_id: string;
  content: {
    title: string;
    hook?: string;
    body?: string;
    cta?: string;
  };
  review_type: ReviewType;
  config?: ReviewConfig;
}

/**
 * 审查响应
 */
export interface ReviewResponse {
  review_id: string;
  script_id: string;
  review_type: ReviewType;
  result: ReviewResult;
  created_at: string;
}
