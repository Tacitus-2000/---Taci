/**
 * 行业相关类型定义
 */

import { Industry, IndustryTemplate } from './database';

/**
 * 行业模板类型枚举
 */
export type TemplateType = 'content_columns' | 'review_rules' | 'topic_structure' | 'risk_rules';

/**
 * 行业创建输入
 */
export interface CreateIndustryInput {
  name: string;
  display_name: string;
  description?: string;
  is_active?: boolean;
}

/**
 * 行业更新输入
 */
export interface UpdateIndustryInput {
  name?: string;
  display_name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * 行业模板创建输入
 */
export interface CreateIndustryTemplateInput {
  industry_id: string;
  template_type: TemplateType;
  name: string;
  config: Record<string, unknown>;
  is_default?: boolean;
  description?: string;
}

/**
 * 行业模板更新输入
 */
export interface UpdateIndustryTemplateInput {
  name?: string;
  config?: Record<string, unknown>;
  is_default?: boolean;
  description?: string;
}

/**
 * 行业完整信息（包含模板）
 */
export interface IndustryWithTemplates extends Industry {
  templates?: IndustryTemplate[];
}

/**
 * 内容栏目配置
 */
export interface ContentColumnsConfig {
  columns: Array<{
    name: string;
    description: string;
  }>;
}

/**
 * 审查规则配置
 */
export interface ReviewRulesConfig {
  readability: {
    max_sentence_length: number;
    avoid_jargon: boolean;
    require_examples: boolean;
  };
  risk: {
    forbidden_keywords: string[];
    sensitive_topics: string[];
    compliance_rules: string[];
  };
}

/**
 * 选题结构配置
 */
export interface TopicStructureConfig {
  content_types: string[];
  case_types?: string[];
  client_types?: string[];
  pain_points: string[];
}

/**
 * 风险规则配置
 */
export interface RiskRulesConfig {
  high_risk: {
    keywords: string[];
    actions: string[];
  };
  medium_risk: {
    keywords: string[];
    actions: string[];
  };
  low_risk: {
    keywords: string[];
    actions: string[];
  };
}

/**
 * 行业模板配置类型映射
 */
export type TemplateConfigMap = {
  content_columns: ContentColumnsConfig;
  review_rules: ReviewRulesConfig;
  topic_structure: TopicStructureConfig;
  risk_rules: RiskRulesConfig;
};

/**
 * 行业列表查询参数
 */
export interface IndustryListQuery {
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 行业模板列表查询参数
 */
export interface IndustryTemplateListQuery {
  industry_id?: string;
  template_type?: TemplateType;
  is_default?: boolean;
  limit?: number;
  offset?: number;
}
