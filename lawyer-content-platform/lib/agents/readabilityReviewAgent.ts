/**
 * 可读性审查 Agent
 * 负责检查文案的可读性和用户体验
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';

/**
 * 可读性审查 Agent 类
 *
 * 职责：
 * - 检查文案的可读性
 * - 评估用户体验
 * - 提供改进建议
 * - 记录审查结果到 state.reviews
 * - 记录日志到 state.logs
 */
export class ReadabilityReviewAgent {
  /**
   * 执行可读性审查
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push('[ReadabilityReviewAgent] 开始可读性审查');

    try {
      // 验证前置条件
      if (!state.draftScript) {
        throw new Error('缺少文案草稿数据');
      }

      logs.push('[ReadabilityReviewAgent] 前置条件验证通过');

      // Mock: 模拟可读性审查
      const reviewResult = await this.reviewReadability(state);
      logs.push(`[ReadabilityReviewAgent] 可读性评分: ${reviewResult.score}/100`);
      logs.push(`[ReadabilityReviewAgent] 审查结果: ${reviewResult.passed ? '通过' : '未通过'}`);

      if (!reviewResult.passed) {
        logs.push(`[ReadabilityReviewAgent] 发现 ${Object.keys(reviewResult.issues || {}).length} 个问题`);
      }

      // 添加审查结果到 reviews 数组
      const reviews = [
        ...state.reviews,
        {
          review_type: 'readability' as const,
          passed: reviewResult.passed,
          score: reviewResult.score,
          issues: reviewResult.issues,
          suggestions: reviewResult.suggestions,
          reviewer: 'ReadabilityReviewAgent',
        },
      ];

      logs.push('[ReadabilityReviewAgent] 可读性审查完成');

      return {
        reviews,
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[ReadabilityReviewAgent] 可读性审查失败: ${errorMessage}`);

      return {
        logs,
        error: `可读性审查失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 执行可读性审查（Mock 实现）
   *
   * @param state - 当前 Agent 状态
   * @returns 审查结果
   */
  private async reviewReadability(state: AgentState): Promise<{
    passed: boolean;
    score: number;
    issues?: Record<string, unknown>;
    suggestions?: Record<string, unknown>;
  }> {
    const draftScript = state.draftScript!;
    const title = draftScript.title || '';
    const body = draftScript.body || '';
    const hook = draftScript.hook || '';

    // Mock 数据：模拟可读性审查逻辑
    const issues: Record<string, unknown> = {};
    const suggestions: Record<string, unknown> = {};
    let score = 100;

    // 检查标题长度
    if (title.length > 30) {
      issues.titleTooLong = {
        severity: 'medium',
        description: '标题过长，建议控制在30字以内',
        currentLength: title.length,
      };
      suggestions.titleOptimization = '建议精简标题，突出核心关键词';
      score -= 10;
    }

    // 检查段落长度
    const paragraphs = body.split('\n\n').filter((p) => p.trim().length > 0);
    const longParagraphs = paragraphs.filter((p) => p.length > 300);
    if (longParagraphs.length > 0) {
      issues.longParagraphs = {
        severity: 'low',
        description: '部分段落过长，影响阅读体验',
        count: longParagraphs.length,
      };
      suggestions.paragraphBreaking = '建议将长段落拆分为多个短段落，每段控制在200字以内';
      score -= 5;
    }

    // 检查是否有引导语
    if (!hook || hook.length < 20) {
      issues.weakHook = {
        severity: 'medium',
        description: '开头引导语不够吸引人',
      };
      suggestions.hookImprovement = '建议增强开头的吸引力，使用问题、数据或故事引入';
      score -= 10;
    }

    // 检查结构清晰度
    const hasHeadings = body.includes('##') || body.includes('**');
    if (!hasHeadings) {
      issues.lackStructure = {
        severity: 'high',
        description: '文案缺乏清晰的结构层次',
      };
      suggestions.structureImprovement = '建议使用标题、加粗等格式增强结构层次感';
      score -= 15;
    }

    // 检查专业术语密度
    const technicalTerms = ['法律效力', '违约责任', '争议解决', '知识产权'];
    const termCount = technicalTerms.filter((term) => body.includes(term)).length;
    if (termCount > 5) {
      issues.tooManyTerms = {
        severity: 'low',
        description: '专业术语过多，可能影响普通读者理解',
        termCount,
      };
      suggestions.simplification = '建议适当简化专业术语，或增加通俗解释';
      score -= 5;
    }

    const passed = score >= 70;

    return {
      passed,
      score,
      issues: Object.keys(issues).length > 0 ? issues : undefined,
      suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'ReadabilityReviewAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责检查文案的可读性和用户体验';
  }
}

/**
 * 创建可读性审查 Agent 实例
 */
export function createReadabilityReviewAgent(): ReadabilityReviewAgent {
  return new ReadabilityReviewAgent();
}
