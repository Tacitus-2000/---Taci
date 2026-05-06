import { z } from 'zod';

/**
 * Agent 状态 Schema
 * 用于多 Agent 工作流的状态管理
 */
export const agentStateSchema = z.object({
  // 客户和行业信息
  clientId: z.string().uuid(),
  industryId: z.string().uuid(),

  // 行业模板和客户档案
  industryTemplate: z.record(z.string(), z.unknown()).optional(),
  clientProfile: z.record(z.string(), z.unknown()).optional(),

  // 账号定位
  contentPosition: z.record(z.string(), z.unknown()).optional(),

  // 选题
  selectedTopic: z.record(z.string(), z.unknown()).optional(),

  // 文案草稿
  draftScript: z
    .object({
      title: z.string(),
      hook: z.string().optional(),
      body: z.string().optional(),
      cta: z.string().optional(),
      platform: z.string().optional(),
      structure_type: z.string().optional(),
      style_note: z.string().optional(),
    })
    .optional(),

  // 审查结果
  reviews: z
    .array(
      z.object({
        review_type: z.enum(['readability', 'risk']),
        passed: z.boolean(),
        score: z.number().min(0).max(100).optional(),
        issues: z.record(z.string(), z.unknown()).optional(),
        suggestions: z.record(z.string(), z.unknown()).optional(),
        reviewer: z.string().optional(),
      })
    )
    .default([]),

  // 改写控制
  rewriteCount: z.number().int().min(0).default(0),
  maxRewriteCount: z.number().int().min(1).default(3),

  // 日志
  logs: z.array(z.string()).default([]),

  // 状态
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),

  // 错误信息
  error: z.string().optional(),

  // 时间戳
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

/**
 * Agent 状态类型（从 Schema 推导）
 */
export type AgentState = z.infer<typeof agentStateSchema>;

/**
 * Agent 状态部分更新类型
 */
export type AgentStateUpdate = Partial<AgentState>;

/**
 * 客户档案类型
 */
export interface ClientProfile {
  id: string;
  clientId: string;
  name: string;
  expertise: string[];
  experience: string;
  targetAudience: string;
  contentPreferences: {
    topics?: string[];
    frequency?: string;
    platforms?: string[];
  };
  previousContent?: {
    totalPosts?: number;
    avgEngagement?: number;
    topPerformingTopics?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 行业模板类型
 */
export interface IndustryTemplate {
  id: string;
  industry: string;
  contentGuidelines: {
    tone?: string;
    style?: string;
    avoidTopics?: string[];
  };
  platformSettings: {
    preferredPlatforms?: string[];
    contentLength?: {
      short?: string;
      medium?: string;
      long?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Agent 状态初始化输入
 */
export const agentStateInitSchema = z.object({
  clientId: z.string().uuid(),
  industryId: z.string().uuid(),
  industryTemplate: z.record(z.string(), z.unknown()).optional(),
  clientProfile: z.record(z.string(), z.unknown()).optional(),
  contentPosition: z.record(z.string(), z.unknown()).optional(),
  maxRewriteCount: z.number().int().min(1).default(3),
});

/**
 * Agent 状态初始化输入类型
 */
export type AgentStateInit = z.infer<typeof agentStateInitSchema>;

/**
 * 创建初始 Agent 状态
 */
export function createInitialAgentState(init: AgentStateInit): AgentState {
  return {
    clientId: init.clientId,
    industryId: init.industryId,
    industryTemplate: init.industryTemplate,
    clientProfile: init.clientProfile,
    contentPosition: init.contentPosition,
    selectedTopic: undefined,
    draftScript: undefined,
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: init.maxRewriteCount ?? 3,
    logs: [],
    status: 'pending',
    error: undefined,
    startedAt: undefined,
    completedAt: undefined,
  };
}

/**
 * 验证 Agent 状态
 */
export function validateAgentState(state: unknown): AgentState {
  return agentStateSchema.parse(state);
}

/**
 * 安全验证 Agent 状态（返回结果而非抛出异常）
 */
export function safeValidateAgentState(
  state: unknown
): { success: true; data: AgentState } | { success: false; error: z.ZodError } {
  const result = agentStateSchema.safeParse(state);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
