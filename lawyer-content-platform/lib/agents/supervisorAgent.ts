/**
 * 工作流协调 Agent (Supervisor)
 * 负责协调整个多 Agent 工作流程
 */

import type { AgentState } from '../schemas/agentStateSchema';

/**
 * 工作流步骤枚举
 */
export type WorkflowStep =
  | 'data_collection'
  | 'profile_generation'
  | 'topic_generation'
  | 'script_generation'
  | 'readability_review'
  | 'risk_review'
  | 'rewrite'
  | 'completed'
  | 'failed';

/**
 * 工作流协调 Agent 类
 *
 * 职责：
 * - 决定下一步执行哪个 Agent
 * - 检查工作流完成条件
 * - 处理审查失败和重写逻辑
 * - 记录日志到 state.logs
 */
export class SupervisorAgent {
  /**
   * 决定下一步执行的 Agent
   *
   * @param state - 当前 Agent 状态
   * @returns 下一步要执行的 Agent 名称，或 'completed'/'failed'
   */
  async execute(state: AgentState): Promise<{
    nextAgent: WorkflowStep;
    reason: string;
  }> {
    const logs: string[] = [...state.logs];
    logs.push('[SupervisorAgent] 开始工作流协调');

    try {
      // 检查是否有错误
      if (state.error) {
        logs.push(`[SupervisorAgent] 检测到错误: ${state.error}`);
        return {
          nextAgent: 'failed',
          reason: `工作流失败: ${state.error}`,
        };
      }

      // 决定下一步
      const nextStep = this.determineNextStep(state);
      logs.push(`[SupervisorAgent] 决定下一步: ${nextStep.nextAgent} - ${nextStep.reason}`);

      return nextStep;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[SupervisorAgent] 协调失败: ${errorMessage}`);

      return {
        nextAgent: 'failed',
        reason: `工作流协调失败: ${errorMessage}`,
      };
    }
  }

  /**
   * 决定下一步执行的步骤
   *
   * @param state - 当前 Agent 状态
   * @returns 下一步信息
   */
  private determineNextStep(state: AgentState): {
    nextAgent: WorkflowStep;
    reason: string;
  } {
    // 步骤 1: 数据采集
    if (!state.industryTemplate || !state.clientProfile) {
      return {
        nextAgent: 'data_collection',
        reason: '需要采集行业模板和客户档案数据',
      };
    }

    // 步骤 2: 档案生成
    if (!state.contentPosition) {
      return {
        nextAgent: 'profile_generation',
        reason: '需要生成客户内容定位档案',
      };
    }

    // 步骤 3: 选题生成
    if (!state.selectedTopic) {
      return {
        nextAgent: 'topic_generation',
        reason: '需要生成内容选题',
      };
    }

    // 步骤 4: 文案生成
    if (!state.draftScript) {
      return {
        nextAgent: 'script_generation',
        reason: '需要生成文案草稿',
      };
    }

    // 步骤 5: 审查流程
    const hasReadabilityReview = state.reviews.some((r) => r.review_type === 'readability');
    const hasRiskReview = state.reviews.some((r) => r.review_type === 'risk');

    // 如果还没有进行可读性审查
    if (!hasReadabilityReview) {
      return {
        nextAgent: 'readability_review',
        reason: '需要进行可读性审查',
      };
    }

    // 如果还没有进行风险审查
    if (!hasRiskReview) {
      return {
        nextAgent: 'risk_review',
        reason: '需要进行风险审查',
      };
    }

    // 步骤 6: 检查审查结果
    const allReviewsPassed = state.reviews.every((r) => r.passed);

    if (!allReviewsPassed) {
      // 检查是否已达到最大重写次数
      if (state.rewriteCount >= state.maxRewriteCount) {
        return {
          nextAgent: 'failed',
          reason: `已达到最大重写次数 (${state.maxRewriteCount})，但仍未通过审查`,
        };
      }

      // 需要重写
      return {
        nextAgent: 'rewrite',
        reason: `审查未通过，需要重写 (第 ${state.rewriteCount + 1}/${state.maxRewriteCount} 次)`,
      };
    }

    // 步骤 7: 所有步骤完成
    return {
      nextAgent: 'completed',
      reason: '所有步骤完成，文案已通过所有审查',
    };
  }

  /**
   * 获取工作流进度摘要
   *
   * @param state - 当前 Agent 状态
   * @returns 进度摘要
   */
  getProgressSummary(state: AgentState): {
    completedSteps: string[];
    currentStep: string;
    totalSteps: number;
    progress: number;
  } {
    const completedSteps: string[] = [];
    let currentStep = '初始化';

    if (state.industryTemplate && state.clientProfile) {
      completedSteps.push('数据采集');
    }

    if (state.contentPosition) {
      completedSteps.push('档案生成');
    }

    if (state.selectedTopic) {
      completedSteps.push('选题生成');
    }

    if (state.draftScript) {
      completedSteps.push('文案生成');
    }

    const hasReadabilityReview = state.reviews.some((r) => r.review_type === 'readability');
    const hasRiskReview = state.reviews.some((r) => r.review_type === 'risk');

    if (hasReadabilityReview) {
      completedSteps.push('可读性审查');
    }

    if (hasRiskReview) {
      completedSteps.push('风险审查');
    }

    const allReviewsPassed = state.reviews.length > 0 && state.reviews.every((r) => r.passed);
    if (allReviewsPassed) {
      completedSteps.push('审查通过');
      currentStep = '已完成';
    } else if (state.reviews.length > 0 && !allReviewsPassed) {
      currentStep = '重写中';
    } else if (hasRiskReview) {
      currentStep = '审查中';
    } else if (state.draftScript) {
      currentStep = '审查中';
    } else if (state.selectedTopic) {
      currentStep = '文案生成';
    } else if (state.contentPosition) {
      currentStep = '选题生成';
    } else if (state.industryTemplate && state.clientProfile) {
      currentStep = '档案生成';
    } else {
      currentStep = '数据采集';
    }

    const totalSteps = 7; // 数据采集、档案生成、选题生成、文案生成、可读性审查、风险审查、完成
    const progress = Math.round((completedSteps.length / totalSteps) * 100);

    return {
      completedSteps,
      currentStep,
      totalSteps,
      progress,
    };
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'SupervisorAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责协调整个多 Agent 工作流程';
  }
}

/**
 * 创建工作流协调 Agent 实例
 */
export function createSupervisorAgent(): SupervisorAgent {
  return new SupervisorAgent();
}
