/**
 * 风险审查 Agent
 * 负责检查文案的合规性和法律风险
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';

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
   * 执行风险审查（Mock 实现）
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
    const complianceRules = (industryTemplate.complianceRules as Record<string, unknown>) || {};

    const title = draftScript.title || '';
    const body = draftScript.body || '';
    const hook = draftScript.hook || '';
    const fullText = `${title} ${hook} ${body}`;

    // Mock 数据：模拟风险审查逻辑
    const issues: Record<string, unknown> = {};
    const suggestions: Record<string, unknown> = {};
    let score = 100;

    // 检查禁止话题
    const prohibitedTopics = (complianceRules.prohibitedTopics as string[]) || [
      '虚假承诺',
      '保证胜诉',
    ];
    const foundProhibited = prohibitedTopics.filter((topic) => fullText.includes(topic));
    if (foundProhibited.length > 0) {
      issues.prohibitedContent = {
        severity: 'critical',
        description: '文案包含禁止内容',
        foundTopics: foundProhibited,
      };
      suggestions.removeProhibited = `必须删除以下禁止内容: ${foundProhibited.join('、')}`;
      score -= 50;
    }

    // 检查是否包含免责声明
    const disclaimer = complianceRules.requiredDisclaimer as string;
    if (disclaimer && !fullText.includes(disclaimer) && !draftScript.style_note?.includes(disclaimer)) {
      issues.missingDisclaimer = {
        severity: 'high',
        description: '缺少必需的免责声明',
      };
      suggestions.addDisclaimer = `必须添加免责声明: ${disclaimer}`;
      score -= 20;
    }

    // 检查绝对化用语
    const absoluteWords = ['一定', '必然', '保证', '100%', '绝对'];
    const foundAbsolute = absoluteWords.filter((word) => fullText.includes(word));
    if (foundAbsolute.length > 0) {
      issues.absoluteLanguage = {
        severity: 'medium',
        description: '使用了绝对化用语，可能引发法律风险',
        foundWords: foundAbsolute,
      };
      suggestions.softLanguage = '建议使用更谨慎的表述，如"通常"、"一般情况下"等';
      score -= 15;
    }

    // 检查是否涉及具体案件承诺
    const promisePatterns = ['保证赢', '必胜', '包赢', '一定成功'];
    const foundPromises = promisePatterns.filter((pattern) => fullText.includes(pattern));
    if (foundPromises.length > 0) {
      issues.illegalPromises = {
        severity: 'critical',
        description: '包含违规承诺，违反律师执业规范',
        foundPromises,
      };
      suggestions.removePromises = '必须删除所有关于案件结果的承诺性表述';
      score -= 40;
    }

    // 检查是否贬低同行
    const negativeWords = ['其他律师都不行', '只有我能', '别的律师不懂'];
    const foundNegative = negativeWords.filter((word) => fullText.includes(word));
    if (foundNegative.length > 0) {
      issues.unprofessionalLanguage = {
        severity: 'high',
        description: '包含贬低同行的不当言论',
        foundWords: foundNegative,
      };
      suggestions.professionalTone = '建议使用专业、客观的表述，避免贬低同行';
      score -= 25;
    }

    // 检查是否包含敏感信息
    const sensitivePatterns = [
      /\d{11}/g, // 手机号
      /\d{15}|\d{18}/g, // 身份证号
      /具体金额.*\d+万/g, // 具体金额
    ];
    const hasSensitiveInfo = sensitivePatterns.some((pattern) => pattern.test(fullText));
    if (hasSensitiveInfo) {
      issues.sensitiveInformation = {
        severity: 'high',
        description: '可能包含敏感个人信息或具体金额',
      };
      suggestions.anonymize = '建议对敏感信息进行脱敏处理';
      score -= 20;
    }

    const passed = score >= 80 && !issues.prohibitedContent && !issues.illegalPromises;

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
