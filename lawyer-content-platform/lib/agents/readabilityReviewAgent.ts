/**
 * 可读性审查 Agent
 * 负责检查文案的可读性和用户体验
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';
import { createAIClient } from '../ai/client';
import { buildReadabilityPrompt, READABILITY_SYSTEM_PROMPT } from '../ai/prompts/readabilityPrompt';

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
   * 执行可读性审查（使用 Claude API）
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

    // 构建 Prompt
    const prompt = buildReadabilityPrompt(draftScript as Record<string, any>);

    // 调用 Claude API
    const aiClient = createAIClient();
    const response = await aiClient.chat(
      [{ role: 'user', content: prompt }],
      { system: READABILITY_SYSTEM_PROMPT }
    );

    // 解析 JSON 响应
    let result: any;
    const responseContent = response.content;
    try {
      // 尝试直接解析
      result = JSON.parse(responseContent);
    } catch {
      // 尝试提取 ```json 代码块
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('无法解析 API 响应为 JSON 格式');
      }
    }

    // 验证必需字段
    if (typeof result.passed !== 'boolean') {
      throw new Error('响应缺少必需字段: passed');
    }
    if (typeof result.score !== 'number') {
      throw new Error('响应缺少必需字段: score');
    }

    return {
      passed: result.passed,
      score: result.score,
      issues: result.issues,
      suggestions: result.suggestions,
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
