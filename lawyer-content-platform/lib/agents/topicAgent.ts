/**
 * 选题生成 Agent
 * 负责基于客户档案和行业模板生成内容选题
 */

import type { AgentState, AgentStateUpdate } from '../schemas/agentStateSchema';

/**
 * 选题生成 Agent 类
 *
 * 职责：
 * - 分析客户档案和行业模板
 * - 生成符合定位的内容选题
 * - 选择最佳选题
 * - 记录日志到 state.logs
 */
export class TopicAgent {
  /**
   * 执行选题生成
   *
   * @param state - 当前 Agent 状态
   * @returns 状态更新对象
   */
  async execute(state: AgentState): Promise<AgentStateUpdate> {
    const logs: string[] = [...state.logs];
    logs.push('[TopicAgent] 开始选题生成');

    try {
      // 验证前置条件
      if (!state.clientProfile) {
        throw new Error('缺少客户档案数据');
      }

      if (!state.industryTemplate) {
        throw new Error('缺少行业模板数据');
      }

      logs.push('[TopicAgent] 前置条件验证通过');

      // Mock: 模拟 AI 生成选题
      const topics = await this.generateTopics(state);
      logs.push(`[TopicAgent] 生成了 ${topics.length} 个候选选题`);

      // 选择最佳选题
      const selectedTopic = this.selectBestTopic(topics);
      logs.push(`[TopicAgent] 选择最佳选题: ${selectedTopic.title}`);

      logs.push('[TopicAgent] 选题生成完成');

      return {
        selectedTopic,
        logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logs.push(`[TopicAgent] 选题生成失败: ${errorMessage}`);

      return {
        logs,
        error: `选题生成失败: ${errorMessage}`,
        status: 'failed',
      };
    }
  }

  /**
   * 生成选题列表（Mock 实现）
   *
   * @param state - 当前 Agent 状态
   * @returns 选题列表
   */
  private async generateTopics(state: AgentState): Promise<Array<Record<string, unknown>>> {
    // Mock 数据：模拟 AI 生成的选题
    const clientProfile = state.clientProfile as Record<string, unknown>;
    const expertise = (clientProfile.expertise as string[]) || ['法律咨询'];

    return [
      {
        id: 'topic-1',
        title: `${expertise[0]}中的常见误区与风险防范`,
        description: `深入解析${expertise[0]}领域中企业和个人常犯的错误，提供专业的风险防范建议`,
        targetAudience: '中小企业主、创业者',
        keywords: [expertise[0], '风险防范', '法律误区', '合规建议'],
        difficulty: 'intermediate',
        estimatedLength: 1200,
        relevanceScore: 0.92,
        engagementPotential: 0.85,
      },
      {
        id: 'topic-2',
        title: `2026年${expertise[0]}新规解读与应对策略`,
        description: `解读最新法律法规变化，分析对企业的影响，提供实用的应对方案`,
        targetAudience: '企业法务、HR、财务人员',
        keywords: [expertise[0], '新规解读', '合规应对', '政策分析'],
        difficulty: 'advanced',
        estimatedLength: 1500,
        relevanceScore: 0.88,
        engagementPotential: 0.90,
      },
      {
        id: 'topic-3',
        title: `${expertise[0]}实战案例：如何避免这些致命错误`,
        description: `通过真实案例分析，揭示常见法律风险，提供可操作的解决方案`,
        targetAudience: '企业管理者、创业者',
        keywords: [expertise[0], '案例分析', '实战经验', '风险规避'],
        difficulty: 'beginner',
        estimatedLength: 1000,
        relevanceScore: 0.95,
        engagementPotential: 0.88,
      },
    ];
  }

  /**
   * 选择最佳选题
   *
   * @param topics - 候选选题列表
   * @returns 最佳选题
   */
  private selectBestTopic(topics: Array<Record<string, unknown>>): Record<string, unknown> {
    // 根据相关性分数和互动潜力选择最佳选题
    const sortedTopics = topics.sort((a, b) => {
      const scoreA = (a.relevanceScore as number) * 0.6 + (a.engagementPotential as number) * 0.4;
      const scoreB = (b.relevanceScore as number) * 0.6 + (b.engagementPotential as number) * 0.4;
      return scoreB - scoreA;
    });

    return sortedTopics[0];
  }

  /**
   * 获取 Agent 名称
   */
  getName(): string {
    return 'TopicAgent';
  }

  /**
   * 获取 Agent 描述
   */
  getDescription(): string {
    return '负责基于客户档案和行业模板生成内容选题';
  }
}

/**
 * 创建选题生成 Agent 实例
 */
export function createTopicAgent(): TopicAgent {
  return new TopicAgent();
}
