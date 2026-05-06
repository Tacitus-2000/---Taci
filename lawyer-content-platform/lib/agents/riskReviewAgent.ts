/**
 * 风险审查 Agent
 * 负责检查文案的合规性和法律风险
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';
import { createAIClient } from '../ai/client';
import { buildRiskPrompt, RISK_SYSTEM_PROMPT } from '../ai/prompts/riskPrompt';

/**
 * 风险审查 Agent 类
 *
 * 职责：
 * - 检查文案的合规性
 * - 识别法律风险
 * - 检测禁止内容
 * - 提供风险规避建议
 * - 记录审查结果到 state.reviews
 * - 记录日志到 state.logs
 */
export class RiskReviewAgent {
  /**
   * 执行风险审查
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push('[RiskReviewAgent] 开始风险审查');

    try {
      // 验证前置条件
      if (!state.draftScript) {
        throw new Error('缺少文案草稿数据');
      }

      if (!state.industryTemplate) {
        throw new Error('缺少行业模板数据');
      }

      logs.push('[RiskReviewAgent] 前置条件验证通过');

      // Mock: 模拟风险审查
      const reviewResult = await this.reviewRisk(state);
      logs.push(`[RiskReviewAgent] 风险评分: ${reviewResult.score}/100`);
      logs.push(`[RiskReviewAgent] 审查结果: ${reviewResult.passed ? '通过' : '未通过'}`);

      if (!reviewResult.passed) {
        logs.push(`[RiskReviewAgent] 发现 ${Object.keys(reviewResult.issues || {}).length} 个风险问题`);
      }

      // 添加审查结果到 reviews 数组
      const reviews = [
        ...state.reviews,
        {
          review_type: 'risk' as const,
          passed: reviewResult.passed,
          score: reviewResult.score,
          issues: reviewResult.issues,
          suggestions: reviewResult.suggestions,
          reviewer: 'RiskReviewAgent',
        },
      ];

      logs.push('[RiskReviewAgent] 风险审查完成');

      return {
        reviews,
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[RiskReviewAgent] 风险审查失败: ${errorMessage}`);

      return {
        logs,
        error: `风险审查失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 执行风险审查（使用 Claude API）
   *
   * @param state - 当前 Agent 状态
   * @returns 审查结果
   */
  private async reviewRisk(state: AgentState): Promise<{
    passed: boolean;
    score: number;
    issues?: Record<string, unknown>;
    suggestions?: Record<string, unknown>;
  }> {
    const draftScript = state.draftScript!;
    const industryTemplate = state.industryTemplate as Record<string, unknown>;

    // 创建 AI 客户端
    const aiClient = createAIClient();

    // 构建 Prompt
    const prompt = buildRiskPrompt(draftScript, industryTemplate);

    // 调用 Claude API
    const response = await aiClient.chat(
      [{ role: 'user', content: prompt }],
      { system: RISK_SYSTEM_PROMPT }
    );

    // 解析响应
    let reviewResult;
    try {
      // 尝试直接解析 JSON
      reviewResult = JSON.parse(response.content);
    } catch {
      // 如果失败，尝试提取 ```json 代码块
      const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        reviewResult = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('无法解析 AI 响应为 JSON 格式');
      }
    }

    // 验证必需字段
    if (
      typeof reviewResult.passed !== 'boolean' ||
      typeof reviewResult.score !== 'number'
    ) {
      throw new Error('AI 响应缺少必需字段: passed, score');
    }

    return {
      passed: reviewResult.passed,
      score: reviewResult.score,
      issues: reviewResult.issues,
      suggestions: reviewResult.suggestions,
    };
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'RiskReviewAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责检查文案的合规性和法律风险';
  }
}

/**
 * 创建风险审查 Agent 实例
 */
export function createRiskReviewAgent(): RiskReviewAgent {
  return new RiskReviewAgent();
}
