/**
 * Workflows Index
 * 统一导出所有 LangGraph 工作流
 */

// Profile Workflow - 档案生成工作流
export {
  createProfileWorkflow,
  executeProfileWorkflow,
} from './profileWorkflowGraph';

// Topic Workflow - 选题生成工作流
export {
  createTopicWorkflow,
  executeTopicWorkflow,
} from './topicWorkflowGraph';

// Script Workflow - 完整文案生成工作流
export {
  createScriptWorkflow,
  executeScriptWorkflow,
} from './scriptWorkflowGraph';

/**
 * 工作流类型定义
 */
export type WorkflowType = 'profile' | 'topic' | 'script';

/**
 * 工作流输入参数
 */
export interface WorkflowInput {
  clientId: string;
  industryId: string;
  maxRewriteCount?: number;
}

/**
 * 工作流执行结果
 */
export interface WorkflowResult {
  success: boolean;
  result?: {
    clientId: string;
    industryId: string;
    industryTemplate?: Record<string, unknown>;
    clientProfile?: Record<string, unknown>;
    contentPosition?: Record<string, unknown>;
    selectedTopic?: Record<string, unknown>;
    draftScript?: {
      title: string;
      hook?: string;
      body?: string;
      cta?: string;
      platform?: string;
      structure_type?: string;
      style_note?: string;
    };
    reviews: Array<{
      review_type: 'readability' | 'risk';
      passed: boolean;
      score?: number;
      issues?: Record<string, unknown>;
      suggestions?: Record<string, unknown>;
      reviewer?: string;
    }>;
    logs: string[];
    rewriteCount: number;
    maxRewriteCount: number;
    status: 'completed' | 'failed';
    error?: string;
    startedAt?: string;
    completedAt?: string;
  };
  error?: string;
  status?: 'failed';
}

/**
 * 工作流执行器
 * 根据类型执行对应的工作流
 */
export async function executeWorkflow(
  type: WorkflowType,
  input: WorkflowInput
): Promise<WorkflowResult> {
  switch (type) {
    case 'profile':
      return (await import('./profileWorkflowGraph')).executeProfileWorkflow(input);
    case 'topic':
      return (await import('./topicWorkflowGraph')).executeTopicWorkflow(input);
    case 'script':
      return (await import('./scriptWorkflowGraph')).executeScriptWorkflow(input);
    default:
      throw new Error(`未知的工作流类型: ${type}`);
  }
}

/**
 * 工作流描述信息
 */
export const WORKFLOW_DESCRIPTIONS: Record<
  WorkflowType,
  {
    name: string;
    description: string;
    steps: string[];
    complexity: 'simple' | 'medium' | 'complex';
  }
> = {
  profile: {
    name: '档案生成工作流',
    description: '采集数据并生成客户内容定位档案',
    steps: ['数据采集', '档案生成', '风险审查'],
    complexity: 'simple',
  },
  topic: {
    name: '选题生成工作流',
    description: '基于档案生成内容选题',
    steps: ['数据采集', '档案生成', '选题生成', '风险审查'],
    complexity: 'medium',
  },
  script: {
    name: '文案生成工作流',
    description: '完整的文案生成流程，包含并行审查和重写循环',
    steps: [
      '数据采集',
      '档案生成',
      '选题生成',
      '文案生成',
      '并行审查（可读性+风险）',
      '监督决策',
      '重写（如需要）',
    ],
    complexity: 'complex',
  },
};
