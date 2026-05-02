/**
 * 档案生成 Agent
 * 负责生成和更新客户档案
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';

/**
 * 档案生成 Agent 类
 *
 * 职责：
 * - 分析客户基础信息
 * - 生成客户内容定位档案
 * - 提取专业领域和目标受众
 * - 记录日志到 state.logs
 */
export class ProfileAgent {
  /**
   * 执行档案生成
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push('[ProfileAgent] 开始档案生成');

    try {
      // 验证前置条件
      if (!state.clientProfile) {
        throw new Error('缺少客户基础信息');
      }

      if (!state.industryTemplate) {
        throw new Error('缺少行业模板数据');
      }

      logs.push('[ProfileAgent] 前置条件验证通过');

      // Mock: 模拟 AI 生成内容定位档案
      const contentPosition = await this.generateContentPosition(state);
      logs.push('[ProfileAgent] 成功生成内容定位档案');
      logs.push(`[ProfileAgent] 专业领域: ${(contentPosition.professionalFields as string[]).join('、')}`);
      logs.push(`[ProfileAgent] 目标受众: ${(contentPosition.targetAudience as string[]).join('、')}`);

      logs.push('[ProfileAgent] 档案生成完成');

      return {
        contentPosition,
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[ProfileAgent] 档案生成失败: ${errorMessage}`);

      return {
        logs,
        error: `档案生成失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 生成内容定位档案（Mock 实现）
   *
   * @param state - 当前 Agent 状态
   * @returns 内容定位档案
   */
  private async generateContentPosition(state: AgentState): Promise<Record<string, unknown>> {
    const clientProfile = state.clientProfile as Record<string, unknown>;
    const industryTemplate = state.industryTemplate as Record<string, unknown>;

    const name = clientProfile.name as string;
    const expertise = (clientProfile.expertise as string[]) || ['法律咨询'];
    const experience = clientProfile.experience as string;
    const targetAudience = clientProfile.targetAudience as string;
    const contentPreferences = (clientProfile.contentPreferences as Record<string, unknown>) || {};
    const previousContent = (clientProfile.previousContent as Record<string, unknown>) || {};

    const contentGuidelines = (industryTemplate.contentGuidelines as Record<string, unknown>) || {};
    const platformSettings = (industryTemplate.platformSettings as Record<string, unknown>) || {};

    // Mock 数据：模拟 AI 分析生成的内容定位
    return {
      // 基础信息
      lawyerName: name,
      experience,

      // 专业领域定位
      professionalFields: expertise,
      coreCompetencies: expertise.map((field) => `${field}实务操作`),
      serviceScope: ['企业法律顾问', '合同审查', '诉讼代理', '法律咨询'],

      // 目标受众定位
      targetAudience: [targetAudience, '企业管理者', '创业者', '法务人员'],
      audienceCharacteristics: {
        industry: ['互联网', '制造业', '服务业'],
        companySize: ['中小企业', '初创公司'],
        painPoints: ['合同风险', '合规问题', '纠纷处理', '知识产权保护'],
      },

      // 内容方向定位
      contentDirection: [
        '实用法律知识普及',
        '案例分析与风险提示',
        '法律法规解读',
        '企业合规指南',
      ],
      contentTopics: contentPreferences.topics || [
        '合同风险防范',
        '劳动用工管理',
        '知识产权保护',
        '股权设计',
      ],

      // 内容风格定位
      contentStyle: {
        tone: contentGuidelines.tone || 'professional',
        language: '专业但易懂',
        format: ['图文结合', '案例分析', '要点总结'],
        length: platformSettings.contentLength || { medium: '1000-1500字' },
      },

      // 独特优势
      uniqueAdvantages: [
        `${experience}的丰富实战经验`,
        `精通${expertise.join('、')}等多个领域`,
        '擅长将复杂法律问题简单化',
        '注重实用性和可操作性',
      ],

      // 内容策略
      contentStrategy: {
        frequency: contentPreferences.frequency || 'weekly',
        platforms: platformSettings.preferredPlatforms || ['微信公众号', '知乎'],
        focusAreas: expertise,
        differentiationPoints: ['实战案例', '风险预防', '合规指导'],
      },

      // 历史表现分析
      performanceInsights: {
        totalPosts: previousContent.totalPosts || 0,
        avgEngagement: previousContent.avgEngagement || 0,
        topPerformingTopics: previousContent.topPerformingTopics || [],
        recommendedImprovement: [
          '增加案例分析类内容',
          '强化互动性',
          '优化标题吸引力',
        ],
      },

      // 推荐选题方向
      recommendedTopics: [
        `${expertise[0]}实务中的常见误区`,
        `2026年${expertise[0]}新规解读`,
        `${expertise[0]}风险防范指南`,
        `${expertise[0]}案例分析系列`,
      ],

      // 生成时间戳
      generatedAt: new Date().toISOString(),
      version: '1.0',
    };
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'ProfileAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责生成和更新客户档案';
  }
}

/**
 * 创建档案生成 Agent 实例
 */
export function createProfileAgent(): ProfileAgent {
  return new ProfileAgent();
}
