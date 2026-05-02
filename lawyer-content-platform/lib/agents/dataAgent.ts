/**
 * 数据采集 Agent
 * 负责收集客户和行业数据
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';

/**
 * 数据采集 Agent 类
 *
 * 职责：
 * - 从数据库加载行业模板数据
 * - 从数据库加载客户档案数据
 * - 验证数据完整性
 * - 记录日志到 state.logs
 */
export class DataAgent {
  /**
   * 执行数据采集
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push(`[DataAgent] 开始数据采集 - clientId: ${state.clientId}, industryId: ${state.industryId}`);

    try {
      // Mock: 模拟从数据库加载行业模板
      const industryTemplate = await this.loadIndustryTemplate(state.industryId);
      logs.push(`[DataAgent] 成功加载行业模板 - industryId: ${state.industryId}`);

      // Mock: 模拟从数据库加载客户档案
      const clientProfile = await this.loadClientProfile(state.clientId);
      logs.push(`[DataAgent] 成功加载客户档案 - clientId: ${state.clientId}`);

      // 验证数据完整性
      this.validateData(industryTemplate, clientProfile);
      logs.push('[DataAgent] 数据验证通过');

      logs.push('[DataAgent] 数据采集完成');

      return {
        industryTemplate,
        clientProfile,
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[DataAgent] 数据采集失败: ${errorMessage}`);

      return {
        logs,
        error: `数据采集失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 从数据库加载行业模板（Mock 实现）
   *
   * @param industryId - 行业 ID
   * @returns 行业模板数据
   */
  private async loadIndustryTemplate(industryId: string): Promise<Record<string, unknown>> {
    // Mock 数据：模拟行业模板
    return {
      id: industryId,
      name: '法律服务行业',
      description: '专业法律咨询与服务',
      contentGuidelines: {
        tone: 'professional',
        style: 'formal',
        targetAudience: ['企业客户', '个人客户'],
        keywords: ['法律咨询', '合同审查', '诉讼代理'],
      },
      complianceRules: {
        prohibitedTopics: ['虚假承诺', '保证胜诉'],
        requiredDisclaimer: '本内容仅供参考，不构成正式法律意见',
      },
      platformSettings: {
        preferredPlatforms: ['微信公众号', '知乎', '小红书'],
        contentLength: {
          short: '500-800字',
          medium: '1000-1500字',
          long: '2000-3000字',
        },
      },
    };
  }

  /**
   * 从数据库加载客户档案（Mock 实现）
   *
   * @param clientId - 客户 ID
   * @returns 客户档案数据
   */
  private async loadClientProfile(clientId: string): Promise<Record<string, unknown>> {
    // Mock 数据：模拟客户档案
    return {
      id: clientId,
      name: '张律师',
      expertise: ['合同法', '公司法', '知识产权'],
      experience: '10年执业经验',
      targetAudience: '中小企业主',
      contentPreferences: {
        style: 'professional',
        topics: ['合同风险', '股权设计', '商标保护'],
        frequency: 'weekly',
      },
      previousContent: {
        totalPosts: 45,
        avgEngagement: 0.08,
        topPerformingTopics: ['劳动合同', '股权激励', '商标注册'],
      },
    };
  }

  /**
   * 验证数据完整性
   *
   * @param industryTemplate - 行业模板数据
   * @param clientProfile - 客户档案数据
   * @throws 如果数据不完整则抛出错误
   */
  private validateData(
    industryTemplate: Record<string, unknown>,
    clientProfile: Record<string, unknown>
  ): void {
    if (!industryTemplate || typeof industryTemplate !== 'object') {
      throw new Error('行业模板数据无效');
    }

    if (!clientProfile || typeof clientProfile !== 'object') {
      throw new Error('客户档案数据无效');
    }

    // 验证必需字段
    if (!industryTemplate.name) {
      throw new Error('行业模板缺少 name 字段');
    }

    if (!clientProfile.name) {
      throw new Error('客户档案缺少 name 字段');
    }
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'DataAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责收集客户和行业数据';
  }
}

/**
 * 创建数据采集 Agent 实例
 */
export function createDataAgent(): DataAgent {
  return new DataAgent();
}
