/**
 * 文案重写 Agent
 * 负责根据审查意见重写文案
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';

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
   * 重写文案（Mock 实现）
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
    const industryTemplate = state.industryTemplate as Record<string, unknown>;
    const complianceRules = (industryTemplate.complianceRules as Record<string, unknown>) || {};
    const disclaimer = complianceRules.requiredDisclaimer as string;

    // Mock 数据：模拟 AI 重写逻辑
    // 这里简化处理，实际应该根据具体问题进行针对性修改

    let title = originalScript.title || '';
    let hook = originalScript.hook || '';
    let body = originalScript.body || '';
    const cta = originalScript.cta || '';

    // 处理标题过长问题
    if (issues.some((i) => i.description.includes('标题过长'))) {
      title = title.substring(0, 28) + '...';
    }

    // 处理缺少免责声明问题
    let styleNote = originalScript.style_note || '';
    if (issues.some((i) => i.description.includes('免责声明')) && disclaimer) {
      styleNote = disclaimer;
    }

    // 处理绝对化用语问题
    if (issues.some((i) => i.description.includes('绝对化用语'))) {
      body = body
        .replace(/一定/g, '通常')
        .replace(/必然/g, '一般情况下')
        .replace(/保证/g, '力求')
        .replace(/100%/g, '大多数情况下')
        .replace(/绝对/g, '往往');
    }

    // 处理开头引导语问题
    if (issues.some((i) => i.description.includes('引导语'))) {
      hook = `根据我们的执业经验统计，在相关法律领域，许多企业都曾因为忽视某些关键细节而面临法律风险。今天，让我们一起探讨如何有效规避这些常见问题。`;
    }

    // 处理段落过长问题
    if (issues.some((i) => i.description.includes('段落过长'))) {
      // 简化处理：在长段落中间添加换行
      const paragraphs = body.split('\n\n');
      body = paragraphs
        .map((p) => {
          if (p.length > 300) {
            // 在句号后添加换行
            return p.replace(/。(?=[^。]{50,})/g, '。\n\n');
          }
          return p;
        })
        .join('\n\n');
    }

    // 处理缺乏结构问题
    if (issues.some((i) => i.description.includes('结构'))) {
      // 确保有清晰的标题结构
      if (!body.includes('##')) {
        body = body.replace(/一、/g, '\n## 一、').replace(/二、/g, '\n## 二、').replace(/三、/g, '\n## 三、');
      }
    }

    return {
      title,
      hook,
      body,
      cta,
      platform: originalScript.platform,
      structure_type: originalScript.structure_type,
      style_note: styleNote,
    };
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
