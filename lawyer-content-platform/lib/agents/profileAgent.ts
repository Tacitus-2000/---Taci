/**
 * 档案生成 Agent
 * 负责生成和更新客户档案
 */

import type { AgentState, AgentStateUpdate, ClientProfile, IndustryTemplate } from '../schemas/agentStateSchema';
import { createAIClient } from '../ai/client';
import { buildProfilePrompt, PROFILE_SYSTEM_PROMPT } from '../ai/prompts/profilePrompt';

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

      // 安全地记录日志
      const professionalFields = contentPosition?.professionalFields || contentPosition?.professional_fields || contentPosition?.expertise_areas;
      const targetAudience = contentPosition?.targetAudience || contentPosition?.target_audience;

      // 调试日志
      console.log('[ProfileAgent] professionalFields 类型:', typeof professionalFields, 'isArray:', Array.isArray(professionalFields));
      console.log('[ProfileAgent] professionalFields 值:', professionalFields);
      console.log('[ProfileAgent] targetAudience 类型:', typeof targetAudience, 'isArray:', Array.isArray(targetAudience));
      console.log('[ProfileAgent] targetAudience 值:', targetAudience);

      if (professionalFields && Array.isArray(professionalFields)) {
        logs.push(`[ProfileAgent] 专业领域: ${professionalFields.join('、')}`);
      } else if (professionalFields) {
        logs.push(`[ProfileAgent] 专业领域: ${String(professionalFields)}`);
      }

      if (targetAudience && Array.isArray(targetAudience)) {
        logs.push(`[ProfileAgent] 目标受众: ${targetAudience.join('、')}`);
      } else if (targetAudience) {
        logs.push(`[ProfileAgent] 目标受众: ${String(targetAudience)}`);
      }

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
   * 生成内容定位档案（使用 Claude API）
   *
   * @param state - 当前 Agent 状态
   * @returns 内容定位档案
   */
  private async generateContentPosition(state: AgentState): Promise<Record<string, unknown>> {
    const clientProfile = state.clientProfile as unknown as ClientProfile;
    const industryTemplate = state.industryTemplate as unknown as IndustryTemplate;

    // 创建 AI 客户端
    const aiClient = createAIClient();

    // 构建 Prompt
    const userPrompt = buildProfilePrompt(clientProfile, industryTemplate);

    // 调用 Claude API
    const response = await aiClient.chat(
      [{ role: 'user', content: userPrompt }],
      {
        system: PROFILE_SYSTEM_PROMPT,
        temperature: 0.7,
        maxTokens: 4096,
      }
    );

    // 解析 JSON 响应
    let contentPosition: Record<string, unknown>;
    try {
      // 尝试直接解析 JSON
      contentPosition = JSON.parse(response.content);
    } catch (error) {
      // 如果解析失败，尝试提取 JSON 代码块
      const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        contentPosition = JSON.parse(jsonMatch[1]);
      } else {
        // 输出原始响应以便调试
        console.error('[ProfileAgent] 无法解析 AI 响应');
        console.error('[ProfileAgent] 原始响应:', response.content.substring(0, 500));
        throw new Error('无法解析 AI 响应为 JSON 格式');
      }
    }

    // 验证必需字段
    const requiredFields = [
      'lawyerName',
      'experience',
      'professionalFields',
      'targetAudience',
      'contentDirection',
      'contentStyle',
      'contentStrategy',
    ];

    // 输出调试信息
    console.log('[ProfileAgent] 解析后的字段:', Object.keys(contentPosition));

    for (const field of requiredFields) {
      if (!contentPosition[field]) {
        throw new Error(`生成的内容定位档案缺少必需字段: ${field}`);
      }
    }

    return contentPosition;
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
