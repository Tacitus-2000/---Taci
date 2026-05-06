/**
 * 选题生成 Agent
 * 负责基于客户档案和行业模板生成内容选题
 */

import type { AgentState, AgentStateUpdate, ClientProfile, IndustryTemplate } from '../schemas/agentStateSchema';
import { createAIClient } from '../ai/client';
import { buildTopicPrompt, TOPIC_SYSTEM_PROMPT } from '../ai/prompts/topicPrompt';

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
   * 生成选题列表（使用 Claude API）
   *
   * @param state - 当前 Agent 状态
   * @returns 选题列表
   */
  private async generateTopics(state: AgentState): Promise<Array<Record<string, unknown>>> {
    const clientProfile = state.clientProfile as Record<string, any>;
    const industryTemplate = state.industryTemplate as Record<string, any>;

    // 构建 Prompt
    const prompt = buildTopicPrompt(clientProfile, industryTemplate);

    // 调用 AI 客户端
    const aiClient = createAIClient();
    const response = await aiClient.chat(
      [{ role: 'user', content: prompt }],
      { system: TOPIC_SYSTEM_PROMPT }
    );

    // 解析响应
    const content = response.content;
    let topicsData: { topics: Array<Record<string, unknown>> };

    try {
      // 尝试直接解析 JSON
      topicsData = JSON.parse(content);
    } catch {
      // 如果失败，尝试提取 JSON 代码块
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        topicsData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('无法解析 AI 响应为 JSON 格式');
      }
    }

    // 验证响应格式
    if (!topicsData.topics || !Array.isArray(topicsData.topics)) {
      throw new Error('AI 响应格式错误：缺少 topics 数组');
    }

    // 验证每个选题的必需字段
    const requiredFields = ['id', 'title', 'description', 'targetAudience', 'keywords', 'difficulty', 'estimatedLength', 'scores'];
    for (const topic of topicsData.topics) {
      for (const field of requiredFields) {
        if (!(field in topic)) {
          throw new Error(`选题缺少必需字段: ${field}`);
        }
      }

      // 验证 scores 对象
      const scores = topic.scores as Record<string, unknown>;
      const requiredScores = ['engagement', 'relevance', 'uniqueness', 'feasibility', 'total'];
      for (const scoreField of requiredScores) {
        if (!(scoreField in scores)) {
          throw new Error(`选题评分缺少必需字段: ${scoreField}`);
        }
      }
    }

    return topicsData.topics;
  }

  /**
   * 选择最佳选题
   *
   * @param topics - 候选选题列表
   * @returns 最佳选题
   */
  private selectBestTopic(topics: Array<Record<string, unknown>>): Record<string, unknown> {
    // 根据总分选择最佳选题
    const sortedTopics = topics.sort((a, b) => {
      const scoresA = a.scores as Record<string, number>;
      const scoresB = b.scores as Record<string, number>;
      return scoresB.total - scoresA.total;
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
