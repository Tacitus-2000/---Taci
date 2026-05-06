/**
 * 文案重写 Agent
 * 负责根据审查意见重写文案
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';
import { createAIClient } from '../ai/client';
import { buildRewritePrompt, REWRITE_SYSTEM_PROMPT } from '../ai/prompts/rewritePrompt';
import { fixChinesePunctuation } from '../utils/jsonFixer';

/**
 * 文案重写 Agent 类
 *
 * 职责：
 * - 分析审查意见
 * - 根据问题和建议重写文案
 * - 保持原有核心内容
 * - 修复合规和可读性问题
 * - 记录日志到 state.logs
 */
export class RewriteAgent {
  /**
   * 执行文案重写
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push('[RewriteAgent] 开始文案重写');

    try {
      // 验证前置条件
      if (!state.draftScript) {
        throw new Error('缺少文案草稿数据');
      }

      if (state.reviews.length === 0) {
        throw new Error('缺少审查结果数据');
      }

      // 检查是否需要重写
      const needsRewrite = state.reviews.some((review) => !review.passed);
      if (!needsRewrite) {
        logs.push('[RewriteAgent] 文案已通过所有审查，无需重写');
        return { logs };
      }

      // 检查重写次数限制
      if (state.rewriteCount >= state.maxRewriteCount) {
        logs.push(`[RewriteAgent] 已达到最大重写次数 (${state.maxRewriteCount})，停止重写`);
        return {
          logs,
          error: `已达到最大重写次数 (${state.maxRewriteCount})`,
          status: 'failed',
        };
      }

      logs.push('[RewriteAgent] 前置条件验证通过');

      // 收集审查问题
      const issues = this.collectIssues(state);
      logs.push(`[RewriteAgent] 收集到 ${issues.length} 个需要修复的问题`);

      // Mock: 模拟 AI 重写文案
      const rewrittenScript = await this.rewriteScript(state, issues);
      logs.push(`[RewriteAgent] 文案重写完成 - 标题: ${rewrittenScript.title}`);

      // 增加重写计数
      const rewriteCount = state.rewriteCount + 1;
      logs.push(`[RewriteAgent] 重写次数: ${rewriteCount}/${state.maxRewriteCount}`);

      // 清空之前的审查结果，准备重新审查
      logs.push('[RewriteAgent] 清空审查结果，准备重新审查');

      return {
        draftScript: rewrittenScript,
        rewriteCount,
        reviews: [],
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[RewriteAgent] 文案重写失败: ${errorMessage}`);

      return {
        logs,
        error: `文案重写失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 收集所有审查问题
   *
   * @param state - 当前 Agent 状态
   * @returns 问题列表
   */
  private collectIssues(state: AgentState): Array<{
    reviewType: string;
    severity: string;
    description: string;
    suggestion?: string;
  }> {
    const issues: Array<{
      reviewType: string;
      severity: string;
      description: string;
      suggestion?: string;
    }> = [];

    for (const review of state.reviews) {
      if (!review.passed && review.issues) {
        const reviewIssues = review.issues as Record<string, Record<string, unknown>>;
        const reviewSuggestions = (review.suggestions as Record<string, string>) || {};

        for (const [key, issue] of Object.entries(reviewIssues)) {
          issues.push({
            reviewType: review.review_type,
            severity: (issue.severity as string) || 'medium',
            description: (issue.description as string) || '未知问题',
            suggestion: reviewSuggestions[key],
          });
        }
      }
    }

    return issues;
  }

  /**
   * 重写文案（使用 Claude API）
   *
   * @param state - 当前 Agent 状态
   * @param issues - 需要修复的问题列表
   * @returns 重写后的文案
   */
  private async rewriteScript(
    state: AgentState,
    issues: Array<{
      reviewType: string;
      severity: string;
      description: string;
      suggestion?: string;
    }>
  ): Promise<{
    title: string;
    hook?: string;
    body?: string;
    cta?: string;
    platform?: string;
    structure_type?: string;
    style_note?: string;
  }> {
    const originalScript = state.draftScript!;

    // 构建 Prompt
    const prompt = buildRewritePrompt(originalScript, state.reviews);

    // 调用 Claude API
    const aiClient = createAIClient();
    const response = await aiClient.chat(
      [{ role: 'user', content: prompt }],
      {
        system: REWRITE_SYSTEM_PROMPT,
        maxTokens: 8000  // 增加 token 限制，确保完整响应
      }
    );

    // 解析响应
    let rewrittenScript: {
      title: string;
      hook?: string;
      body?: string;
      cta?: string;
      platform?: string;
      structure_type?: string;
      style_note?: string;
    };

    try {
      // 尝试直接解析 JSON
      rewrittenScript = JSON.parse(response.content);
    } catch (parseError) {
      // 尝试提取 ```json 代码块
      const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1].trim();

        // 修复常见的 JSON 格式问题
        const fixedJson = fixChinesePunctuation(jsonContent);

        try {
          rewrittenScript = JSON.parse(fixedJson);
        } catch (blockError) {

          // 尝试进一步修复 JSON
          // 1. 检查是否被截断（缺少结束的 } 或 "）
          let fixedJson2 = fixedJson;

          // 如果 JSON 不完整，尝试补全
          const openBraces = (fixedJson2.match(/{/g) || []).length;
          const closeBraces = (fixedJson2.match(/}/g) || []).length;

          if (openBraces > closeBraces) {
            // 补全缺失的右括号
            fixedJson2 += '\n'.repeat(openBraces - closeBraces) + '}'.repeat(openBraces - closeBraces);
          }

          // 检查最后一个字段是否缺少引号
          if (!fixedJson2.trim().endsWith('}') && !fixedJson2.trim().endsWith('"')) {
            fixedJson2 += '"';
          }

          try {
            rewrittenScript = JSON.parse(fixedJson2);
          } catch (fixError) {
            // 记录详细错误信息用于调试
            console.error('原始响应长度:', response.content.length);
            console.error('JSON 内容长度:', jsonContent.length);
            console.error('JSON 解析失败:', fixError instanceof Error ? fixError.message : '未知错误');
            throw new Error(`无法解析 AI 响应为 JSON 格式: ${blockError instanceof Error ? blockError.message : '未知错误'}`);
          }
        }
      } else {
        // 没有找到代码块，记录响应内容
        console.error('未找到 JSON 代码块，响应长度:', response.content.length);
        throw new Error('AI 响应中未找到 JSON 格式内容');
      }
    }

    // 验证必需字段
    const requiredFields = ['title', 'hook', 'body', 'cta'];
    for (const field of requiredFields) {
      if (!rewrittenScript[field as keyof typeof rewrittenScript]) {
        throw new Error(`重写后的文案缺少必需字段: ${field}`);
      }
    }

    return rewrittenScript;
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'RewriteAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责根据审查意见重写文案';
  }
}

/**
 * 创建文案重写 Agent 实例
 */
export function createRewriteAgent(): RewriteAgent {
  return new RewriteAgent();
}
