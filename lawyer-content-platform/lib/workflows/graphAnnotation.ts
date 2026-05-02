/**
 * Shared Graph Annotation
 * 所有工作流共享的 Graph Annotation 定义
 */

import { Annotation } from '@langchain/langgraph';

/**
 * 定义 Graph Annotation
 * 基于 AgentState，配置数组字段的 reducer
 */
export const GraphAnnotation = Annotation.Root({
  // 基础字段
  clientId: Annotation<string>({
    value: (left, right) => right ?? left,
  }),
  industryId: Annotation<string>({
    value: (left, right) => right ?? left,
  }),

  // 数据字段
  industryTemplate: Annotation<Record<string, unknown> | undefined>({
    value: (left, right) => right ?? left,
  }),
  clientProfile: Annotation<Record<string, unknown> | undefined>({
    value: (left, right) => right ?? left,
  }),
  contentPosition: Annotation<Record<string, unknown> | undefined>({
    value: (left, right) => right ?? left,
  }),
  selectedTopic: Annotation<Record<string, unknown> | undefined>({
    value: (left, right) => right ?? left,
  }),
  draftScript: Annotation<
    | {
        title: string;
        hook?: string;
        body?: string;
        cta?: string;
        platform?: string;
        structure_type?: string;
        style_note?: string;
      }
    | undefined
  >({
    value: (left, right) => right ?? left,
  }),

  // 数组字段 - 使用 reducer 合并
  reviews: Annotation<
    Array<{
      review_type: 'readability' | 'risk';
      passed: boolean;
      score?: number;
      issues?: Record<string, unknown>;
      suggestions?: Record<string, unknown>;
      reviewer?: string;
    }>
  >({
    reducer: (left, right) => {
      if (!left) return right || [];
      if (!right) return left;
      return [...left, ...right];
    },
    default: () => [],
  }),

  logs: Annotation<string[]>({
    reducer: (left, right) => {
      if (!left) return right || [];
      if (!right) return left;
      return [...left, ...right];
    },
    default: () => [],
  }),

  // 控制字段
  rewriteCount: Annotation<number>({
    value: (left, right) => right ?? left ?? 0,
    default: () => 0,
  }),
  maxRewriteCount: Annotation<number>({
    value: (left, right) => right ?? left ?? 3,
    default: () => 3,
  }),
  status: Annotation<'pending' | 'running' | 'completed' | 'failed'>({
    value: (left, right) => right ?? left ?? 'pending',
    default: () => 'pending',
  }),
  error: Annotation<string | undefined>({
    value: (left, right) => right ?? left,
  }),
  startedAt: Annotation<string | undefined>({
    value: (left, right) => right ?? left,
  }),
  completedAt: Annotation<string | undefined>({
    value: (left, right) => right ?? left,
  }),
});
